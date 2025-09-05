"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";

// Redux Imports
import { AppDispatch, RootState } from "@/lib/store";
import {
  uploadCsv,
  uploadHttp,
  uploadFtp,
  resetInventoryStatus,
  addManualDiamond, // Naya thunk import karein
} from "@/lib/features/inventory/inventorySlice";
import { CsvMapping } from "@/lib/features/inventory/inventorySlice";

// UI Components
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardEdit, Upload, Link as LinkIcon, Server } from "lucide-react";

// Manual form ke liye poora initial state
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

// CSV file ke hisaab se poori mapping
const sampleMapping: CsvMapping = {
  "Stock #": "stockId",
  Availability: "availability",
  Shape: "shape",
  Weight: "carat",
  Color: "color",
  Clarity: "clarity",
  Cut: "cut",
  polish: "polish",
  Symmetry: "symmetry",
  "Fluorescence Intensity": "fluorescenceIntensity",
  "Fluorescence Color": "fluorescenceColor",
  Length: "length",
  Width: "width",
  Height: "height",
  Shade: "shade",
  Milky: "milky",
  "Eye Clean": "eyeClean",
  Lab: "lab",
  "Report #": "reportNumber",
  Location: "location",
  Treatment: "treatment",
  "Price Per Carat": "pricePerCarat",
  "Final Price": "price",
  "Depth %": "depthPercent",
  "Table %": "tablePercent",
  "Girdle Thin": "girdleThin",
  "Girdle Thick": "girdleThick",
  "Girdle %": "girdlePercent",
  "Girdle Condition": "girdleCondition",
  "Culet Size": "culetSize",
  "Culet Condition": "culetCondition",
  "Crown Height": "crownHeight",
  "Crown Angle": "crownAngle",
  "Pavilion Depth": "pavilionDepth",
  "Pavilion Angle": "pavilionAngle",
  Inscription: "inscription",
  "Cert comment": "certificateComment",
  KeyToSymbols: "keyToSymbols",
  "White Inclusion": "whiteInclusion",
  "Black Inclusion": "blackInclusion",
  "Open Inclusion": "openInclusion",
  "Fancy Color": "fancyColor",
  "Fancy Color Intensity": "fancyColorIntensity",
  "Fancy Color Overtone": "fancyColorOvertone",
  State: "state",
  City: "city",
  CertFile: "certificateLink",
  "Diamond Video": "videoLink",
  "Diamond Image": "imageLink",
  Type: "type",
  "Country of Polishing": "countryOfPolishing",
};

export default function AddInventoryPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { status, error, summary } = useSelector(
    (state: RootState) => state.inventory
  );
  const isLoading = status === "loading";

  const [manualForm, setManualForm] = useState(initialManualState);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [httpUrl, setHttpUrl] = useState("");
  const [ftpCreds, setFtpCreds] = useState({
    host: "",
    user: "",
    password: "",
    path: "",
  });

  useEffect(() => {
    if (status === "succeeded") {
      toast({
        title: "Process Complete!",
        description: summary
          ? `Successfully processed: ${summary.successfullyUpserted}. Failed: ${summary.failedRows}.`
          : "Diamond added/updated successfully!",
      });
      // Sabhi forms ko reset karna
      setCsvFile(null);
      setHttpUrl("");
      setManualForm(initialManualState);
      setFtpCreds({ host: "", user: "", password: "", path: "" });
      dispatch(resetInventoryStatus());
    }
    if (status === "failed" && error) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error,
      });
      dispatch(resetInventoryStatus());
    }
  }, [status, error, summary, dispatch, toast]);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFtpCreds((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCsvFile(e.target.files[0]);
  };

  // --- SUBMIT HANDLERS ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addManualDiamond(manualForm));
  };

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    dispatch(uploadCsv({ csvFile, mapping: sampleMapping }));
  };

  const handleHttpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!httpUrl) return;
    dispatch(uploadHttp({ url: httpUrl, mapping: sampleMapping }));
  };

  const handleFtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(uploadFtp({ ...ftpCreds, mapping: sampleMapping }));
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            Add Inventory
          </CardTitle>
          <CardDescription>
            Choose a method to add items to your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual">
                <ClipboardEdit className="mr-2 h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="csv">
                <Upload className="mr-2 h-4 w-4" />
                CSV
              </TabsTrigger>
              <TabsTrigger value="http">
                <LinkIcon className="mr-2 h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="ftp">
                <Server className="mr-2 h-4 w-4" />
                FTP
              </TabsTrigger>
            </TabsList>

            {/* MANUAL ENTRY TAB */}
            <TabsContent value="manual">
              <Card>
                <form onSubmit={handleManualSubmit}>
                  <CardHeader>
                    <CardTitle>Manual Diamond Entry</CardTitle>
                    <CardDescription>
                      Enter details for a single diamond.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[50vh] pr-6">
                      <div className="space-y-6">
                        {/* Key Information */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Key Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="stockId">Stock #</Label>
                              <Input
                                name="stockId"
                                value={manualForm.stockId}
                                onChange={handleManualChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="carat">Carat (Weight)</Label>
                              <Input
                                name="carat"
                                type="number"
                                step="0.01"
                                value={manualForm.carat}
                                onChange={handleManualChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="price">Price ($)</Label>
                              <Input
                                name="price"
                                type="number"
                                step="0.01"
                                value={manualForm.price}
                                onChange={handleManualChange}
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Characteristics */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Characteristics
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label>Shape</Label>
                              <Input
                                name="shape"
                                value={manualForm.shape}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Color</Label>
                              <Input
                                name="color"
                                value={manualForm.color}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Clarity</Label>
                              <Input
                                name="clarity"
                                value={manualForm.clarity}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Cut</Label>
                              <Input
                                name="cut"
                                value={manualForm.cut}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Polish</Label>
                              <Input
                                name="polish"
                                value={manualForm.polish}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Symmetry</Label>
                              <Input
                                name="symmetry"
                                value={manualForm.symmetry}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Eye Clean</Label>
                              <Input
                                name="eyeClean"
                                value={manualForm.eyeClean}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Lab & Report */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Lab & Report
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label>Lab</Label>
                              <Input
                                name="lab"
                                value={manualForm.lab}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Report #</Label>
                              <Input
                                name="reportNumber"
                                value={manualForm.reportNumber}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Measurements */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Measurements
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label>Length (mm)</Label>
                              <Input
                                name="length"
                                type="number"
                                step="0.01"
                                value={manualForm.length}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Width (mm)</Label>
                              <Input
                                name="width"
                                type="number"
                                step="0.01"
                                value={manualForm.width}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Height (mm)</Label>
                              <Input
                                name="height"
                                type="number"
                                step="0.01"
                                value={manualForm.height}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Depth %</Label>
                              <Input
                                name="depthPercent"
                                type="number"
                                step="0.1"
                                value={manualForm.depthPercent}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Table %</Label>
                              <Input
                                name="tablePercent"
                                type="number"
                                step="0.1"
                                value={manualForm.tablePercent}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Media Links */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Media Links
                          </h3>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <Label>Certificate Link</Label>
                              <Input
                                name="certificateLink"
                                type="url"
                                value={manualForm.certificateLink}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Video Link</Label>
                              <Input
                                name="videoLink"
                                type="url"
                                value={manualForm.videoLink}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Image Link</Label>
                              <Input
                                name="imageLink"
                                type="url"
                                value={manualForm.imageLink}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Additional Details */}
                        <div>
                          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                            Additional Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label>Availability</Label>
                              <Input
                                name="availability"
                                value={manualForm.availability}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Location</Label>
                              <Input
                                name="location"
                                value={manualForm.location}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>City</Label>
                              <Input
                                name="city"
                                value={manualForm.city}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Treatment</Label>
                              <Input
                                name="treatment"
                                value={manualForm.treatment}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Type</Label>
                              <Input
                                name="type"
                                value={manualForm.type}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Price Per Carat</Label>
                              <Input
                                name="pricePerCarat"
                                type="number"
                                step="0.01"
                                value={manualForm.pricePerCarat}
                                onChange={handleManualChange}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Add Diamond Manually"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* CSV UPLOAD TAB */}
            <TabsContent value="csv">
              <Card>
                <form onSubmit={handleCsvSubmit}>
                  <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>
                      Add multiple items by uploading a formatted CSV file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csvFile">CSV File</Label>
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        required
                        disabled={isLoading}
                      />
                      {csvFile && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected file: {csvFile.name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !csvFile}
                    >
                      {isLoading ? "Processing..." : "Upload and Process CSV"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* HTTP URL TAB */}
            <TabsContent value="http">
              <Card>
                <form onSubmit={handleHttpSubmit}>
                  <CardHeader>
                    <CardTitle>Sync from HTTP/API URL</CardTitle>
                    <CardDescription>
                      Provide a URL to a CSV file to sync inventory.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="httpUrl">Public URL</Label>
                      <Input
                        id="httpUrl"
                        type="url"
                        placeholder="https://example.com/inventory.csv"
                        value={httpUrl}
                        onChange={(e) => setHttpUrl(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !httpUrl}
                    >
                      {isLoading ? "Syncing..." : "Start Sync from URL"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* FTP TAB */}
            <TabsContent value="ftp">
              <Card>
                <form onSubmit={handleFtpSubmit}>
                  <CardHeader>
                    <CardTitle>Sync from FTP Server</CardTitle>
                    <CardDescription>
                      Provide FTP credentials to sync inventory from a file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="host">FTP Host</Label>
                        <Input
                          name="host"
                          id="host"
                          value={ftpCreds.host}
                          onChange={handleFtpChange}
                          placeholder="ftp.example.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user">Username</Label>
                        <Input
                          name="user"
                          id="user"
                          value={ftpCreds.user}
                          onChange={handleFtpChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          name="password"
                          id="password"
                          type="password"
                          value={ftpCreds.password}
                          onChange={handleFtpChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="path">File Path</Label>
                        <Input
                          name="path"
                          id="path"
                          placeholder="/path/to/inventory.csv"
                          value={ftpCreds.path}
                          onChange={handleFtpChange}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Connecting..." : "Start Sync from FTP"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
