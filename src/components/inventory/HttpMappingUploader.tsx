"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
// ✨ 1. `axios` ko hata dein, naye Redux thunks import karein ✨
import { AppDispatch, RootState } from "@/lib/store";
import {
  syncFromApi,
  previewApiHeaders,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Link as LinkIcon,
  UploadCloud,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DATABASE_FIELDS } from "./databaseFields";

export function HttpMappingUploader({ sellerId }: { sellerId: string | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const { actionStatus } = useSelector((state: RootState) => state.inventory);
  const isLoading = actionStatus === "loading";

  const [apiUrl, setApiUrl] = useState("");
  const [apiHeaders, setApiHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string>("");

  const handlePreview = async () => {
    if (!apiUrl) {
      toast.error("Please enter a valid API URL.");
      return;
    }

    setIsPreviewing(true);
    setApiHeaders([]);
    setMapping({});
    setPreviewError("");

    // ✨ 2. `axios.post` ki jagah Redux thunk ko `dispatch` karein ✨
    try {
      console.log("Dispatching previewApiHeaders for:", apiUrl);
      const resultAction = await dispatch(previewApiHeaders(apiUrl));

      if (previewApiHeaders.fulfilled.match(resultAction)) {
        console.log("Preview response:", resultAction.payload);
        const headers = resultAction.payload.headers || [];

        if (Array.isArray(headers) && headers.length > 0) {
          setApiHeaders(headers);

          // Auto-mapping logic
          const newMapping: Record<string, string> = {};
          let mappedCount = 0;
          DATABASE_FIELDS.forEach((field) => {
            const normalize = (str: string) =>
              str.toLowerCase().replace(/[\s_-]/g, "");
            const matchedHeader = headers.find(
              (h) =>
                normalize(h) === normalize(field.name) ||
                normalize(h) === normalize(field.label)
            );
            if (matchedHeader) {
              newMapping[field.name] = matchedHeader;
              mappedCount++;
            }
          });
          setMapping(newMapping);

          toast.success("Headers fetched successfully!", {
            description:
              mappedCount > 0
                ? `${mappedCount} fields auto-mapped. Please review.`
                : "Please map the fields below.",
          });
        } else {
          throw new Error("No headers found in the API response.");
        }
      } else {
        // Agar thunk reject hota hai, to error throw karein
        const errorMessage =
          (resultAction.payload as string) ||
          "Failed to fetch headers from API.";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      const errorDetails = error.message;
      setPreviewError(errorDetails);
      toast.error("Failed to fetch headers", {
        description: errorDetails,
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleMappingChange = (schemaField: string, apiHeader: string) => {
    setMapping((prev) => {
      if (apiHeader === "none") {
        const newMapping = { ...prev };
        delete newMapping[schemaField];
        return newMapping;
      }
      return { ...prev, [schemaField]: apiHeader };
    });
  };

  const handleSync = () => {
    if (!apiUrl) {
      toast.error("The API URL is required.");
      return;
    }
    if (!mapping.stockId || !mapping.carat) {
      toast.error("Mapping Error", {
        description: "Please map at least the 'Stock #' and 'Carat' fields.",
      });
      return;
    }
    console.log("Starting sync with:", { apiUrl, mapping, sellerId });
    dispatch(syncFromApi({ apiUrl, mapping, sellerId }));
  };

  // --- JSX (No changes needed below) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync from API / URL</CardTitle>
        <CardDescription>
          Provide a URL to a JSON or CSV data source to sync your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="apiUrl" className="text-base font-semibold">
            Step 1: Enter the API/URL
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="apiUrl"
              type="url"
              placeholder="https://provider.com/api/diamonds.json"
              value={apiUrl}
              onChange={(e) => {
                setApiUrl(e.target.value);
                setPreviewError("");
              }}
              className="flex-grow"
              disabled={isLoading || isPreviewing}
            />
            <Button
              type="button"
              onClick={handlePreview}
              disabled={isPreviewing || !apiUrl || isLoading}
            >
              {isPreviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
              )}
              {isPreviewing ? "Loading..." : "Preview Headers"}
            </Button>
          </div>
          {previewError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{previewError}</AlertDescription>
            </Alert>
          )}
        </div>

        {apiHeaders.length > 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                Step 2: Map the API Fields
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Required fields are marked with *. Found {apiHeaders.length}{" "}
                fields in the API response.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-2 border rounded-md max-h-[400px] overflow-y-auto">
              {DATABASE_FIELDS.map((field) => (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={`map-${field.name}`} className="text-xs">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleMappingChange(field.name, value)
                    }
                    value={mapping[field.name] || ""}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Do Not Map --</SelectItem>
                      {apiHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Mapped {Object.keys(mapping).length} out of{" "}
                {DATABASE_FIELDS.length} fields.
                {(!mapping.stockId || !mapping.carat) && (
                  <span className="text-destructive font-semibold">
                    {" "}
                    Please map Stock # and Carat to proceed.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSync}
          disabled={
            isLoading ||
            apiHeaders.length === 0 ||
            !mapping.stockId ||
            !mapping.carat
          }
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Syncing..." : "Start Synchronization"}
        </Button>
      </CardFooter>
    </Card>
  );
}
