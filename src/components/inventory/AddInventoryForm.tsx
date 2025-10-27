"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/lib/store";
import {
  addManualDiamond,
  resetActionStatus,
} from "@/lib/features/inventory/inventorySlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardEdit,
  Upload,
  RefreshCw,
  Server,
  Loader2,
  User,
  Gem,
  Palette,
  Ruler,
  FileText,
  MapPin,
  Sparkles,
  Camera,
  Award,
} from "lucide-react";
import { CsvMappingUploader } from "@/components/inventory/CsvMappingUploader";
import { HttpMappingUploader } from "@/components/inventory/HttpMappingUploader";
import { FtpMappingUploader } from "@/components/inventory/FtpMappingUploader";

const initialManualState = {
  stockId: "",
  availability: "",
  shape: "",
  carat: "",
  color: "",
  clarity: "",
  cut: "",
  polish: "",
  symmetry: "",
  length: "",
  width: "",
  height: "",
  depthPercent: "",
  tablePercent: "",
  pricePerCarat: "",
  price: "",
  lab: "",
  reportNumber: "",
  inscription: "",
  certificateComment: "",
  certificateLink: "",
  videoLink: "",
  imageLink: "",
  fluorescenceIntensity: "",
  fluorescenceColor: "",
  girdleThin: "",
  girdleThick: "",
  girdlePercent: "",
  girdleCondition: "",
  culetSize: "",
  culetCondition: "",
  crownHeight: "",
  crownAngle: "",
  pavilionDepth: "",
  pavilionAngle: "",
  shade: "",
  milky: "",
  eyeClean: "",
  treatment: "",
  keyToSymbols: "",
  whiteInclusion: "",
  blackInclusion: "",
  openInclusion: "",
  fancyColor: "",
  fancyColorIntensity: "",
  fancyColorOvertone: "",
  location: "",
  state: "",
  city: "",
  type: "LAB GROWN",
  countryOfPolishing: "",
};

export default function AddInventoryForm() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const { actionStatus, error, summary } = useSelector(
    (state: RootState) => state.inventory
  );
  const isLoading = actionStatus === "loading";

  const [manualForm, setManualForm] = useState(initialManualState);

  const sellerId = searchParams.get("sellerId");

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast({
        title: "Success!",
        description: summary?.message || "Operation completed successfully.",
      });
      setManualForm(initialManualState);
      dispatch(resetActionStatus());
    }
    if (actionStatus === "failed" && error) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error,
      });
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, summary, dispatch, toast]);

  const handleManualChange = (e: ChangeEvent<HTMLInputElement>) =>
    setManualForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleManualSelectChange = (name: string, value: string) =>
    setManualForm((prev) => ({ ...prev, [name]: value }));

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualForm.stockId || !manualForm.carat) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Stock ID and Carat are required.",
      });
      return;
    }
    dispatch(addManualDiamond({ ...manualForm, sellerId }));
  };

  const renderInputField = (
    name: keyof typeof initialManualState,
    label: string,
    type = "text",
    required = false,
    placeholder = ""
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        name={name}
        id={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={manualForm[name]}
        onChange={handleManualChange}
        required={required}
        disabled={isLoading}
        placeholder={placeholder}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderSelectField = (
    name: keyof typeof initialManualState,
    label: string,
    options: { value: string; label: string }[],
    required = false
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        name={name}
        value={manualForm[name]}
        onValueChange={(value) => handleManualSelectChange(name, value)}
        required={required}
        disabled={isLoading}
      >
        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Gem className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add Inventory
            </h1>
          </div>
          {sellerId ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <User className="h-4 w-4" />
              Adding inventory for specific seller
            </div>
          ) : (
            <p className="text-gray-600 mt-2">
              Choose a method to add or sync items to your inventory
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg h-auto">
                <TabsTrigger
                  value="manual"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md py-3 transition-all"
                >
                  <ClipboardEdit className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Manual Entry</span>
                  <span className="sm:hidden">Manual</span>
                </TabsTrigger>
                <TabsTrigger
                  value="csv"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md py-3 transition-all"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">CSV Upload</span>
                  <span className="sm:hidden">CSV</span>
                </TabsTrigger>
                <TabsTrigger
                  value="api_sync"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md py-3 transition-all"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">API Sync</span>
                  <span className="sm:hidden">API</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ftp"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md py-3 transition-all"
                >
                  <Server className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">FTP Sync</span>
                  <span className="sm:hidden">FTP</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="mt-6">
                <form onSubmit={handleManualSubmit}>
                  <div className="space-y-6">
                    <ScrollArea className="h-[65vh] pr-4">
                      <div className="space-y-8">
                        {/* Essential Information */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Gem className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Essential Information
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderInputField(
                              "stockId",
                              "Stock ID",
                              "text",
                              true,
                              "e.g., DIA-12345"
                            )}
                            {renderInputField(
                              "carat",
                              "Carat Weight",
                              "number",
                              true,
                              "0.00"
                            )}
                            {renderInputField(
                              "price",
                              "Total Price",
                              "number",
                              false,
                              "$0.00"
                            )}
                            {renderInputField(
                              "pricePerCarat",
                              "Price Per Carat",
                              "number",
                              false,
                              "$0.00"
                            )}
                            {renderSelectField(
                              "type",
                              "Diamond Type",
                              [
                                { value: "LAB GROWN", label: "Lab Grown" },
                                { value: "NATURAL", label: "Natural" },
                                { value: "CVD", label: "CVD" },
                                { value: "HPHT", label: "HPHT" },
                              ],
                              true
                            )}
                            {renderSelectField("availability", "Availability", [
                              { value: "Available", label: "Available" },
                              { value: "On Hold", label: "On Hold" },
                              { value: "Sold", label: "Sold" },
                              { value: "Reserved", label: "Reserved" },
                            ])}
                          </div>
                        </div>

                        {/* Diamond Characteristics */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Diamond Characteristics
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {renderSelectField("shape", "Shape", [
                              { value: "Round", label: "Round" },
                              { value: "Princess", label: "Princess" },
                              { value: "Cushion", label: "Cushion" },
                              { value: "Emerald", label: "Emerald" },
                              { value: "Oval", label: "Oval" },
                              { value: "Pear", label: "Pear" },
                              { value: "Marquise", label: "Marquise" },
                              { value: "Radiant", label: "Radiant" },
                              { value: "Asscher", label: "Asscher" },
                              { value: "Heart", label: "Heart" },
                            ])}
                            {renderInputField(
                              "color",
                              "Color Grade",
                              "text",
                              false,
                              "D-Z"
                            )}
                            {renderInputField(
                              "clarity",
                              "Clarity Grade",
                              "text",
                              false,
                              "FL-I3"
                            )}
                            {renderInputField(
                              "cut",
                              "Cut Grade",
                              "text",
                              false,
                              "Excellent"
                            )}
                            {renderInputField(
                              "polish",
                              "Polish",
                              "text",
                              false,
                              "Excellent"
                            )}
                            {renderInputField(
                              "symmetry",
                              "Symmetry",
                              "text",
                              false,
                              "Excellent"
                            )}
                            {renderInputField(
                              "fluorescenceIntensity",
                              "Fluorescence",
                              "text",
                              false,
                              "None"
                            )}
                            {renderInputField(
                              "fluorescenceColor",
                              "Fluorescence Color",
                              "text",
                              false,
                              "Blue"
                            )}
                          </div>
                        </div>

                        {/* Measurements */}
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Ruler className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Measurements & Proportions
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {renderInputField(
                              "length",
                              "Length (mm)",
                              "number",
                              false,
                              "0.00"
                            )}
                            {renderInputField(
                              "width",
                              "Width (mm)",
                              "number",
                              false,
                              "0.00"
                            )}
                            {renderInputField(
                              "height",
                              "Height (mm)",
                              "number",
                              false,
                              "0.00"
                            )}
                            {renderInputField(
                              "depthPercent",
                              "Depth %",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "tablePercent",
                              "Table %",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "crownHeight",
                              "Crown Height",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "crownAngle",
                              "Crown Angle",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "pavilionDepth",
                              "Pavilion Depth",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "pavilionAngle",
                              "Pavilion Angle",
                              "number",
                              false,
                              "0.0"
                            )}
                            {renderInputField(
                              "girdleThin",
                              "Girdle Thin",
                              "text"
                            )}
                            {renderInputField(
                              "girdleThick",
                              "Girdle Thick",
                              "text"
                            )}
                            {renderInputField(
                              "girdlePercent",
                              "Girdle %",
                              "number"
                            )}
                            {renderInputField(
                              "girdleCondition",
                              "Girdle Condition",
                              "text"
                            )}
                            {renderInputField(
                              "culetSize",
                              "Culet Size",
                              "text"
                            )}
                            {renderInputField(
                              "culetCondition",
                              "Culet Condition",
                              "text"
                            )}
                          </div>
                        </div>

                        {/* Certificate & Documentation */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Award className="h-5 w-5 text-amber-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Certificate & Documentation
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderInputField(
                              "lab",
                              "Grading Lab",
                              "text",
                              false,
                              "GIA, IGI, etc."
                            )}
                            {renderInputField(
                              "reportNumber",
                              "Certificate Number",
                              "text"
                            )}
                            {renderInputField(
                              "inscription",
                              "Inscription",
                              "text"
                            )}
                            {renderInputField(
                              "certificateComment",
                              "Certificate Comment",
                              "text"
                            )}
                            {renderInputField(
                              "certificateLink",
                              "Certificate URL",
                              "url"
                            )}
                            {renderInputField(
                              "keyToSymbols",
                              "Key to Symbols",
                              "text"
                            )}
                          </div>
                        </div>

                        {/* Media Links */}
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Camera className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Media & Visuals
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderInputField("imageLink", "Image URL", "url")}
                            {renderInputField("videoLink", "Video URL", "url")}
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-lg border border-rose-100">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-rose-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Additional Details
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {renderInputField("shade", "Shade", "text")}
                            {renderInputField("milky", "Milky", "text")}
                            {renderInputField("eyeClean", "Eye Clean", "text")}
                            {renderInputField("treatment", "Treatment", "text")}
                            {renderInputField(
                              "whiteInclusion",
                              "White Inclusion",
                              "text"
                            )}
                            {renderInputField(
                              "blackInclusion",
                              "Black Inclusion",
                              "text"
                            )}
                            {renderInputField(
                              "openInclusion",
                              "Open Inclusion",
                              "text"
                            )}
                            {renderInputField(
                              "fancyColor",
                              "Fancy Color",
                              "text"
                            )}
                            {renderInputField(
                              "fancyColorIntensity",
                              "Color Intensity",
                              "text"
                            )}
                            {renderInputField(
                              "fancyColorOvertone",
                              "Color Overtone",
                              "text"
                            )}
                          </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-100">
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-cyan-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Location Details
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {renderInputField("location", "Location", "text")}
                            {renderInputField("city", "City", "text")}
                            {renderInputField(
                              "state",
                              "State/Province",
                              "text"
                            )}
                            {renderInputField(
                              "countryOfPolishing",
                              "Country of Polishing",
                              "text"
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className="pt-4 border-t">
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving Diamond...
                          </>
                        ) : (
                          <>
                            <Gem className="mr-2 h-5 w-5" />
                            Add Diamond to Inventory
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="csv" className="mt-6">
                <CsvMappingUploader sellerId={sellerId} />
              </TabsContent>
              <TabsContent value="api_sync" className="mt-6">
                <HttpMappingUploader sellerId={sellerId} />
              </TabsContent>
              <TabsContent value="ftp" className="mt-6">
                <FtpMappingUploader sellerId={sellerId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
