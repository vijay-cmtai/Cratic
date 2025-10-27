"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ShoppingBag,
  Heart,
  User as UserIcon,
  DollarSign,
  Package,
  CheckCircle2,
  Loader,
} from "lucide-react";
import Image from "next/image";

// --- Mock Data (Ise aap apne real API data se replace karenge) ---
const userStats = {
  totalSpent: 4250.75,
  ordersPlaced: 12,
  wishlistItems: 8,
};

const recentOrder = {
  id: "#17366-B",
  status: "Shipped", // "Ordered", "Processing", "Shipped", "Delivered"
  estimatedDelivery: "June 25, 2024",
  items: [{ name: "1.02 ct Diamond Ring", image: "/placeholder-ring.jpg" }],
  trackingNumber: "1Z999AA10123456789",
};

const wishlistPreview = [
  {
    id: "1",
    name: "Emerald Cut Necklace",
    image: "/placeholder-necklace.jpg",
    price: 2200,
  },
  {
    id: "2",
    name: "Diamond Stud Earrings",
    image: "/placeholder-earrings.jpg",
    price: 950,
  },
];
// -------------------------------------------------------------------

const StatCard = ({
  icon: Icon,
  title,
  value,
  link,
  linkText,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  link: string;
  linkText: string;
}) => (
  <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <Link
        href={link}
        className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-1"
      >
        {linkText} <ArrowRight size={12} />
      </Link>
    </CardContent>
  </Card>
);

const OrderStatusStep = ({
  status,
  isCompleted,
  isActive,
}: {
  status: string;
  isCompleted: boolean;
  isActive: boolean;
}) => (
  <div className="flex items-center gap-4">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${isActive ? "border-primary bg-primary/10" : isCompleted ? "border-green-500 bg-green-50" : "border-border"}`}
    >
      {isActive ? (
        <Loader size={20} className="animate-spin text-primary" />
      ) : isCompleted ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : (
        <Package size={20} className="text-muted-foreground" />
      )}
    </div>
    <span
      className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}
    >
      {status}
    </span>
  </div>
);

export default function UserDashboardPage() {
  const { userInfo } = useSelector((state: RootState) => state.user);

  const orderStatusSteps = ["Ordered", "Processing", "Shipped", "Delivered"];
  const currentStatusIndex = orderStatusSteps.indexOf(recentOrder.status);

  return (
    <div className="space-y-8">
      {/* Personalized Animated Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary/80 to-secondary p-6 md:p-8 shadow-lg">
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full opacity-50 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
            Welcome back, {userInfo?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="mt-2 text-primary-foreground/80 max-w-2xl">
            It's great to see you again. Here's a quick summary of your account
            activity and recent orders.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={DollarSign}
          title="Total Spent"
          value={`$${userStats.totalSpent.toLocaleString()}`}
          link="/account/orders"
          linkText="View all transactions"
        />
        <StatCard
          icon={ShoppingBag}
          title="Orders Placed"
          value={userStats.ordersPlaced}
          link="/account/orders"
          linkText="See your orders"
        />
        <StatCard
          icon={Heart}
          title="Wishlist Items"
          value={userStats.wishlistItems}
          link="/account/wishlist"
          linkText="Manage your wishlist"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Order Tracking - Main Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest Order Status</CardTitle>
            <CardDescription>
              Tracking for order{" "}
              <span className="font-medium text-primary">{recentOrder.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 p-4 rounded-lg bg-muted/50 border">
              <Image
                src={recentOrder.items[0].image}
                alt={recentOrder.items[0].name}
                width={100}
                height={100}
                className="rounded-md object-cover border"
              />
              <div className="flex-1">
                <p className="font-semibold">{recentOrder.items[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  Estimated Delivery:{" "}
                  <span className="font-medium text-foreground">
                    {recentOrder.estimatedDelivery}
                  </span>
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Track Order</Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/account/orders">View All Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative mt-8 ml-4">
              <div className="absolute left-[17px] top-0 h-full w-0.5 bg-border -z-10" />
              <div className="space-y-8">
                {orderStatusSteps.map((status, index) => (
                  <OrderStatusStep
                    key={status}
                    status={status}
                    isCompleted={index < currentStatusIndex}
                    isActive={index === currentStatusIndex}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>From Your Wishlist</CardTitle>
              <CardDescription>Some of your favorite items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wishlistPreview.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md border bg-muted"
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/account/wishlist">View Full Wishlist</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Profile Completion</p>
                <Progress value={75} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  You're almost there! Complete your profile for a better
                  experience.
                </p>
              </div>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/account/profile">
                  <UserIcon className="mr-2" size={16} /> Go to Profile Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
