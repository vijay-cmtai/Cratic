"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
// import Image from 'next/image'; // <img> tag use kar rahe hain
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Loader2,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamonds,
  deleteDiamond,
  fetchDiamondById,
  updateDiamondDetails,
  resetInventoryStatus,
} from "@/lib/features/inventory/inventorySlice";

const placeholderImage = "/placeholder-diamond.jpg";

// --- Edit/View Modal Component ---
const DiamondDetailModal = ({
  isOpen,
  onClose,
  diamondId,
  onUpdateSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { currentDiamond, singleStatus, actionStatus } = useSelector(
    (state: RootState) => state.inventory
  );

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen && diamondId) {
      dispatch(fetchDiamondById(diamondId));
    }
  }, [isOpen, diamondId, dispatch]);

  useEffect(() => {
    if (currentDiamond) {
      reset(currentDiamond);
    }
  }, [currentDiamond, reset]);

  const onSubmit = (data: any) => {
    const numericFields = [
      "carat",
      "price",
      "length",
      "width",
      "height",
      "depthPercent",
      "tablePercent",
      "pricePerCarat",
      "girdlePercent",
      "crownHeight",
      "crownAngle",
      "pavilionDepth",
      "pavilionAngle",
    ];
    numericFields.forEach((field) => {
      if (data[field]) {
        const num = parseFloat(data[field]);
        if (!isNaN(num)) data[field] = num;
      }
    });

    dispatch(updateDiamondDetails({ id: diamondId, data })).then((res) => {
      if (updateDiamondDetails.fulfilled.match(res)) {
        toast({
          title: "Success",
          description: "Diamond updated successfully.",
        });
        onUpdateSuccess();
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: (res.payload as string) || "Failed to update diamond.",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View / Edit Diamond Details</DialogTitle>
          <DialogDescription>
            Stock ID: {currentDiamond?.stockId}
          </DialogDescription>
        </DialogHeader>
        {singleStatus === "loading" && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {singleStatus === "succeeded" && currentDiamond && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 py-4">
              {Object.keys(currentDiamond)
                .filter(
                  (key) =>
                    !["_id", "user", "__v", "createdAt", "updatedAt"].includes(
                      key
                    )
                )
                .map((key) => (
                  <div key={key} className="space-y-1">
                    <Label
                      htmlFor={key}
                      className="capitalize text-xs font-medium text-gray-600"
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <Input
                      id={key}
                      {...register(key)}
                      type={
                        typeof currentDiamond[key] === "number"
                          ? "number"
                          : "text"
                      }
                      step="any"
                      className="h-8 text-sm"
                      defaultValue={currentDiamond[key] ?? ""}
                    />
                  </div>
                ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={actionStatus === "loading"}>
                {actionStatus === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page Component ---
export default function AdminInventoryPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { diamonds, page, pages, listStatus, actionStatus } = useSelector(
    (state: RootState) => state.inventory
  );

  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiamondId, setSelectedDiamondId] = useState<string | null>(
    null
  );

  const diamondsWithImages = useMemo(() => {
    if (!diamonds) return [];
    return diamonds.filter(
      (diamond) => diamond.imageLink && diamond.imageLink.trim() !== ""
    );
  }, [diamonds]);

  const refreshData = (pageToFetch = currentPage, searchToFetch = search) => {
    dispatch(fetchDiamonds({ page: pageToFetch, search: searchToFetch }));
  };

  useEffect(() => {
    setIsClient(true);
    refreshData(currentPage, search);
  }, [dispatch, currentPage]);

  const handleDelete = (id: string, stockId: string) => {
    if (
      window.confirm(`Are you sure you want to delete diamond: ${stockId}?`)
    ) {
      dispatch(deleteDiamond(id)).then((res) => {
        if (deleteDiamond.fulfilled.match(res)) {
          toast({
            title: "Success",
            description: "Diamond deleted successfully.",
          });
          if (diamonds.length === 1 && currentPage > 1)
            setCurrentPage(currentPage - 1);
          else refreshData();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: (res.payload as string) || "Failed to delete diamond.",
          });
        }
      });
    }
  };

  const handleEdit = (id: string) => {
    setSelectedDiamondId(id);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refreshData(1, search);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) setCurrentPage(newPage);
  };

  if (!isClient) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketplace Inventory</h1>
        </div>
        <div className="border rounded-lg bg-white shadow-sm h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace Inventory</h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Stock ID, Shape..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listStatus === "loading" && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" && diamondsWithImages.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-muted-foreground"
                >
                  No diamonds with images found.
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" &&
              diamondsWithImages.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-mono text-sm">
                    {item.stockId}
                  </TableCell>
                  <TableCell>
                    <img
                      src={item.imageLink || placeholderImage}
                      alt={item.shape || "Diamond"}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{`${item.carat?.toFixed(2) || "N/A"}ct ${item.shape}`}</div>
                    <div className="text-muted-foreground text-xs">{`${item.color || "N/A"} / ${item.clarity || "N/A"} / ${item.lab || "N/A"}`}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.user?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.price?.toLocaleString() || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item._id)}
                        disabled={actionStatus === "loading"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item._id, item.stockId)}
                        disabled={actionStatus === "loading"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || listStatus === "loading"}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pages || listStatus === "loading"}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      {selectedDiamondId && (
        <DiamondDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDiamondId(null);
          }}
          diamondId={selectedDiamondId}
          onUpdateSuccess={() => refreshData()}
        />
      )}
    </div>
  );
}
