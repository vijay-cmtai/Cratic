// src/components/providers.tsx

"use client"; // Yeh directive yahan lagega

import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import LiveChat from "@/components/live-chat";
import { StoreProvider } from "@/lib/StoreProvider";
import React from "react";

// Humne ek naya component banaya hai jo saare providers ko wrap karega
export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
