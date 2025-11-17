// app/supplier/add-inventory/page.tsx

import AddInventoryWrapper from "./AddInventoryWrapper"; // Naya wrapper component import karein
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Hum ek loading state yahan bhi de sakte hain
function PageLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-muted-foreground">Loading Page...</p>
      </div>
    </div>
  );
}

export default function AddInventoryPageForSupplier() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddInventoryWrapper />
    </Suspense>
  );
}
