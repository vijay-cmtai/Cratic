// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Rare Diamonds",
  description: "Premium diamond marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Aapne yahaan pehle se hi 'suppressHydrationWarning' lagaya hua hai, jo bilkul sahi hai.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous" // 'crossOrigin' ko "anonymous" likhna behtar hai
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>

      {/* 
        === YEH HAI AAPKA FIX ===
        Hum yahan 'body' tag mein bhi `suppressHydrationWarning` laga denge.
        Isse browser extensions dwara kiye gaye badlaav se error nahi aayega.
      */}
      <body
        className="font-body antialiased min-h-screen flex flex-col"
        suppressHydrationWarning={true} // <-- YEH LINE ERROR KO FIX KAREGI
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
