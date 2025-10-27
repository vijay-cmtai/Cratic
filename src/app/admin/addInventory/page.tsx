import AddInventoryWrapper from "./AddInventoryWrapper"; // Naya wrapper component import karein
import { Suspense } from "react";

function PageLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-muted-foreground">Initializing Page...</p>
    </div>
  );
}

export default function AddInventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddInventoryWrapper />
    </Suspense>
  );
}
