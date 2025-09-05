
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ListOrdered, Building } from 'lucide-react';

const supplierNavLinks = [
  { href: '/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supplier/inventory', label: 'Inventory', icon: Package },
  { href: '/supplier/orders', label: 'Orders', icon: ListOrdered },
];

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <Building className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Supplier Portal</h2>
                  <p className="text-sm text-muted-foreground">Rare Diamonds Inc.</p>
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                {supplierNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-primary/10 text-primary font-semibold'
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
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
