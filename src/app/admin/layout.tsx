"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/registrations", label: "Registrations", icon: UserPlus },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/addInventory", label: "Add Inventory", icon: Building },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isLoadingAuth } = useAppContext();

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                  {isLoadingAuth ? (
                    <Skeleton className="h-4 w-32 mt-1" />
                  ) : (
                    <p className="text-sm text-muted-foreground truncate">
                      {user ? user.email : "Not Logged In"}
                    </p>
                  )}
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                {adminNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={logout}
                  disabled={isLoadingAuth}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </aside>
          <main className="flex-1 bg-card p-6 rounded-lg shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
