// app/supplier/add-inventory/AddInventoryWrapper.tsx

"use client"; // Sabse zaroori: Isko client component banana hai

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Loading component
function FormLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-xl text-muted-foreground">Loading Inventory Form...</p>
    </div>
  );
}

// Yahan hum component ko dynamically import kar rahe hain
// Path ko apne project ke structure ke hisaab se theek karein
const DynamicAddInventoryForm = dynamic(
  () => import("@/components/inventory/AddInventoryForm"), // Aapka asli UI component
  {
    ssr: false, // Server-Side Rendering band kar do
    loading: () => <FormLoading />,
  }
);

// Yeh wrapper ab sirf dynamic component ko render karega
export default function AddInventoryWrapper() {
  return <DynamicAddInventoryForm />;
}
