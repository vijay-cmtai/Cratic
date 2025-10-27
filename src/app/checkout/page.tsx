import CheckoutClient from "@/components/checkout/CheckoutClient";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Checkout | Rare Diamonds",
  description: "Complete your purchase securely.",
};
export default function CheckoutPage() {
  return <CheckoutClient />;
}