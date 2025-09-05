// lib/StoreProvider.tsx

"use client"; // Isse client component banana bahut zaroori hai

import { Provider } from "react-redux";
import { store } from "./store"; // Apne store ko import karein

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
