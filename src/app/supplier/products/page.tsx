"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  Gem,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamonds,
  deleteDiamond,
  resetActionStatus,
} from "@/lib/features/inventory/inventorySlice";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";

const formatPrice = (price?: number) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

const getAvailabilityVariant = (availability: string) => {
  switch (availability) {
    case "Available":
      return "default";
    case "On Hold":
      return "secondary";
    case "Sold":
      return "destructive";
    default:
      return "outline";
  }
};

export default function SupplierProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    diamonds,
    loading,
    totalPages,
    currentPage,
    totalCount,
    actionStatus,
  } = useSelector((state: RootState) => state.inventory);

  const [searchTerm, setSearchTerm] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  // Fetch inventory on mount and when page changes
  useEffect(() => {
    dispatch(fetchDiamonds({ page: 1, search: "" }));
  }, [dispatch]);

  // Handle action status (delete success/failure)
  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast.success("Operation completed successfully!");
      dispatch(resetActionStatus());
      // Refresh the list
      dispatch(fetchDiamonds({ page: currentPage, search: searchTerm }));
    }
    if (actionStatus === "failed") {
      toast.error("Operation failed!");
      dispatch(resetActionStatus());
    }
  }, [actionStatus, dispatch, currentPage, searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
      dispatch(fetchDiamonds({ page: 1, search: localSearch }));
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(fetchDiamonds({ page: newPage, search: searchTerm }));
  };

  const handleDelete = (diamondId: string, stockId: string) => {
    if (confirm(`Are you sure you want to delete diamond ${stockId}?`)) {
      dispatch(deleteDiamond(diamondId));
    }
  };

  const TableSkeleton = () =>
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton className="h-12 w-12 rounded-md" />
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-20 rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gem className="h-8 w-8 text-primary" />
            My Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your diamond inventory.{" "}
            {totalCount > 0 && (
              <span className="font-medium text-foreground">
                Total: {totalCount} diamonds
              </span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/supplier/add-inventory">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Diamond
          </Link>
        </Button>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Stock ID, shape, color..."
              className="pl-9 max-w-sm"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Diamond Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : diamonds.length > 0 ? (
                diamonds.map((diamond: Diamond) => (
                  <TableRow key={diamond._id}>
                    <TableCell>
                      {diamond.imageLink ? (
                        <img
                          src={diamond.imageLink}
                          alt={diamond.stockId}
                          width={48}
                          height={48}
                          className="rounded-md border object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-diamond.jpg";
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center">
                          <Gem className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{diamond.stockId}</div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <div>
                          {diamond.carat} ct {diamond.shape || "N/A"}
                        </div>
                        <div>
                          {diamond.color || "N/A"} • {diamond.clarity || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getAvailabilityVariant(diamond.availability)}
                      >
                        {diamond.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{diamond.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(diamond.price)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        {diamond.cut && (
                          <div className="text-muted-foreground">
                            Cut: {diamond.cut}
                          </div>
                        )}
                        {diamond.lab && (
                          <div className="text-muted-foreground">
                            Lab: {diamond.lab}
                          </div>
                        )}
                        {diamond.reportNumber && (
                          <div className="text-xs text-muted-foreground">
                            Cert: {diamond.reportNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {diamond.certificateLink && (
                            <DropdownMenuItem asChild>
                              <a
                                href={diamond.certificateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                                Certificate
                              </a>
                            </DropdownMenuItem>
                          )}
                          {diamond.videoLink && (
                            <DropdownMenuItem asChild>
                              <a
                                href={diamond.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Video
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() =>
                              handleDelete(diamond._id!, diamond.stockId)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Diamonds Found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchTerm
                        ? "Try a different search term."
                        : "Click 'Add New Diamond' to start building your inventory."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
