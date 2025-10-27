"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchSupplierInventory,
  updateDiamondStatus,
  resetActionStatus,
} from "@/lib/features/inventory/inventorySlice";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function SupplierInventoryListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { formatPrice } = useCurrency();

  const {
    list: inventoryList,
    listStatus,
    actionStatus,
    error,
  } = useSelector((state: RootState) => state.inventory);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchSupplierInventory());
    }
  }, [listStatus, dispatch]);

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast.success("Status updated successfully!");
      setUpdatingId(null);
      dispatch(resetActionStatus());
    }
    if (actionStatus === "failed" && error) {
      toast.error("Update Failed", { description: error });
      setUpdatingId(null);
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch]);

  const handleStatusChange = (diamondId: string, newAvailability: string) => {
    setUpdatingId(diamondId);
    dispatch(updateDiamondStatus({ diamondId, availability: newAvailability }));
  };

  if (listStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (listStatus === "failed") {
    return (
      <div className="text-center text-destructive p-8">
        Error loading inventory. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Inventory</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all the diamonds in your inventory.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Diamonds ({inventoryList.length})</CardTitle>
          <CardDescription>
            Change the availability status directly from the table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock ID</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Carat</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-[180px]">Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryList.length > 0 ? (
                inventoryList.map((diamond) => (
                  <TableRow key={diamond._id}>
                    <TableCell className="font-medium">
                      {diamond.stockId}
                    </TableCell>
                    <TableCell>{diamond.shape}</TableCell>
                    <TableCell>{diamond.carat?.toFixed(2)}</TableCell>
                    <TableCell>{formatPrice(diamond.price)}</TableCell>
                    <TableCell>
                      {updatingId === diamond._id ? (
                        <div className="flex items-center justify-center h-9">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <Select
                          value={diamond.availability}
                          onValueChange={(newValue) =>
                            handleStatusChange(diamond._id, newValue)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-700 dark:text-green-400"
                              >
                                Available
                              </Badge>
                            </SelectItem>
                            <SelectItem value="On Hold">
                              <Badge
                                variant="outline"
                                className="border-yellow-500 text-yellow-700 dark:text-yellow-400"
                              >
                                On Hold
                              </Badge>
                            </SelectItem>
                            <SelectItem value="Sold">
                              <Badge
                                variant="outline"
                                className="border-red-500 text-red-700 dark:text-red-400"
                              >
                                Sold
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No diamonds found in your inventory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
