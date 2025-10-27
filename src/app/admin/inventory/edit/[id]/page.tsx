"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image"; // Next.js Image component is better for performance
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Gem,
  Ruler,
  FileText,
  Camera,
  Settings,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamondById,
  updateDiamondDetails,
  resetActionStatus,
  resetSingleDiamond,
} from "@/lib/features/inventory/inventorySlice";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";
import { toast } from "sonner";

// Options arrays
const shapes = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Marquise",
  "Emerald",
  "Radiant",
  "Heart",
  "Asscher",
];
const cuts = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarities = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
];
const polishes = ["Excellent", "Very Good", "Good", "Fair"];
const symmetries = ["Excellent", "Very Good", "Good", "Fair"];
const fluorescences = ["None", "Faint", "Medium", "Strong", "Very Strong"];
const labs = ["GIA", "IGI", "HRD", "SGL", "Other"];

export default function EditDiamondPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { singleDiamond, singleStatus, actionStatus, error } = useSelector(
    (state: RootState) => state.inventory
  );

  const diamondId = params.id as string;
  const isLoading = singleStatus === "loading";
  const isSaving = actionStatus === "loading";

  const [formData, setFormData] = useState<Partial<Diamond>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (diamondId) {
      dispatch(fetchDiamondById(diamondId));
    }
    return () => {
      dispatch(resetSingleDiamond());
    };
  }, [dispatch, diamondId]);

  useEffect(() => {
    if (singleDiamond) {
      setFormData({
        ...singleDiamond,
        isActive: singleDiamond.isActive !== false,
      });
      setImagePreview(singleDiamond.imageLink || null);
    }
  }, [singleDiamond]);

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast.success("Diamond updated successfully!");
      dispatch(resetActionStatus());
      router.push(`/admin/inventory/${diamondId}`);
    }
    if (actionStatus === "failed" && error) {
      toast.error(error);
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch, router, diamondId]);

  const handleInputChange = (field: keyof Diamond, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberInputChange = (field: keyof Diamond, value: string) => {
    const numericValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleImageUrlChange = (url: string) => {
    handleInputChange("imageLink", url);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stockId || !formData.carat || !formData.price) {
      toast.error("Stock ID, Carat, and Price are required.");
      return;
    }
    await dispatch(updateDiamondDetails({ id: diamondId, data: formData }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Diamond Data...</p>
      </div>
    );
  }

  if (singleStatus === "failed" || !singleDiamond) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Diamond Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested diamond could not be loaded.
        </p>
        <Button onClick={() => router.push("/admin/inventory")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Diamond</h1>
            <p className="text-muted-foreground">
              Stock ID: {formData.stockId || "..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
          {" "}
          {/* Added padding for sticky footer */}
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" /> Image & Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative aspect-square">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                      sizes="33vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleImageUrlChange("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="imageLink">Image URL</Label>
                  <Input
                    id="imageLink"
                    value={formData.imageLink || ""}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="videoLink">Video URL</Label>
                  <Input
                    id="videoLink"
                    value={formData.videoLink || ""}
                    onChange={(e) =>
                      handleInputChange("videoLink", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="certLink">Certificate URL</Label>
                  <Input
                    id="certLink"
                    value={formData.certLink || ""}
                    onChange={(e) =>
                      handleInputChange("certLink", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Status & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="isActive" className="font-medium">
                    Available for Sale
                  </Label>
                  <Switch
                    id="isActive"
                    checked={!!formData.isActive}
                    onCheckedChange={(c) => handleInputChange("isActive", c)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type ?? ""}
                    onValueChange={(v) => handleInputChange("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATURAL">Natural</SelectItem>
                      <SelectItem value="LAB GROWN">Lab Grown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gem className="h-5 w-5" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stockId">Stock ID *</Label>
                  <Input
                    id="stockId"
                    value={formData.stockId || ""}
                    onChange={(e) =>
                      handleInputChange("stockId", e.target.value)
                    }
                    required
                  />
                </div>
                {/* FIX: Use `?? ""` to ensure the value is never undefined, showing the correct selected item */}
                <div className="space-y-1.5">
                  <Label htmlFor="shape">Shape *</Label>
                  <Select
                    value={formData.shape ?? ""}
                    onValueChange={(v) => handleInputChange("shape", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shapes.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carat">Carat *</Label>
                  <Input
                    id="carat"
                    type="number"
                    step="0.01"
                    value={formData.carat ?? ""}
                    onChange={(e) =>
                      handleNumberInputChange("carat", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price ?? ""}
                    onChange={(e) =>
                      handleNumberInputChange("price", e.target.value)
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" /> Diamond Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="color">Color *</Label>
                  <Select
                    value={formData.color ?? ""}
                    onValueChange={(v) => handleInputChange("color", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clarity">Clarity *</Label>
                  <Select
                    value={formData.clarity ?? ""}
                    onValueChange={(v) => handleInputChange("clarity", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clarities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cut">Cut</Label>
                  <Select
                    value={formData.cut ?? ""}
                    onValueChange={(v) => handleInputChange("cut", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cuts.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="polish">Polish</Label>
                  <Select
                    value={formData.polish ?? ""}
                    onValueChange={(v) => handleInputChange("polish", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {polishes.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="symmetry">Symmetry</Label>
                  <Select
                    value={formData.symmetry ?? ""}
                    onValueChange={(v) => handleInputChange("symmetry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {symmetries.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fluorescenceIntensity">Fluorescence</Label>
                  <Select
                    value={formData.fluorescenceIntensity ?? ""}
                    onValueChange={(v) =>
                      handleInputChange("fluorescenceIntensity", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fluorescences.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Certificate & Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lab">Laboratory</Label>
                    <Select
                      value={formData.lab ?? ""}
                      onValueChange={(v) => handleInputChange("lab", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {labs.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reportNumber">Report #</Label>
                    <Input
                      id="reportNumber"
                      value={formData.reportNumber || ""}
                      onChange={(e) =>
                        handleInputChange("reportNumber", e.target.value)
                      }
                    />
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.length ?? ""}
                      onChange={(e) =>
                        handleNumberInputChange("length", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width ?? ""}
                      onChange={(e) =>
                        handleNumberInputChange("width", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.height ?? ""}
                      onChange={(e) =>
                        handleNumberInputChange("height", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="table">Table %</Label>
                    <Input
                      id="table"
                      type="number"
                      step="0.1"
                      value={formData.table ?? ""}
                      onChange={(e) =>
                        handleNumberInputChange("table", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="depth">Depth %</Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.1"
                      value={formData.depth ?? ""}
                      onChange={(e) =>
                        handleNumberInputChange("depth", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer for Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container max-w-6xl mx-auto flex items-center justify-end h-20 px-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
