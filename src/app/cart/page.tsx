"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchCart, removeFromCart } from "@/lib/features/cart/cartSlice"; // ✅✅ Cart slice se import karein

const placeholderImage = "/placeholder-diamond.jpg";

export default function CartPage() {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch<AppDispatch>();

  // ✅✅ Redux store se cart ka data lein, AppContext se nahi
  const {
    items: cartItems,
    listStatus,
    actionStatus,
  } = useSelector((state: RootState) => state.cart);
  const isLoading = listStatus === "loading";
  const isUpdating = actionStatus === "loading";

  // ✅✅ Component load hone par backend se cart fetch karein
  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [listStatus, dispatch]);

  // ✅✅ Remove button ke liye naya handler
  const handleRemoveFromCart = (diamondId: string) => {
    dispatch(removeFromCart({ diamondId }));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {cartItems.map((diamond) => (
                    <li
                      key={diamond._id}
                      className="flex items-center gap-4 p-4"
                    >
                      <img
  src={diamond.imageLink || placeholderImage}
  alt={diamond.shape || "diamond"}
  width={80}
  height={80}
  className="rounded-md border"
/>

                      <div className="flex-grow">
                        <p className="font-semibold">{`${diamond.shape} ${diamond.carat?.toFixed(2) || "N/A"}ct ${diamond.color} ${diamond.clarity}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock ID: {diamond.stockId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(diamond.price || 0)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveFromCart(diamond._id)}
                          disabled={isUpdating} // ✅ Disable button while an item is being removed
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </CardContent>
              <CardFooter>
                {/* ✅✅ Checkout ke liye 'createOrder' action dispatch hoga checkout page par */}
                <Button asChild className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any diamonds yet.
            </p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
