"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Heart,
  Share2,
  Download,
  ShoppingCart,
  User,
  Calendar,
  Eye,
  Play,
  Loader2,
  MapPin,
  Award,
  Ruler,
  Gem,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamondById,
  fetchDiamondByStockId,
} from "@/lib/features/inventory/inventorySlice";
import { useAppContext } from "@/context/AppContext";
import { toast } from "sonner";

const placeholderImage = "/placeholder-diamond.jpg";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { addToCart, toggleLike, likedItems, cartItems } = useAppContext();

  const { currentDiamond, singleStatus, error } = useSelector(
    (state: RootState) => state.inventory
  );

  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLoading = singleStatus === "loading";
  const productId = params.id as string;
  const isStockId = /^[A-Za-z]/.test(productId); // Check if it starts with letter (stock ID)

  useEffect(() => {
    if (productId) {
      if (isStockId) {
        dispatch(fetchDiamondByStockId(productId));
      } else {
        dispatch(fetchDiamondById(productId));
      }
    }
  }, [dispatch, productId, isStockId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddToCart = () => {
    if (currentDiamond) {
      addToCart(currentDiamond._id);
      toast.success("Added to cart successfully!");
    }
  };

  const handleToggleLike = () => {
    if (currentDiamond) {
      toggleLike(currentDiamond._id);
      const isLiked = likedItems.has(currentDiamond._id);
      toast.success(isLiked ? "Removed from wishlist" : "Added to wishlist");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentDiamond?.shape} ${currentDiamond?.carat}ct Diamond`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading diamond details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentDiamond) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <Gem className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Diamond Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error ||
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
  const isLiked = likedItems.has(diamond._id);
  const isInCart = cartItems.has(diamond._id);

  // Diamond specifications for the table
  const specifications = [
    { label: "Stock ID", value: diamond.stockId },
    { label: "Shape", value: diamond.shape },
    { label: "Carat", value: `${diamond.carat.toFixed(2)} ct` },
    { label: "Color", value: diamond.color },
    { label: "Clarity", value: diamond.clarity },
    { label: "Cut", value: diamond.cut || "N/A" },
    { label: "Polish", value: diamond.polish || "N/A" },
    { label: "Symmetry", value: diamond.symmetry || "N/A" },
    { label: "Fluorescence", value: diamond.fluorescenceIntensity || "N/A" },
    { label: "Lab", value: diamond.lab },
    { label: "Certificate #", value: diamond.reportNumber },
    {
      label: "Measurements",
      value:
        diamond.length && diamond.width && diamond.height
          ? `${diamond.length}x${diamond.width}x${diamond.height}`
          : "N/A",
    },
    { label: "Table %", value: diamond.table ? `${diamond.table}%` : "N/A" },
    { label: "Depth %", value: diamond.depth ? `${diamond.depth}%` : "N/A" },
    { label: "Girdle", value: diamond.girdle || "N/A" },
    { label: "Culet", value: diamond.culet || "N/A" },
  ];

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {diamond.shape} {diamond.carat.toFixed(2)}ct {diamond.color}{" "}
            {diamond.clarity}
          </h1>
          <p className="text-muted-foreground">Stock ID: {diamond.stockId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images/Video */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {showVideo && diamond.videoLink ? (
                <div className="relative aspect-square">
                  <iframe
                    src={`${diamond.videoLink}?autoplay=1&autospin=1&sound=0`}
                    className="w-full h-full border-0 rounded-lg"
                    allow="autoplay; fullscreen"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setShowVideo(false)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show Image
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-square">
                  <Image
                    src={
                      !imageError && diamond.imageLink
                        ? diamond.imageLink
                        : placeholderImage
                    }
                    alt={`${diamond.shape} Diamond`}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                  {diamond.videoLink && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-4 right-4"
                      onClick={() => setShowVideo(true)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Show Video
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isInCart ? "Added to Cart" : "Add to Cart"}
            </Button>
            <Button variant="outline" onClick={handleToggleLike}>
              <Heart
                className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              {isLiked ? "Liked" : "Like"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Price and Status */}
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

              {/* Creator Information */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">
                    {diamond.user?.name || "System Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {diamond.user?.email || "admin@system.com"}
                  </p>
                </div>
                {diamond.createdAt && (
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(diamond.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Laboratory</p>
                  <p className="font-medium">{diamond.lab}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report Number</p>
                  <p className="font-medium">{diamond.reportNumber}</p>
                </div>
              </div>
              {diamond.certLink && (
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Certificate
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Key Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shape:</span>
                  <span className="font-medium">{diamond.shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carat:</span>
                  <span className="font-medium">
                    {diamond.carat.toFixed(2)} ct
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{diamond.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clarity:</span>
                  <span className="font-medium">{diamond.clarity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cut:</span>
                  <span className="font-medium">{diamond.cut || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Polish:</span>
                  <span className="font-medium">{diamond.polish || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Specifications Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Complete Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="specifications">
            <TabsList>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-4">
              <Table>
                <TableBody>
                  {specifications.slice(0, 12).map((spec, index) => (
                    <TableRow key={index}>
                      <TableHead className="w-1/3">{spec.label}</TableHead>
                      <TableCell className="font-medium">
                        {spec.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="measurements" className="mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead>Length</TableHead>
                    <TableCell>{diamond.length || "N/A"} mm</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Width</TableHead>
                    <TableCell>{diamond.width || "N/A"} mm</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Height</TableHead>
                    <TableCell>{diamond.height || "N/A"} mm</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Table %</TableHead>
                    <TableCell>
                      {diamond.table ? `${diamond.table}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Depth %</TableHead>
                    <TableCell>
                      {diamond.depth ? `${diamond.depth}%` : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="additional" className="mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead>Girdle</TableHead>
                    <TableCell>{diamond.girdle || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Culet</TableHead>
                    <TableCell>{diamond.culet || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Fluorescence</TableHead>
                    <TableCell>
                      {diamond.fluorescenceIntensity || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableCell>{diamond.type || "Natural"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableCell className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {diamond.location || "N/A"}
                    </TableCell>
                  </TableRow>
                  {diamond.updatedAt && (
                    <TableRow>
                      <TableHead>Last Updated</TableHead>
                      <TableCell>{formatDate(diamond.updatedAt)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Admin Actions (if needed) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/inventory/edit/${diamond._id}`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Diamond
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
