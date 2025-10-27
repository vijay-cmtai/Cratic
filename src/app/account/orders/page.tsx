"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchMyOrders } from "@/lib/features/order/orderSlice";
import type { Order } from "@/lib/features/order/orderSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "success";
    case "shipped":
      return "default";
    case "processing":
      return "secondary";
    case "cancelled":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default function UserOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: myOrders,
    status,
    error,
  } = useSelector((state: RootState) => state.order.myOrders);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(myOrders)) return [];
    return myOrders.filter((order) => {
      const statusMatch =
        statusFilter === "all" ||
        order.orderStatus.toLowerCase() === statusFilter;
      const searchMatch = order._id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [myOrders, searchTerm, statusFilter]);

  const OrderDetailModal = ({ order }: { order: Order }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order._id.substring(18).toUpperCase()} placed on{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <h4 className="font-semibold">Items</h4>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item._id} className="flex items-center gap-4">
                  {/* ✨ YAHI HAI FINAL SOLUTION ✨ */}
                  {/* Optional Chaining (?.) add kiya gaya hai */}
                  <img
                    src={item.diamond?.imageLink || "/placeholder-diamond.jpg"}
                    alt={item.diamond?.shape || "Diamond"}
                    width={50}
                    height={50}
                    className="rounded-md border object-cover"
                  />
                  <div className="flex-grow">
                    <p className="text-sm font-medium">
                      {item.diamond?.stockId || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.diamond?.shape || "Unknown Shape"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(item.priceAtOrder)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Total Amount</h4>
              <p className="text-2xl font-bold">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <Badge
                variant={getStatusVariant(order.orderStatus) as any}
                className="capitalize"
              >
                {order.orderStatus}
              </Badge>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Customer</h4>
            <p className="text-sm text-muted-foreground">{order.userId.name}</p>
            <p className="text-sm text-muted-foreground">
              {order.userId.email}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 border-b">
        <div className="grid gap-1 text-sm">
          <div className="font-semibold text-primary">
            Order #{order._id.substring(18).toUpperCase()}
          </div>
          <div className="text-muted-foreground">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant={getStatusVariant(order.orderStatus) as any}
            className="capitalize text-xs py-1 px-2.5"
          >
            {order.orderStatus}
          </Badge>
          <OrderDetailModal order={order} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={item._id || index} className="relative h-16 w-16">
                <img
                  src={item.diamond?.imageLink || "/placeholder-diamond.jpg"}
                  alt={item.diamond?.shape || "Diamond"}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-background object-cover"
                />
              </div>
            ))}
          </div>
          {order.items.length > 3 && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed bg-muted text-sm font-medium">
              +{order.items.length - 3} more
            </div>
          )}
          <div className="ml-auto text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="font-bold text-lg">
              {formatPrice(order.totalAmount)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50 border-b">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </CardHeader>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="ml-auto space-y-2 text-right">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
      <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold">No Orders Found</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        {statusFilter === "all" && searchTerm === ""
          ? "You haven't placed any orders yet."
          : "Try adjusting your search or filter."}
      </p>
      <Button asChild>
        <Link href="/diamonds">Start Shopping</Link>
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your order history.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        {status === "loading" ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : status === "failed" ? (
          <Card className="text-center p-8">
            <p className="text-destructive">
              {error || "Failed to load orders."}
            </p>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
