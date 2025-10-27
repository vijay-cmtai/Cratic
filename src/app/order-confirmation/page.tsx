import OrderConfirmationClient from "@/components/checkout/OrderConfirmationClient";
import { Suspense } from "react";

// Suspense zaroori hai kyunki hum 'useSearchParams' ka istemal kar rahe hain
function OrderConfirmationFallback() {
  return <div>Loading...</div>;
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationFallback />}>
      <OrderConfirmationClient />
    </Suspense>
  );
}
