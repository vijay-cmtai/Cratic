"use client"; // <-- Sabse zaroori

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Loading component
function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-xl text-muted-foreground">Loading Inventory...</p>
    </div>
  );
}

// Yahan hum component ko dynamically import kar rahe hain
const DynamicAdminInventoryTable = dynamic(
  () => import("@/components/inventory/AdminInventoryTable"), // Aapka asli UI component
  {
    ssr: false, // Server-Side Rendering band kar do
    loading: () => <Loading />,
  }
);

// Yeh wrapper ab sirf dynamic component ko render karega
export default function InventoryWrapper() {
  return <DynamicAdminInventoryTable />;
}
