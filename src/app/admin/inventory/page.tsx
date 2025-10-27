"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 1. YAHAN useSearchParams IMPORT KAREIN
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamonds,
  deleteDiamond,
  resetActionStatus,
} from "@/lib/features/inventory/inventorySlice";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";
import { toast } from "sonner";

const placeholderImage = "/placeholder-diamond.jpg";

const isValidImageUrl = (url?: string): url is string => {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};

export default function AdminInventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 2. URL se parameters padhne ke liye hook
  const dispatch = useDispatch<AppDispatch>();

  const sellerId = searchParams.get("sellerId"); // 3. URL se 'sellerId' ko nikalein

  const {
    diamonds,
    listStatus,
    actionStatus,
    error,
    summary,
    total,
    page,
    pages,
  } = useSelector((state: RootState) => state.inventory);

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = listStatus === "loading";

  useEffect(() => {
    if (mounted) {
      // 4. fetchDiamonds action ko 'sellerId' ke saath bhejein
      dispatch(
        fetchDiamonds({ page: currentPage, search: searchTerm, sellerId })
      );
    }
  }, [dispatch, currentPage, searchTerm, mounted, sellerId]); // 5. 'sellerId' ko dependency array mein add karein

  useEffect(() => {
    if (actionStatus === "succeeded" && summary) {
      toast.success(summary.message || "Action completed successfully");
      dispatch(resetActionStatus());
      // Refresh karte waqt bhi 'sellerId' bhejein
      dispatch(
        fetchDiamonds({ page: currentPage, search: searchTerm, sellerId })
      );
    }
    if (actionStatus === "failed" && error) {
      toast.error(error);
      dispatch(resetActionStatus());
    }
  }, [
    actionStatus,
    error,
    summary,
    dispatch,
    currentPage,
    searchTerm,
    sellerId,
  ]); // 'sellerId' yahan bhi add karein

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleView = (diamond: Diamond) =>
    router.push(`/admin/inventory/${diamond._id}`);
  const handleEdit = (diamond: Diamond) =>
    router.push(`/admin/inventory/edit/${diamond._id}`);
  const handleDelete = (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (selectedDiamond) {
      await dispatch(deleteDiamond(selectedDiamond._id));
      setDeleteDialogOpen(false);
      setSelectedDiamond(null);
    }
  };

  const formatPrice = (price?: number) =>
    price
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price)
      : "N/A";

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            {sellerId
              ? `Showing inventory for a specific seller`
              : `Total ${total?.toLocaleString() ?? 0} diamonds in inventory`}
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/addInventory")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Diamond
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {sellerId ? "Seller's Diamonds" : "All Diamonds"}
            </CardTitle>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-9 w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : diamonds.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Diamonds Found</h3>
              {sellerId && (
                <p className="text-sm text-muted-foreground">
                  This seller may not have any inventory yet.
                </p>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Specs</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diamonds.map((diamond) => (
                    <TableRow key={diamond._id}>
                      <TableCell>
                        <img
                          src={
                            isValidImageUrl(diamond.imageLink)
                              ? diamond.imageLink
                              : placeholderImage
                          }
                          alt={diamond.shape || "diamond"}
                          width={50}
                          height={50}
                          className="rounded-md border object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{diamond.stockId}</div>
                        <div className="text-sm text-muted-foreground">
                          {diamond.lab} {diamond.reportNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {diamond.shape} {diamond.carat?.toFixed(2)}ct
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {diamond.color} {diamond.clarity} {diamond.cut}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">
                          {formatPrice(diamond.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {diamond.user?.name || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {diamond.user?.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            diamond.isActive !== false ? "default" : "secondary"
                          }
                        >
                          {diamond.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(diamond)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(diamond)}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(diamond)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pages}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedDiamond?.stockId}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
