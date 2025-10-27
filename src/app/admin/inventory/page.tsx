import InventoryWrapper from "./InventoryWrapper"; 
import { Suspense } from "react";

function PageLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-muted-foreground">Initializing Page...</p>
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InventoryWrapper />
    </Suspense>
  );
}
