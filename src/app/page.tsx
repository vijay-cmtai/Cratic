"use client"; // Redirect karne ke liye client component zaroori hai

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Ek simple loading component
function LoadingScreen() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-4 text-xl">Loading...</p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Page load hote hi user ko diamond search page par bhej do
    router.replace("/diamond-search");
  }, [router]);

  // Jab tak redirect nahi hota, loading screen dikhao
  return <LoadingScreen />;
}
