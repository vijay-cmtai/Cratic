"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";

// Header ka ek skeleton (placeholder) banayein. Yeh server par render hoga.
const HeaderSkeleton = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <Skeleton className="h-8 w-48" />
        <div className="flex-1 max-w-xl mx-4">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
};

// Apne asli header component ko dynamically import karein
// ssr: false ka matlab hai ki yeh component server par render NAHI hoga
const DynamicHeader = dynamic(() => import("./DynamicHeader"), {
  ssr: false,
  loading: () => <HeaderSkeleton />, // Jab tak component load ho raha hai, skeleton dikhayein
});

// Ab aapka main Header component sirf is dynamic wrapper ko render karega
export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <DynamicHeader />
    </header>
  );
}
