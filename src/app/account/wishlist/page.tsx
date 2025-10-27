// app/account/wishlist/page.tsx (FULL UPDATED FILE)

"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchWishlist,
  removeFromWishlist,
  resetWishlistStatus,
} from "@/lib/features/wishlist/wishlistSlice";
import { moveFromWishlistToCart } from "@/lib/features/cart/cartSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const placeholderImage = "/placeholder-diamond.jpg";  

export default function UserWishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, listStatus, actionStatus, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchWishlist());
    }
  }, [dispatch, listStatus]);

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast.success("Action completed successfully!");
      dispatch(resetWishlistStatus()); // Reset status to prevent toast on re-render
    }
    if (actionStatus === "failed" && error) {
      toast.error(error);
      dispatch(resetWishlistStatus());
    }
  }, [actionStatus, error, dispatch]);

  const handleRemove = (diamondId: string) => {
    dispatch(removeFromWishlist({ diamondId }));
  };

  const handleAddToCart = (diamondId: string) => {
    dispatch(moveFromWishlistToCart({ diamondId }));
  };

  const renderSkeletons = () =>
    Array.from({ length: 4 }).map((_, index) => (
      <Card key={index}>
        <Skeleton className="aspect-square w-full rounded-t-lg" />
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-9" />
          </div>
        </CardContent>
      </Card>
    ));

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">My Wishlist</h2>

      {listStatus === "loading" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {renderSkeletons()}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium">Your wishlist is empty.</h3>
          <p className="text-muted-foreground mt-2">
            Start adding products you love!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item._id} className="group relative">
              <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                <img
                  src={item.imageLink || placeholderImage}
                  alt={item.shape || "Diamond"}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <p className="font-semibold truncate">
                  {item.shape} - {item.carat?.toFixed(2)} ct
                </p>
                <p className="text-muted-foreground">
                  {item.price
                    ? `$${item.price.toFixed(2)}`
                    : "Price on Request"}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(item._id)}
                    disabled={actionStatus === "loading"}
                  >
                    {actionStatus === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-4 w-4" />
                    )}
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => handleRemove(item._id)}
                    disabled={actionStatus === "loading"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
