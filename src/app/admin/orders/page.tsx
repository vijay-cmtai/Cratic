"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Redux se related imports
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllOrders } from "@/lib/features/admin/adminSlice";

// Data ke structure ke liye TypeScript types (optional, but good practice)
interface ItemType {
  _id: string;
  name: string;
  price: number;
  image?: { url: string }; // Assuming image has a url property
}

interface UserType {
  _id: string;
  name: string;
  email: string;
}

interface OrderType {
  _id: string;
  userId: UserType;
  items: ItemType[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch<AppDispatch>();

  // Modal ke liye states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const { orders, status, error } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllOrders());
    }
  }, [status, dispatch]);

  const handleViewDetails = (order: OrderType) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "default";
      case "Completed":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (status === "loading") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>
        <div className="border rounded-lg p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              (orders as OrderType[]).map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono text-sm">
                    {order._id.substring(0, 10)}...
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {order.userId?.name || "N/A"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {order.userId?.email || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {order.items.length} item(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status) as any}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(order)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: <span className="font-mono">{selectedOrder?._id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              {/* Customer Details */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.userId.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.userId.email}
                </p>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    variant={getStatusVariant(selectedOrder.status) as any}
                  >
                    {selectedOrder.status}
                  </Badge>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
                <p className="font-bold text-lg">
                  <strong>Total:</strong>{" "}
                  {formatPrice(selectedOrder.totalAmount)}
                </p>
              </div>

              {/* Items in Order */}
              <div>
                <h3 className="font-semibold mb-2">
                  Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.image?.url || "https://via.placeholder.com/64"
                          }
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
