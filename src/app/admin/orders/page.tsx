
'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { mockAdminOrders } from '@/lib/adminData';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Shipped': return 'secondary';
      case 'Delivered': return 'outline';
      case 'Canceled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAdminOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image src={order.product.image} alt={order.product.shape} width={40} height={40} className="rounded-md" data-ai-hint={order.product.hint}/>
                    <div>
                      <div className="font-medium">{`${order.product.carat}ct ${order.product.shape}`}</div>
                      <div className="text-muted-foreground text-xs">{order.product.stockId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.buyer.name}</div>
                  <div className="text-muted-foreground text-xs">{order.buyer.company}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.supplier.name}</div>
                  <div className="text-muted-foreground text-xs">{order.supplier.id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatPrice(order.total)}</TableCell>
                 <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                       <DropdownMenuItem>Contact Buyer</DropdownMenuItem>
                       <DropdownMenuItem>Contact Supplier</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
