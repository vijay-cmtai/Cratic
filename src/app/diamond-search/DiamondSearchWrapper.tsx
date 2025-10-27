"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-4 text-xl text-muted-foreground">Loading Diamonds...</p>
    </div>
  );
}

const DiamondSearchComponent = dynamic(
  () => import("@/components/DiamondSearch"),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function DiamondSearchWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <DiamondSearchComponent />
    </Suspense>
  );
}
