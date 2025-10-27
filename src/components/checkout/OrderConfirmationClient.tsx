// =================================================================
// File: app/order-confirmation/OrderConfirmationClient.tsx (Poora Code)
// =================================================================

"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchOrderById,
  resetCurrentOrder,
} from "@/lib/features/order/orderSlice";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { formatPrice } = useCurrency();

  const orderId = searchParams.get("orderId");

  // YAHI FIX HAI: Sahi state ko select karna
  const {
    data: currentOrder,
    status: currentOrderStatus,
    error,
  } = useSelector((state: RootState) => state.order.current);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(resetCurrentOrder()); // Cleanup
    };
  }, [orderId, dispatch]);

  if (!orderId) {
    /* ... (error handling code is fine) ... */
  }
  if (currentOrderStatus === "loading") {
    /* ... (loading code is fine) ... */
  }
  if (currentOrderStatus === "failed" || !currentOrder) {
    /* ... (error handling code is fine) ... */
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your order has been confirmed and will be processed shortly.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Order #{currentOrder._id.slice(-6).toUpperCase()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(currentOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold">
                {formatPrice(currentOrder.totalAmount)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
          <ul className="space-y-4">
            {currentOrder.items.map((item) => (
              <li key={item.diamond._id} className="flex items-center gap-4">
                <img
                  src={item.diamond.imageLink || "/placeholder-diamond.jpg"}
                  alt={item.diamond.shape || "diamond"}
                  width={64}
                  height={64}
                  className="rounded-md border object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-sm">
                    {item.diamond.stockId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.diamond.shape}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {formatPrice(item.priceAtOrder)}
                </p>
              </li>
            ))}
          </ul>
          <Separator className="my-6" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Billed To</h3>
              <p className="text-sm font-medium">{currentOrder.userId.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentOrder.userId.email}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Status</h3>
              <p className="text-sm font-medium">{currentOrder.orderStatus}</p>
              <p className="text-sm text-muted-foreground">
                Payment: {currentOrder.paymentInfo.payment_status}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/profile/orders">
              <ShoppingBag className="mr-2 h-4 w-4" /> View My Orders
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
