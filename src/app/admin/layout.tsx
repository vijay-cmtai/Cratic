"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ListOrdered,
  Building,
  UserPlus,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/registrations", label: "Registrations", icon: UserPlus },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/addInventory", label: "Add Inventory", icon: Building },
  { href: "/admin/seller", label: "Sellers", icon: Building },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isLoadingAuth } = useAppContext();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sidebar Content Component (reusable for both desktop and mobile)
  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Admin Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          {!isClient || isLoadingAuth ? (
            <Skeleton className="h-3 w-32 mt-1" />
          ) : (
            <p className="text-xs text-muted-foreground truncate">
              {user ? user.email : "Not Logged In"}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 -mx-3">
        <nav className="flex flex-col space-y-1 px-3">
          {adminNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => {
            logout();
            onLinkClick?.();
          }}
          disabled={!isClient || isLoadingAuth}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-muted/40 min-h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admin</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto py-4 md:py-8 px-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-8 bg-card rounded-lg shadow-sm p-6 border">
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
