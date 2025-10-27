"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchDiamondById,
  updateDiamondDetails,
  resetActionStatus,
} from "@/lib/features/inventory/inventorySlice";
import { toast } from "sonner";
import Image from "next/image";

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

  const { currentDiamond, singleStatus, actionStatus, error, summary } =
    useSelector((state: RootState) => state.inventory);

  const diamondId = params.id as string;
  const isLoading = singleStatus === "loading";
  const isSaving = actionStatus === "loading";

  const [formData, setFormData] = useState({
    stockId: "",
    shape: "",
    carat: 0,
    color: "",
    clarity: "",
    cut: "",
    polish: "",
    symmetry: "",
    fluorescenceIntensity: "",
    price: 0,
    lab: "",
    reportNumber: "",
    imageLink: "",
    videoLink: "",
    certLink: "",
    length: 0,
    width: 0,
    height: 0,
    table: 0,
    depth: 0,
    girdle: "",
    culet: "",
    location: "",
    type: "NATURAL",
    isActive: true,
    description: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (diamondId) {
      dispatch(fetchDiamondById(diamondId));
    }
  }, [dispatch, diamondId]);

  useEffect(() => {
    if (currentDiamond) {
      setFormData({
        stockId: currentDiamond.stockId || "",
        shape: currentDiamond.shape || "",
        carat: currentDiamond.carat || 0,
        color: currentDiamond.color || "",
        clarity: currentDiamond.clarity || "",
        cut: currentDiamond.cut || "",
        polish: currentDiamond.polish || "",
        symmetry: currentDiamond.symmetry || "",
        fluorescenceIntensity: currentDiamond.fluorescenceIntensity || "",
        price: currentDiamond.price || 0,
        lab: currentDiamond.lab || "",
        reportNumber: currentDiamond.reportNumber || "",
        imageLink: currentDiamond.imageLink || "",
        videoLink: currentDiamond.videoLink || "",
        certLink: currentDiamond.certLink || "",
        length: currentDiamond.length || 0,
        width: currentDiamond.width || 0,
        height: currentDiamond.height || 0,
        table: currentDiamond.table || 0,
        depth: currentDiamond.depth || 0,
        girdle: currentDiamond.girdle || "",
        culet: currentDiamond.culet || "",
        location: currentDiamond.location || "",
        type: currentDiamond.type || "NATURAL",
        isActive: currentDiamond.isActive !== false,
        description: currentDiamond.description || "",
      });
      setImagePreview(currentDiamond.imageLink || null);
    }
  }, [currentDiamond]);

  useEffect(() => {
    if (actionStatus === "succeeded" && summary) {
      toast.success(summary.message || "Diamond updated successfully");
      dispatch(resetActionStatus());
      router.push("/admin/inventory");
    }
    if (actionStatus === "failed" && error) {
      toast.error(error);
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, summary, dispatch, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUrlChange = (url: string) => {
    handleInputChange("imageLink", url);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.stockId ||
      !formData.shape ||
      !formData.carat ||
      !formData.color ||
      !formData.clarity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    // Clean up the data - convert strings to numbers where needed
    const updateData = {
      ...formData,
      carat: Number(formData.carat),
      price: Number(formData.price),
      length: formData.length ? Number(formData.length) : null,
      width: formData.width ? Number(formData.width) : null,
      height: formData.height ? Number(formData.height) : null,
      table: formData.table ? Number(formData.table) : null,
      depth: formData.depth ? Number(formData.depth) : null,
    };

    await dispatch(
      updateDiamondDetails({
        id: diamondId,
        data: updateData,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading diamond details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDiamond) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Diamond Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The diamond you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => router.push("/admin/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/inventory")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Diamond</h1>
          <p className="text-muted-foreground">Update diamond details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Media */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diamond Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative aspect-square">
                      <Image
                        src={imagePreview}
                        alt="Diamond Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          handleInputChange("imageLink", "");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="imageLink">Image URL</Label>
                    <Input
                      id="imageLink"
                      type="url"
                      value={formData.imageLink}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/diamond.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoLink">Video URL (Optional)</Label>
                    <Input
                      id="videoLink"
                      type="url"
                      value={formData.videoLink}
                      onChange={(e) =>
                        handleInputChange("videoLink", e.target.value)
                      }
                      placeholder="https://example.com/diamond-video"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certLink">Certificate URL (Optional)</Label>
                    <Input
                      id="certLink"
                      type="url"
                      value={formData.certLink}
                      onChange={(e) =>
                        handleInputChange("certLink", e.target.value)
                      }
                      placeholder="https://example.com/certificate.pdf"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active Status</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Diamond Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATURAL">Natural</SelectItem>
                      <SelectItem value="LAB GROWN">Lab Grown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Mumbai, India"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Diamond Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockId">Stock ID *</Label>
                    <Input
                      id="stockId"
                      value={formData.stockId}
                      onChange={(e) =>
                        handleInputChange("stockId", e.target.value)
                      }
                      placeholder="STK001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shape">Shape *</Label>
                    <Select
                      value={formData.shape}
                      onValueChange={(value) =>
                        handleInputChange("shape", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shape" />
                      </SelectTrigger>
                      <SelectContent>
                        {shapes.map((shape) => (
                          <SelectItem key={shape} value={shape}>
                            {shape}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carat">Carat *</Label>
                    <Input
                      id="carat"
                      type="number"
                      step="0.01"
                      value={formData.carat}
                      onChange={(e) =>
                        handleInputChange("carat", e.target.value)
                      }
                      placeholder="1.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diamond Grading */}
            <Card>
              <CardHeader>
                <CardTitle>Diamond Grading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color *</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) =>
                        handleInputChange("color", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clarity">Clarity *</Label>
                    <Select
                      value={formData.clarity}
                      onValueChange={(value) =>
                        handleInputChange("clarity", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clarity" />
                      </SelectTrigger>
                      <SelectContent>
                        {clarities.map((clarity) => (
                          <SelectItem key={clarity} value={clarity}>
                            {clarity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cut">Cut</Label>
                    <Select
                      value={formData.cut}
                      onValueChange={(value) => handleInputChange("cut", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cut" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuts.map((cut) => (
                          <SelectItem key={cut} value={cut}>
                            {cut}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="polish">Polish</Label>
                    <Select
                      value={formData.polish}
                      onValueChange={(value) =>
                        handleInputChange("polish", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select polish" />
                      </SelectTrigger>
                      <SelectContent>
                        {polishes.map((polish) => (
                          <SelectItem key={polish} value={polish}>
                            {polish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symmetry">Symmetry</Label>
                    <Select
                      value={formData.symmetry}
                      onValueChange={(value) =>
                        handleInputChange("symmetry", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select symmetry" />
                      </SelectTrigger>
                      <SelectContent>
                        {symmetries.map((symmetry) => (
                          <SelectItem key={symmetry} value={symmetry}>
                            {symmetry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fluorescenceIntensity">Fluorescence</Label>
                    <Select
                      value={formData.fluorescenceIntensity}
                      onValueChange={(value) =>
                        handleInputChange("fluorescenceIntensity", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fluorescence" />
                      </SelectTrigger>
                      <SelectContent>
                        {fluorescences.map((fluor) => (
                          <SelectItem key={fluor} value={fluor}>
                            {fluor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Information */}
            <Card>
              <CardHeader>
                <CardTitle>Certificate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lab">Laboratory</Label>
                    <Select
                      value={formData.lab}
                      onValueChange={(value) => handleInputChange("lab", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab" />
                      </SelectTrigger>
                      <SelectContent>
                        {labs.map((lab) => (
                          <SelectItem key={lab} value={lab}>
                            {lab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportNumber">Report Number</Label>
                    <Input
                      id="reportNumber"
                      value={formData.reportNumber}
                      onChange={(e) =>
                        handleInputChange("reportNumber", e.target.value)
                      }
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (mm)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.length}
                      onChange={(e) =>
                        handleInputChange("length", e.target.value)
                      }
                      placeholder="6.50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (mm)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width}
                      onChange={(e) =>
                        handleInputChange("width", e.target.value)
                      }
                      placeholder="6.45"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (mm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                      placeholder="3.95"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="table">Table %</Label>
                    <Input
                      id="table"
                      type="number"
                      step="0.1"
                      value={formData.table}
                      onChange={(e) =>
                        handleInputChange("table", e.target.value)
                      }
                      placeholder="57"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depth">Depth %</Label>
                    <Input
                      id="depth"
                      type="number"
                      step="0.1"
                      value={formData.depth}
                      onChange={(e) =>
                        handleInputChange("depth", e.target.value)
                      }
                      placeholder="61"
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="girdle">Girdle</Label>
                    <Input
                      id="girdle"
                      value={formData.girdle}
                      onChange={(e) =>
                        handleInputChange("girdle", e.target.value)
                      }
                      placeholder="Medium to Slightly Thick"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="culet">Culet</Label>
                    <Input
                      id="culet"
                      value={formData.culet}
                      onChange={(e) =>
                        handleInputChange("culet", e.target.value)
                      }
                      placeholder="None"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Additional details about this diamond..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/inventory")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
