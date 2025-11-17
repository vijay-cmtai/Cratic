// app/supplier/layout.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { logout } from "@/lib/features/users/userSlice";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Building,
  LogOut,
  Menu,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper to get initials from name
const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "S";

const supplierNavLinks = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/supplier/inventory", label: "My Inventory", icon: Package },
  { href: "/supplier/add-inventory", label: "Add Inventory", icon: Package },
  { href: "/supplier/orders", label: "Orders", icon: ListOrdered },
  { href: "/supplier/profile", label: "My Profile", icon: Building },
  { href: "/supplier/notifications", label: "Notication", icon: Bell },
];

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold">Supplier Portal</h2>
        </div>
      </div>
      <Separator />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-1 mt-4 px-3">
        {supplierNavLinks.map((link) => {
          // Use startsWith for better active state detection (e.g., /inventory/edit/123)
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer/Logout */}
      <div className="mt-auto px-3">
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start mt-4"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-muted/40 min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background md:flex p-4">
        <SidebarContent />
      </aside>

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <SidebarContent
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Page Title */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {supplierNavLinks.find((link) => pathname.startsWith(link.href))
                ?.label || "Supplier"}
            </h1>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src={userInfo?.avatarUrl}
                    alt={userInfo?.companyName}
                  />
                  <AvatarFallback>
                    {getInitials(userInfo?.companyName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userInfo?.companyName || "Supplier"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userInfo?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/supplier/profile">
                  <Building className="mr-2 h-4 w-4" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ✅ Main Content Area (This part will scroll) */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
