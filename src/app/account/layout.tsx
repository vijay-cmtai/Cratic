// File: app/account/layout.tsx
"use client";

import { useState, useEffect } from "react"; // ✅ useEffect aur useState ko import karein
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { logout } from "@/lib/features/users/userSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sidebarNavItems = [
  { title: "Dashboard", href: "/account/dashboard", icon: LayoutDashboard },
  { title: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { title: "My Wishlist", href: "/account/wishlist", icon: Heart },
  { title: "My Addresses", href: "/account/addresses", icon: MapPin },
  { title: "Profile Settings", href: "/account/profile", icon: UserIcon },
];

const getInitials = (name: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);

  // ✅ FIX: Client-side rendering ko track karne ke liye state
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // ✅ FIX: Improved loading logic to prevent flicker
  // Jab tak component client par mount nahi hota, skeleton dikhao
  if (!isClient) {
    return (
      <div className="bg-muted/40 min-h-[calc(100vh-80px)] w-full">
        <div className="container mx-auto py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Logged In State (ab ye client par hi check hoga)
  if (!userInfo) {
    return (
      <div className="container text-center my-16">
        <p className="text-lg font-medium">
          Please log in to view your account.
        </p>
        <p className="text-muted-foreground mt-1">
          Access your orders, wishlist, and more.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Go to Login Page</Link>
        </Button>
      </div>
    );
  }

  // Logged In State - Professional UI
  return (
    <div className="bg-muted/40 min-h-[calc(100vh-80px)] w-full">
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2 mb-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(userInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {userInfo.name}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
                <Separator />
                <nav className="flex flex-col space-y-1 mt-4">
                  {sidebarNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">{children}</CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
