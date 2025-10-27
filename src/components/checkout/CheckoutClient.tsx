"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Home, Briefcase } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchCart } from "@/lib/features/cart/cartSlice";
import {
  createOrderAndInitiatePayment,
  verifyPayment,
  resetCreateOrderStatus,
} from "@/lib/features/order/orderSlice";
import { fetchAddresses, Address } from "@/lib/features/address/addressSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Script from "next/script";

const placeholderImage = "/placeholder-diamond.jpg";

export default function CheckoutClient() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { items: cartItems, listStatus: cartStatus } = useSelector(
    (state: RootState) => state.cart
  );
  const { userInfo } = useSelector((state: RootState) => state.user);

  const {
    create: { status: orderStatus, error: orderError, lastOrder },
    verify: { status: verificationStatus, error: verificationError },
  } = useSelector((state: RootState) => state.order);

  const { addresses, listStatus: addressStatus } = useSelector(
    (state: RootState) => state.address
  );

  const isPlacingOrder = orderStatus === "loading";
  const isVerifyingPayment = verificationStatus === "loading";
  const isCartLoading = cartStatus === "loading" || cartStatus === "idle";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
      setFormData((prev) => ({
        ...prev,
        name: userInfo.name,
        email: userInfo.email,
      }));
    }
    dispatch(resetCreateOrderStatus());
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (!userInfo) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (
      cartStatus === "succeeded" &&
      cartItems.length === 0 &&
      !isPlacingOrder &&
      !isVerifyingPayment
    ) {
      toast.info("Your cart is empty.", {
        description: "Redirecting to homepage.",
      });
      router.push("/");
    }
  }, [
    cartStatus,
    cartItems.length,
    router,
    userInfo,
    isPlacingOrder,
    isVerifyingPayment,
  ]);

  useEffect(() => {
    if (verificationStatus === "succeeded") {
      toast.success("Payment Successful!", {
        description: "Your order has been confirmed.",
      });

      const confirmedOrderId = localStorage.getItem("confirmedOrderId");
      if (confirmedOrderId) {
        router.push(`/order-confirmation?orderId=${confirmedOrderId}`);
        localStorage.removeItem("confirmedOrderId");
      } else if (lastOrder) {
        router.push(`/order-confirmation?orderId=${lastOrder._id}`);
      }
    }
    if (verificationStatus === "failed" && verificationError) {
      toast.error("Payment Verification Failed", {
        description: verificationError,
      });
      dispatch(resetCreateOrderStatus());
    }
    if (orderStatus === "failed" && orderError) {
      toast.error("Failed to Create Order", { description: orderError });
      dispatch(resetCreateOrderStatus());
    }
  }, [
    verificationStatus,
    verificationError,
    orderStatus,
    orderError,
    lastOrder,
    router,
    dispatch,
  ]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address._id);
    setFormData((prev) => ({
      ...prev,
      name: userInfo?.name || "",
      address: address.addressLine1,
      city: address.city,
      state: address.state,
      zip: address.postalCode,
      country: address.country,
    }));
    toast.success("Address selected", {
      description: "Shipping details have been filled.",
    });
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.price || 0), 0),
    [cartItems]
  );
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setSelectedAddressId(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait a moment.");
      return;
    }
    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.zip ||
      !formData.country
    ) {
      toast.error("Please fill in all shipping address fields.");
      return;
    }

    const resultAction = await dispatch(createOrderAndInitiatePayment());

    if (createOrderAndInitiatePayment.fulfilled.match(resultAction)) {
      const { razorpayOrder, razorpayKeyId, order } = resultAction.payload;

      localStorage.setItem("confirmedOrderId", order._id);

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Diamond Store",
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          dispatch(
            verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          );
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed", {
          description:
            response.error.description ||
            "Your payment could not be processed.",
        });
        localStorage.removeItem("confirmedOrderId");
        dispatch(resetCreateOrderStatus());
      });
      rzp.open();
    }
  };

  if (isCartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <form
          onSubmit={handlePlaceOrder}
          className="grid md:grid-cols-5 gap-12"
        >
          <div className="md:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select a Saved Address</CardTitle>
                <CardDescription>
                  Or fill in the details manually below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {addressStatus === "loading" && (
                  <Loader2 className="h-6 w-6 animate-spin" />
                )}
                {addressStatus === "succeeded" &&
                  (addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr)}
                          className={cn(
                            "p-4 border rounded-md cursor-pointer hover:border-primary transition-all",
                            selectedAddressId === addr._id &&
                              "border-2 border-primary ring-2 ring-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1 font-semibold">
                            {addr.addressType === "Home" ? (
                              <Home className="h-4 w-4" />
                            ) : (
                              <Briefcase className="h-4 w-4" />
                            )}
                            {addr.addressType}
                          </div>
                          <p className="text-sm">{addr.addressLine1}</p>
                          <p className="text-sm text-muted-foreground">{`${addr.city}, ${addr.state} ${addr.postalCode}`}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You have no saved addresses.
                    </p>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Diamond Lane"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input
                      id="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {cartItems.map((diamond) => (
                    <li key={diamond._id} className="flex items-center gap-4">
                      <img
                        src={diamond.imageLink || placeholderImage}
                        alt={diamond.shape || "diamond"}
                        width={64}
                        height={64}
                        className="rounded-md border object-cover"
                        onError={(e) => {
                          e.currentTarget.src = placeholderImage;
                        }}
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm">{`${diamond.shape} ${diamond.carat?.toFixed(2)}ct`}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(diamond.price)}
                      </p>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={
                isPlacingOrder || isVerifyingPayment || cartItems.length === 0
              }
            >
              {isPlacingOrder || isVerifyingPayment ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {isPlacingOrder
                ? "Initiating Payment..."
                : isVerifyingPayment
                  ? "Verifying..."
                  : "Proceed to Payment"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
