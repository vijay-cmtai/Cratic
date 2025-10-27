"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamondByStockId,
  resetSingleDiamond, // <-- FIX: Imported the correct action name
} from "@/lib/features/inventory/inventorySlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Loader2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Zap,
  FileText,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const placeholderImage = "/placeholder-diamond.jpg";

export default function ProductDetailPage() {
  const params = useParams();
  const stockId = Array.isArray(params.stockId)
    ? params.stockId[0]
    : (params.stockId as string);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // FIX: Using the correct state properties from the refactored slice
  const {
    singleDiamond: currentDiamond,
    singleStatus,
    singleError: error,
  } = useSelector((state: RootState) => state.inventory);

  const { items: cartItems, actionStatus: cartActionStatus } = useSelector(
    (state: RootState) => state.cart
  );
  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { userInfo } = useSelector((state: RootState) => state.user);

  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    if (stockId) {
      dispatch(fetchDiamondByStockId(stockId));
    }
    // Cleanup function when the component unmounts
    return () => {
      dispatch(resetSingleDiamond()); // <-- FIX: Calling the correct action
    };
  }, [dispatch, stockId]);

  const isLiked = useMemo(
    () => wishlistItems.some((item) => item._id === currentDiamond?._id),
    [wishlistItems, currentDiamond]
  );
  const isInCart = useMemo(
    () => cartItems.some((item) => item._id === currentDiamond?._id),
    [cartItems, currentDiamond]
  );

  const handleAddToCart = () => {
    if (!userInfo) {
      toast.error("Please log in to add items to your cart.");
      router.push(`/login?redirect=/products/${stockId}`);
      return;
    }
    if (currentDiamond) {
      dispatch(addToCart({ diamondId: currentDiamond._id }));
      toast.success("Added to cart!");
    }
  };

  const handleBuyNow = async () => {
    if (!userInfo) {
      toast.error("Please log in to continue.");
      router.push(`/login?redirect=/products/${stockId}`);
      return;
    }
    if (currentDiamond) {
      setIsBuyingNow(true);
      if (!isInCart) {
        try {
          await dispatch(addToCart({ diamondId: currentDiamond._id })).unwrap();
        } catch (e) {
          toast.error("Could not add item to cart. Please try again.");
          setIsBuyingNow(false);
          return;
        }
      }
      router.push("/checkout");
    }
  };

  const handleToggleWishlist = () => {
    if (!userInfo) {
      toast.error("Please log in to manage your wishlist.");
      router.push(`/login?redirect=/products/${stockId}`);
      return;
    }
    if (currentDiamond) {
      if (isLiked) {
        dispatch(removeFromWishlist({ diamondId: currentDiamond._id }));
        toast.info("Removed from wishlist.");
      } else {
        dispatch(addToWishlist({ diamondId: currentDiamond._id }));
        toast.success("Added to wishlist!");
      }
    }
  };

  if (singleStatus === "loading" || singleStatus === "idle") {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-blue-400 opacity-20" />
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
          Loading Diamond Details...
        </p>
      </div>
    );
  }

  if (singleStatus === "failed" || !currentDiamond) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-destructive">
          Diamond Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          {error ||
            `The diamond with Stock ID "${stockId}" could not be found.`}
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/diamond-search">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Link>
        </Button>
      </div>
    );
  }

  const specs = [
    { label: "Stock ID", value: currentDiamond.stockId },
    { label: "Shape", value: currentDiamond.shape },
    { label: "Carat", value: currentDiamond.carat?.toFixed(2) },
    { label: "Color", value: currentDiamond.color },
    { label: "Clarity", value: currentDiamond.clarity },
    { label: "Cut", value: currentDiamond.cut },
    { label: "Polish", value: currentDiamond.polish },
    { label: "Symmetry", value: currentDiamond.symmetry },
    {
      label: "Measurements",
      value: `${currentDiamond.length || "?"} x ${currentDiamond.width || "?"} x ${currentDiamond.height || "?"}`,
    },
    { label: "Fluorescence", value: currentDiamond.fluorescenceIntensity },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-8">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/diamond-search">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg rounded-2xl border-slate-200 dark:border-slate-800">
              <img
                src={currentDiamond.imageLink || placeholderImage}
                alt={`${currentDiamond.shape || "Diamond"} diamond`}
                className="w-full h-auto object-cover aspect-square"
                width={800}
                height={800}
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderImage;
                }}
              />
            </Card>
            {currentDiamond.videoLink && (
              <Card className="shadow-lg rounded-2xl border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>360° Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <iframe
                      src={`${currentDiamond.videoLink}${currentDiamond.videoLink.includes("?") ? "&" : "?"}autoplay=0&autospin=1&sound=0`}
                      className="w-full h-full border-0 rounded-xl"
                      allow="autoplay; fullscreen"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm py-1 px-3 rounded-lg">
              {currentDiamond.type || "NATURAL"}
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white">{`${currentDiamond.carat?.toFixed(2) || "N/A"} Carat ${currentDiamond.shape || "Diamond"}`}</h1>
            <p className="text-muted-foreground text-lg">{`${currentDiamond.color || "N/A"} Color | ${currentDiamond.clarity || "N/A"} Clarity | ${currentDiamond.cut || "N/A"} Cut`}</p>

            <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-2">
              {formatPrice(currentDiamond.price)}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-xl font-semibold h-14 text-lg"
                onClick={handleAddToCart}
                disabled={
                  isInCart || isBuyingNow || cartActionStatus === "loading"
                }
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInCart ? "Added to Cart" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-xl font-semibold h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleBuyNow}
                disabled={isBuyingNow || cartActionStatus === "loading"}
              >
                {isBuyingNow ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-5 w-5" />
                )}
                {isBuyingNow ? "Proceeding..." : "Buy Now"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl h-14 w-16"
                onClick={handleToggleWishlist}
                disabled={isBuyingNow}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-all",
                    isLiked && "fill-red-500 text-red-500 scale-110"
                  )}
                />
              </Button>
            </div>

            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-4 flex items-center justify-around text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span>Fast & Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span>Secure Transaction</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Diamond Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {specs
                      .filter(
                        (spec) => spec.value && spec.value !== "? x ? x ?"
                      )
                      .map((spec) => (
                        <TableRow key={spec.label} className="border-b-0">
                          <TableCell className="font-medium text-muted-foreground p-2">
                            {spec.label}
                          </TableCell>
                          <TableCell className="font-semibold text-right p-2">
                            {spec.value}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {currentDiamond.reportNumber && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Certification Details</CardTitle>
                  <CardDescription>
                    Verified by an independent grading laboratory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grading Lab</span>
                    <span className="font-semibold">
                      {currentDiamond.lab || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Report #</span>
                    <span className="font-semibold">
                      {currentDiamond.reportNumber || "N/A"}
                    </span>
                  </div>
                  {currentDiamond.certLink && (
                    <Button asChild className="w-full mt-2 rounded-xl">
                      <Link
                        href={currentDiamond.certLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Full
                        Certificate
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
