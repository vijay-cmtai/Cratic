"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Download,
  Loader2,
  Gem,
  Award,
  Ruler,
  User,
  Calendar,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamondById,
  fetchDiamondByStockId,
  resetSingleDiamond,
} from "@/lib/features/inventory/inventorySlice";

const placeholderImage = "/placeholder-diamond.jpg";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    singleDiamond: currentDiamond,
    singleStatus,
    singleError,
  } = useSelector((state: RootState) => state.inventory);

  const [imageError, setImageError] = useState(false);

  const isLoading = singleStatus === "loading";
  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      // A standard MongoDB ObjectId is always 24 hexadecimal characters.
      // This is a more reliable check than simply checking if it starts with a letter.
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(productId);

      if (isMongoId) {
        dispatch(fetchDiamondById(productId));
      } else {
        dispatch(fetchDiamondByStockId(productId));
      }
    }

    // Cleanup function: Reset the singleDiamond state when the component unmounts.
    // This prevents showing stale data on subsequent navigation.
    return () => {
      dispatch(resetSingleDiamond());
    };
  }, [dispatch, productId]);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading diamond details...</p>
        </div>
      </div>
    );
  }

  if (singleError || !currentDiamond) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <Gem className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Diamond Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {singleError ||
              "The diamond you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const diamond = currentDiamond;
  const specifications = [
    { label: "Stock ID", value: diamond.stockId },
    { label: "Shape", value: diamond.shape },
    { label: "Carat", value: `${diamond.carat?.toFixed(2)} ct` },
    { label: "Color", value: diamond.color },
    { label: "Clarity", value: diamond.clarity },
    { label: "Cut", value: diamond.cut || "N/A" },
    { label: "Polish", value: diamond.polish || "N/A" },
    { label: "Symmetry", value: diamond.symmetry || "N/A" },
    { label: "Lab", value: diamond.lab },
    { label: "Certificate #", value: diamond.reportNumber },
  ];

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {diamond.shape} {diamond.carat?.toFixed(2)}ct {diamond.color}{" "}
            {diamond.clarity}
          </h1>
          <p className="text-muted-foreground">Stock ID: {diamond.stockId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={() => router.push(`/admin/inventory/edit/${diamond._id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={
                  !imageError && diamond.imageLink
                    ? diamond.imageLink
                    : placeholderImage
                }
                alt={`${diamond.shape} Diamond`}
                fill
                className="object-cover rounded-lg"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(diamond.price)}
                </div>
                <Badge
                  variant={diamond.isActive !== false ? "default" : "secondary"}
                >
                  {diamond.isActive !== false ? "Available" : "Sold"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    Created by: {diamond.user?.name || "System"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Added on {formatDate(diamond.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Laboratory</p>
                  <p className="font-medium">{diamond.lab}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report #</p>
                  <p className="font-medium">{diamond.reportNumber}</p>
                </div>
              </div>
              {diamond.certLink && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <a
                    href={diamond.certLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {specifications.map((spec) => (
                <TableRow key={spec.label}>
                  <TableHead className="w-1/3">{spec.label}</TableHead>
                  <TableCell className="font-medium">{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
