// src/components/order-confirmation/OrderConfirmationClient.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ✅ Step 1: Import Redux hooks and types
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { useCurrency } from "@/context/CurrencyContext";

const placeholderImage = "/placeholder-diamond.jpg";

export default function OrderConfirmationClient() {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Step 2: Get the last created order from the Redux store
  const { lastOrder, actionStatus } = useSelector(
    (state: RootState) => state.order
  );
  // We also need the full diamond details, which are in the inventory slice
  const { diamonds } = useSelector((state: RootState) => state.inventory);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Find the full diamond objects for the items in the last order
  const orderedItems = lastOrder
    ? diamonds.filter((diamond) => lastOrder.items.includes(diamond._id))
    : [];

  // Use a loading state until the component has mounted on the client
  if (!isClient || actionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ✅ Step 3: Handle the case where there is no order data
  if (!lastOrder || orderedItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-2xl mx-auto py-12">
          <CardContent>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              No Recent Order Found
            </h2>
            <p className="text-muted-foreground mb-6">
              Your order might still be processing, or you can start a new one.
            </p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl">Thank you for your order!</CardTitle>
          <p className="text-muted-foreground">
            Your order has been placed successfully.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg text-center mb-6">
            <p className="text-sm">Your Order Number is:</p>
            {/* ✅ Step 4: Use the actual order ID from the backend */}
            <p className="font-bold text-lg">{lastOrder._id}</p>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            A confirmation email has been sent to your registered email address.
          </p>
          <Separator />
          <h3 className="font-semibold my-4">Order Summary</h3>
          <ul className="space-y-4">
            {orderedItems.map((item) => (
              <li key={item._id} className="flex items-center gap-4">
                <Image
                  src={item.imageLink || placeholderImage}
                  alt={item.shape || "diamond"}
                  width={64}
                  height={64}
                  className="rounded-md border"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{`${item.shape} ${item.carat?.toFixed(2)}ct`}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock ID: {item.stockId}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {formatPrice(item.price || 0)}
                </p>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            {/* ✅ Step 5: Use the total amount from the order object */}
            <span>{formatPrice(lastOrder.totalAmount)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
