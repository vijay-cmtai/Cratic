// layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import LiveChat from "@/components/live-chat";

// Step 1: Apne naye StoreProvider ko import karein
import { StoreProvider } from "@/lib/StoreProvider";

export const metadata: Metadata = {
  title: "Rare Diamonds",
  description: "The worlds most exclusive diamond marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")}>
        {/* Step 2: StoreProvider ko sabse bahar (outermost) wrap karein */}
        <StoreProvider>
          <LanguageProvider>
            <AppProvider>
              <CurrencyProvider>
                <Header />
                <main className="flex-grow">{children}</main>
                <LiveChat />
                <Toaster />
              </CurrencyProvider>
            </AppProvider>
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
