"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
// ✨ 1. `axios` ko hata dein, naye Redux thunks import karein ✨
import { AppDispatch, RootState } from "@/lib/store";
import {
  syncFromFtp,
  previewFtpHeaders,
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
import { Loader2, Server, UploadCloud } from "lucide-react";
import { DATABASE_FIELDS } from "./databaseFields";

export function FtpMappingUploader({ sellerId }: { sellerId: string | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const { actionStatus } = useSelector((state: RootState) => state.inventory);
  const isLoading = actionStatus === "loading";

  const [ftpCreds, setFtpCreds] = useState({
    host: "",
    user: "",
    password: "",
    path: "",
  });
  const [ftpHeaders, setFtpHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleCredsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFtpCreds((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePreview = async () => {
    const { host } = ftpCreds;
    if (!host) {
      toast.error("FTP Host is required.");
      return;
    }
    const cleanHost = host.replace(/^(ftp?:\/\/)/, "");

    setIsPreviewing(true);
    setFtpHeaders([]);
    setMapping({});

    // ✨ 2. `axios.post` ki jagah Redux thunk ko `dispatch` karein ✨
    try {
      console.log("Dispatching previewFtpHeaders with creds:", {
        ...ftpCreds,
        host: cleanHost,
      });
      const resultAction = await dispatch(
        previewFtpHeaders({ ...ftpCreds, host: cleanHost })
      );

      if (previewFtpHeaders.fulfilled.match(resultAction)) {
        console.log("Preview response:", resultAction.payload);
        const headers = resultAction.payload.headers || [];

        if (headers.length > 0) {
          setFtpHeaders(headers);
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
          throw new Error("No headers found in the FTP file.");
        }
      } else {
        // Agar thunk reject hota hai, to error throw karein
        const errorMessage =
          (resultAction.payload as string) ||
          "Failed to fetch headers from FTP.";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Preview error:", error);
      toast.error("Failed to fetch FTP headers", {
        description: error.message,
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleMappingChange = (schemaField: string, header: string) => {
    const newMapping = { ...mapping };
    if (header === "none") {
      delete newMapping[schemaField];
    } else {
      newMapping[schemaField] = header;
    }
    setMapping(newMapping);
  };

  const handleSync = () => {
    if (!mapping.stockId || !mapping.carat) {
      toast.error("Mapping Error", {
        description: "Please map at least 'Stock #' and 'Carat'.",
      });
      return;
    }
    const cleanHost = ftpCreds.host.replace(/^(ftp?:\/\/)/, "");
    dispatch(
      syncFromFtp({
        ftpCreds: { ...ftpCreds, host: cleanHost },
        mapping,
        sellerId,
      })
    );
  };

  // --- JSX (No changes needed below) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync from FTP Server</CardTitle>
        <CardDescription>
          Step 1: Provide credentials to preview. Step 2: Map fields and sync.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">
            Step 1: Enter FTP Details
          </Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">FTP Host</Label>
              <Input
                name="host"
                value={ftpCreds.host}
                onChange={handleCredsChange}
                placeholder="ftp.example.com"
                required
                disabled={isLoading || isPreviewing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Username</Label>
              <Input
                name="user"
                value={ftpCreds.user}
                onChange={handleCredsChange}
                required
                disabled={isLoading || isPreviewing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                type="password"
                value={ftpCreds.password}
                onChange={handleCredsChange}
                required
                disabled={isLoading || isPreviewing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">File Path</Label>
              <Input
                name="path"
                value={ftpCreds.path}
                onChange={handleCredsChange}
                placeholder="/public_html/inventory.csv"
                required
                disabled={isLoading || isPreviewing}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handlePreview}
            disabled={isPreviewing || !ftpCreds.host || isLoading}
            className="mt-4 w-full sm:w-auto"
          >
            {isPreviewing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Server className="mr-2 h-4 w-4" />
            )}
            Preview Headers
          </Button>
        </div>

        {ftpHeaders.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">
              Step 2: Map the Fields
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 mt-2 border rounded-md max-h-[400px] overflow-y-auto">
              {DATABASE_FIELDS.map((field) => (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={`map-${field.name}`} className="text-xs">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive">*</span>
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
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Do Not Map --</SelectItem>
                      {ftpHeaders.map((header) => (
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
          onClick={handleSync}
          disabled={
            isLoading ||
            ftpHeaders.length === 0 ||
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
          {isLoading ? "Syncing..." : "Start Sync from FTP"}
        </Button>
      </CardFooter>
    </Card>
  );
}
