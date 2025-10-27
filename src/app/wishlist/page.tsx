"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";
import {
  fetchWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice"; // ✅✅ Wishlist slice se import
import {
  fetchCart,
  moveFromWishlistToCart,
} from "@/lib/features/cart/cartSlice"; // ✅✅ Cart slice se import

const placeholderImage = "/placeholder-diamond.jpg";

export default function WishlistPage() {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Wishlist ka data Redux se lein
  const {
    items: wishlistItems,
    listStatus,
    actionStatus,
  } = useSelector((state: RootState) => state.wishlist);
  // ✅ Cart ka data bhi Redux se lein (button disable karne ke liye)
  const { items: cartItems, listStatus: cartListStatus } = useSelector(
    (state: RootState) => state.cart
  );

  const isLoading = listStatus === "loading";
  const isUpdating = actionStatus === "loading";

  // ✅ Component load hone par wishlist aur cart dono fetch karein
  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchWishlist());
    }
    if (cartListStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [listStatus, cartListStatus, dispatch]);

  // Efficient lookup ke liye cart item IDs ka ek Set banayein
  const cartItemIds = useMemo(
    () => new Set(cartItems.map((item) => item._id)),
    [cartItems]
  );

  const handleRemoveFromWishlist = (diamondId: string) => {
    dispatch(removeFromWishlist({ diamondId }));
  };

  const handleMoveToCart = (diamondId: string) => {
    dispatch(moveFromWishlistToCart({ diamondId }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlistItems.map((diamond: Diamond) => {
            const isInCart = cartItemIds.has(diamond._id);
            return (
              <Card
                key={diamond._id}
                className="overflow-hidden group flex flex-col text-sm"
              >
                <Link href={`/products/${diamond.stockId}`}>
                <img
  src={diamond.imageLink || placeholderImage}
  alt={diamond.shape || "diamond"}
  width={300}
  height={300}
  className="w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
  onError={(e) => {
    e.currentTarget.src = placeholderImage;
  }}
/>

                </Link>
                <CardContent className="p-3 flex-grow flex flex-col">
                  <p className="font-bold mb-1">{`${diamond.shape} ${diamond.carat?.toFixed(2)}ct`}</p>
                  <p className="text-muted-foreground text-xs mb-3">{`${diamond.color} | ${diamond.clarity} | ${diamond.cut || "N/A"}`}</p>
                  <div className="text-lg font-bold mb-3">
                    {formatPrice(diamond.price || 0)}
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      className="w-full"
                      onClick={() => handleMoveToCart(diamond._id)}
                      disabled={isInCart || isUpdating}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {isInCart ? "In Cart" : "Move to Cart"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleRemoveFromWishlist(diamond._id)}
                      disabled={isUpdating}
                    >
                      <Heart className="w-4 h-4 mr-2 fill-red-500" />
                      Remove from Wishlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Click the heart on any product to save it here.
            </p>
            <Button asChild>
              <Link href="/products">Discover Diamonds</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
