// src/components/Header.tsx
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";

// Enhanced skeleton with modern design
const HeaderSkeleton = () => {
  return (
    <div className="relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />

      <div className="relative container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-32 md:w-48 rounded-lg" />
          </div>

          {/* Search Bar Skeleton - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6 lg:mx-8">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
            <div className="flex items-center gap-2 ml-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Bottom border with gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
    </div>
  );
};

// Dynamically import the actual header component
const DynamicHeader = dynamic(() => import("./DynamicHeader"), {
  ssr: false,
  loading: () => <HeaderSkeleton />,
});

// Enhanced main Header component with modern styling
export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <DynamicHeader />
    </header>
  );
}
