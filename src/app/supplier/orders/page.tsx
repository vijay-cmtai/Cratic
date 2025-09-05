
'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FileText, Truck, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { initialSupplierOrders, initialSupplierInventory } from '@/lib/marketplaceData';
import { useCurrency } from '@/context/CurrencyContext';

const productMap = new Map(initialSupplierInventory.map(item => [item.id, item]));

export default function OrdersPage() {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders & Inquiries</h1>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Buyer ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSupplierOrders.map((order) => {
              const product = productMap.get(order.productId);
              return (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell>
                  {product ? (
                    <div className="flex items-center gap-3">
                      <Image src={product.image} alt={product.jewelry_type} width={40} height={40} className="rounded-md" data-ai-hint={product.hint} />
                      <div>
                        <div className="font-medium">{product.jewelry_type}</div>
                        <div className="text-muted-foreground text-xs">{product.id}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="font-mono text-sm">{order.productId}</span>
                  )}
                </TableCell>
                <TableCell className="font-mono">{order.buyerId}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Accept Order</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <XCircle className="mr-2 h-4 w-4" />
                         <span>Cancel Order</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View Invoice</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Add Tracking</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
