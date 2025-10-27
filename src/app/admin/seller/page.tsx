"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Eye } from "lucide-react"; // <-- 1. IMPORT "Eye" ICON
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllUsers } from "@/lib/features/users/userSlice";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export default function AdminSellersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { users, listStatus } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const sellers = users.filter((user) => user.role === 'Supplier');

  const handleAddInventory = (sellerId: string) => {
    router.push(`/admin/addInventory?sellerId=${sellerId}`);
  };

  // =========================================================
  //      ✅ 2. NEW FUNCTION TO VIEW A SELLER'S INVENTORY ✅
  // =========================================================
  const handleViewInventory = (sellerId: string) => {
    // Navigate to the main inventory page and pass the sellerId as a query parameter
    router.push(`/admin/inventory?sellerId=${sellerId}`);
  };


  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Seller Management</h1>
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listStatus === "loading" && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading sellers...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" && sellers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No sellers found.
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" &&
              sellers.map((seller) => (
                <TableRow key={seller._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {seller.name ? seller.name.charAt(0).toUpperCase() : "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {seller.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{seller.companyName || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(seller.status)}>
                      {seller.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(seller.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* ========================================================= */}
                    {/*         ✅ 3. ADDED THE "VIEW INVENTORY" BUTTON ✅         */}
                    {/* ========================================================= */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewInventory(seller._id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Inventory
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddInventory(seller._id)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Inventory
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}