"use client"; // <-- Sabse zaroori: Isko client component banana hai

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Ek simple sa loading component
function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-xl text-muted-foreground">Loading Inventory Form...</p>
    </div>
  );
}

// Yahan hum component ko dynamically import kar rahe hain
const DynamicAddInventoryForm = dynamic(
  () => import("@/components/inventory/AddInventoryForm"), // Aapka asli UI component
  {
    ssr: false, // Server-Side Rendering band kar do
    loading: () => <Loading />,
  }
);

// Yeh wrapper ab sirf dynamic component ko render karega
export default function AddInventoryWrapper() {
  return <DynamicAddInventoryForm />;
}
