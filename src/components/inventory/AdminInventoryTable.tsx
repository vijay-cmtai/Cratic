"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Filter,
  Download,
  RefreshCw,
  Package,
  DollarSign,
  Archive,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const placeholderImage = "/placeholder-diamond.jpg";

const isValidImageUrl = (url?: string): url is string => {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};
export default function AdminInventoryTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const sellerId = searchParams.get("sellerId");

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
  const [showArchived, setShowArchived] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = listStatus === "loading";

  // Fetch data when dependencies change
  useEffect(() => {
    if (mounted) {
      // Backend ko batao ki archived dikhana hai ya nahi (assuming backend supports a 'showArchived' param or logic needs update)
      // Currently passing it as a custom query param conceptually
      const params: any = {
        page: currentPage,
        search: searchTerm,
        sellerId,
      };

      if (showArchived) {
        params.showArchived = "true";
      }

      dispatch(fetchDiamonds(params));
    }
  }, [dispatch, currentPage, searchTerm, mounted, sellerId, showArchived]);

  useEffect(() => {
    if (actionStatus === "succeeded" && summary) {
      toast.success(summary.message || "Action completed successfully");
      dispatch(resetActionStatus());
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
  ]);

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
          maximumFractionDigits: 0,
        }).format(price)
      : "N/A";

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
        );
      case "SOLD":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Sold</Badge>;
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
            Pending
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen justify-center items-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your diamonds, pricing, and availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => router.push("/admin/addInventory")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Diamond
          </Button>
        </div>
      </div>

      {/* Stats Overview (Optional Visual Upgrade) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {total?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items currently in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sellers
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellerId ? 1 : "All"}</div>
            <p className="text-xs text-muted-foreground">
              {sellerId
                ? "Filtered by specific seller"
                : "Displaying from all sources"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Archive Status
            </CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mt-1">
              <Switch
                id="archive-mode"
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <Label htmlFor="archive-mode" className="text-sm font-medium">
                {showArchived ? "Showing Archived" : "Hiding Archived"}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Toggle to view removed items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Main Table */}
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by Stock ID, Shape..."
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button> */}
            </div>

            {pages > 1 && (
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of{" "}
                {total}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Specs (4Cs)</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Grading
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Loading inventory...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : diamonds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg">
                          No diamonds found
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Try adjusting your search or filters, or add a new
                          diamond to your inventory.
                        </p>
                        {searchTerm && (
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  diamonds.map((diamond) => (
                    <TableRow
                      key={diamond._id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Avatar className="h-12 w-12 rounded-lg border">
                          <AvatarImage
                            src={diamond.imageLink}
                            alt={diamond.stockId}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-lg">
                            💎
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {diamond.stockId}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                            {diamond.shape || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          <Badge
                            variant="outline"
                            className="font-mono bg-background"
                          >
                            {diamond.carat}ct
                          </Badge>
                          <Badge variant="secondary" className="font-mono">
                            {diamond.color}
                          </Badge>
                          <Badge variant="secondary" className="font-mono">
                            {diamond.clarity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm font-medium">
                          {diamond.lab || "N/A"}
                        </div>
                        <div className="flex gap-1 text-xs text-muted-foreground mt-0.5">
                          <span>{diamond.cut?.substring(0, 2) || "-"}</span>•
                          <span>{diamond.polish?.substring(0, 2) || "-"}</span>•
                          <span>
                            {diamond.symmetry?.substring(0, 2) || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatPrice(diamond.price)}
                          </span>
                          {diamond.pricePerCarat && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatPrice(diamond.pricePerCarat)}/ct
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div
                          className="text-sm font-medium truncate max-w-[120px]"
                          title={diamond.user?.name}
                        >
                          {diamond.user?.name || "System"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {diamond.user?.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          diamond.availability ||
                            (diamond.isActive !== false
                              ? "AVAILABLE"
                              : "ARCHIVED")
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleView(diamond)}
                            >
                              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />{" "}
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(diamond)}
                            >
                              <Edit className="h-4 w-4 mr-2 text-muted-foreground" />{" "}
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(diamond)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page} of {pages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                disabled={currentPage === pages || isLoading}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete diamond{" "}
              <strong>{selectedDiamond?.stockId}</strong> from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Diamond
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
