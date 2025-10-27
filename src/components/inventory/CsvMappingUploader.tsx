"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
// ✨ 1. `Papa` ko hata dein, naye Redux thunks import karein ✨
import { AppDispatch, RootState } from "@/lib/store";
import {
  uploadCsv,
  previewCsvHeaders,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud } from "lucide-react";
import { DATABASE_FIELDS } from "./databaseFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Select ko import karein

export function CsvMappingUploader({ sellerId }: { sellerId: string | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const { actionStatus } = useSelector((state: RootState) => state.inventory);
  const isLoading = actionStatus === "loading";

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvFile(null);
      setCsvHeaders([]);
      setMapping({});
      return;
    }

    setCsvFile(file);
    setIsPreviewing(true);
    setCsvHeaders([]);
    setMapping({});

    // ✨ 2. File select hote hi `dispatch` karein ✨
    try {
      const resultAction = await dispatch(previewCsvHeaders(file));

      if (previewCsvHeaders.fulfilled.match(resultAction)) {
        const headers = resultAction.payload.headers || [];
        if (headers.length > 0) {
          setCsvHeaders(headers);
          // Auto-mapping logic
          const newMapping: { [key: string]: string } = {};
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
          toast.success("CSV Headers Previewed", {
            description:
              mappedCount > 0
                ? `${mappedCount} fields auto-mapped. Please review.`
                : "Please map the fields below.",
          });
        } else {
          throw new Error("No headers found in the CSV file.");
        }
      } else {
        throw new Error(
          (resultAction.payload as string) || "Failed to preview CSV headers."
        );
      }
    } catch (error: any) {
      toast.error("Failed to Preview CSV", {
        description: error.message,
      });
      setCsvFile(null); // Reset file input on error
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleMappingChange = (dbField: string, csvHeader: string) => {
    setMapping((prev) => {
      const newMapping = { ...prev };
      if (csvHeader === "none") {
        delete newMapping[dbField];
      } else {
        newMapping[dbField] = csvHeader;
      }
      return newMapping;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    if (!mapping.stockId || !mapping.carat) {
      toast.error("Mapping Incomplete", {
        description: `Please map required fields: 'Stock #' and 'Carat'`,
      });
      return;
    }
    dispatch(uploadCsv({ csvFile, mapping, sellerId }));
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Step 1: Select file. Step 2: Map columns. Step 3: Upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Step 1: Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
              disabled={isLoading || isPreviewing}
            />
            {isPreviewing && (
              <p className="text-sm text-blue-500 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading
                file...
              </p>
            )}
          </div>
          {csvHeaders.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Step 2: Map Your CSV Columns
              </Label>
              <Alert>
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription>
                  We have tried to map columns automatically. Please review and
                  complete the mapping.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-2 border rounded-md max-h-[50vh] overflow-y-auto">
                {DATABASE_FIELDS.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <Label htmlFor={`map-${field.name}`} className="text-xs">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    {/* ✨ 3. Datalist ki jagah Select component use karein for better UX ✨ */}
                    <Select
                      onValueChange={(value) =>
                        handleMappingChange(field.name, value)
                      }
                      value={mapping[field.name] || ""}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Do Not Map --</SelectItem>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !csvFile ||
              csvHeaders.length === 0 ||
              !mapping.stockId ||
              !mapping.carat
            }
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Processing..." : "Step 3: Upload and Process"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
