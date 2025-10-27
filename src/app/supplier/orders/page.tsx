"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchSellerOrders } from "@/lib/features/order/orderSlice";

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { formatPrice } = useCurrency();

  // ====================== FIX #1: Correct useSelector ======================
  const {
    data: sellerOrders,
    status,
    error,
  } = useSelector((state: RootState) => state.order.sellerOrders);
  const { userInfo } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Fetch only if data is not already loaded or loading
    if (status === "idle") {
      dispatch(fetchSellerOrders());
    }
  }, [dispatch, status]);

  const getStatusVariant = (orderStatus: string) => {
    switch (orderStatus) {
      case "Processing":
        return "secondary";
      case "Shipped":
        return "default";
      case "Completed":
        return "outline";
      case "Cancelled":
        return "destructive";
      case "Failed":
        return "destructive";
      default:
        return "default"; // For "Pending Payment"
    }
  };

  // ====================== FIX #2: Simplified flattenedOrders logic ======================
  // Backend pehle se hi sirf aapke orders bhej raha hai, isliye frontend par filter ki zaroorat nahi.
  const flattenedOrders = sellerOrders.flatMap((order) =>
    order.items.map((item) => ({
      ...order,
      item: item.diamond, // Direct diamond object pass karo
      uniqueKey: `${order._id}-${item.diamond._id}`,
    }))
  );

  const TableSkeleton = () =>
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20 rounded-full" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-4 w-16 ml-auto" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Sales</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product Sold</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              <TableSkeleton />
            ) : status === "failed" ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-destructive"
                >
                  Error: {error || "Failed to load orders."}
                </TableCell>
              </TableRow>
            ) : flattenedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold">No Sales Found</h3>
                  <p className="text-muted-foreground mt-1">
                    You have not sold any items yet.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              flattenedOrders.map((order) => {
                // ================== FIX #3: Access properties from item directly ==================
                const product = order.item;
                return (
                  <TableRow key={order.uniqueKey}>
                    <TableCell className="font-mono text-sm">
                      {order._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageLink || "/placeholder-diamond.jpg"}
                          alt={product.shape || "Diamond"}
                          width={40}
                          height={40}
                          className="rounded-md border object-cover"
                        />
                        <div>
                          <div className="font-medium">
                            {product.shape || "Diamond"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {product.stockId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.userId.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.userId.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(order.orderStatus) as any}
                      >
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Mark as Shipped</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Cancel Sale</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
