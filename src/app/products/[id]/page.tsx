
'use client';

import { useParams } from 'next/navigation';
import { diamonds } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, ShoppingCart, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCurrency } from '@/context/CurrencyContext';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const diamond = diamonds.find(d => d.id === parseInt(id as string, 10));

  const { likedItems, toggleLike, cartItems, addToCart } = useAppContext();
  const { formatPrice } = useCurrency();

  if (!diamond) {
    return (
        <div className="container mx-auto py-12 px-4 text-center">
            <h2 className="text-2xl font-bold">Diamond not found</h2>
            <p className="text-muted-foreground">The diamond you are looking for does not exist.</p>
        </div>
    );
  }
  
  const isLiked = likedItems.has(diamond.id);
  const isInCart = cartItems.has(diamond.id);

  const detailsTable = [
      { label: 'Stock ID', value: diamond.stockId },
      { label: 'Shape', value: diamond.shape },
      { label: 'Carat Weight', value: `${diamond.carat.toFixed(2)} ct` },
      { label: 'Color Grade', value: diamond.color },
      { label: 'Clarity Grade', value: diamond.clarity },
      { label: 'Cut Grade', value: diamond.cut },
      { label: 'Polish', value: diamond.polish },
      { label: 'Symmetry', value: diamond.symmetry },
      { label: 'Fluorescence', value: diamond.fluorescence },
      { label: 'Measurements', value: diamond.measurements },
      { label: 'Certification', value: diamond.certification },
      { label: 'Certificate #', value: diamond.igi },
      { label: 'Type', value: diamond.type },
  ]

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column: Image Gallery */}
          <div>
            <Card>
              <CardContent className="p-2 sm:p-4">
                 <Carousel className="w-full">
                    <CarouselContent>
                      <CarouselItem>
                        <Image
                          src={diamond.image}
                          alt={`${diamond.shape} diamond`}
                          width={600}
                          height={600}
                          className="w-full rounded-lg object-cover aspect-square"
                          data-ai-hint={diamond.hint}
                        />
                      </CarouselItem>
                      {diamond.videoUrl && (
                        <CarouselItem>
                          <div className="aspect-square w-full h-full bg-black rounded-lg">
                            <iframe
                              src={diamond.videoUrl}
                              title="Diamond Video"
                              className="w-full h-full border-0 rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    {diamond.videoUrl && (
                      <>
                        <CarouselPrevious className="absolute left-2" />
                        <CarouselNext className="absolute right-2" />
                      </>
                    )}
                  </Carousel>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2">
                {`${diamond.carat.toFixed(2)} Carat ${diamond.shape} ${diamond.type === 'Lab-Grown' ? 'Lab-Grown ' : ''}Diamond`}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">Stock ID: {diamond.stockId} | Certified by {diamond.certification}</p>

            <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold">{formatPrice(diamond.price)}</span>
                 <Badge className="bg-accent/20 text-accent hover:bg-accent/30 text-base">-{diamond.discount.toFixed(2)}%</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                 <Button 
                    className="w-full sm:w-auto flex-grow"
                    onClick={() => addToCart(diamond.id)}
                    disabled={isInCart}
                    size="lg"
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    {isInCart ? 'Added to cart' : 'Add to cart'}
                 </Button>
                 <Button variant="outline" size="lg" onClick={() => toggleLike(diamond.id)}>
                    <Heart className={cn("w-5 h-5", isLiked && "fill-red-500 text-red-500")} />
                 </Button>
            </div>
            
            <Separator className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="border p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Carat</p>
                    <p className="font-semibold">{diamond.carat.toFixed(2)}</p>
                </div>
                 <div className="border p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Cut</p>
                    <p className="font-semibold">{diamond.cut}</p>
                </div>
                 <div className="border p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Color</p>
                    <p className="font-semibold">{diamond.color}</p>
                </div>
                 <div className="border p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Clarity</p>
                    <p className="font-semibold">{diamond.clarity}</p>
                </div>
            </div>

            <Accordion type="single" collapsible defaultValue="details" className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  <table className="w-full text-sm">
                      <tbody>
                          {detailsTable.map(detail => (
                              <tr key={detail.label} className="border-b">
                                  <td className="py-2 pr-4 text-muted-foreground">{detail.label}</td>
                                  <td className="py-2 font-medium">{detail.value}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 mt-1 text-primary"/>
                      <div>
                          <h4 className="font-semibold">Free Express Shipping</h4>
                          <p className="text-muted-foreground text-sm">Get your order delivered in 1-2 business days, fully insured.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-3">
                      <Undo2 className="h-5 w-5 mt-1 text-primary"/>
                      <div>
                          <h4 className="font-semibold">Hassle-Free Returns</h4>
                          <p className="text-muted-foreground text-sm">{diamond.isReturnable ? "This item is eligible for our 30-day return policy." : "This item is final sale and not eligible for returns."}</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 mt-1 text-primary"/>
                      <div>
                          <h4 className="font-semibold">Secure Packaging</h4>
                          <p className="text-muted-foreground text-sm">Your order will be shipped in discreet, secure packaging.</p>
                      </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
