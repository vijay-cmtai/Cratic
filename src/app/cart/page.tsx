
'use client';

import { useAppContext } from '@/context/AppContext';
import { diamonds } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const { cartItems, removeFromCart } = useAppContext();
  const { formatPrice } = useCurrency();
  const cartDiamonds = diamonds.filter(d => cartItems.has(d.id));

  const subtotal = cartDiamonds.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      {cartDiamonds.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {cartDiamonds.map((diamond) => (
                    <li key={diamond.id} className="flex items-center gap-4 p-4">
                      <Image
                        src={diamond.image}
                        alt={diamond.shape}
                        width={80}
                        height={80}
                        className="rounded-md border"
                        data-ai-hint={diamond.hint}
                      />
                      <div className="flex-grow">
                        <p className="font-semibold">{`${diamond.shape} ${diamond.carat.toFixed(2)}ct ${diamond.color} ${diamond.clarity}`}</p>
                        <p className="text-sm text-muted-foreground">Stock ID: {diamond.stockId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(diamond.price)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(diamond.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Proceed to Checkout</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any diamonds yet.</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
