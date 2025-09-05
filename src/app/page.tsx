
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  List,
  Heart,
  GitCompareArrows,
  Download,
  ShoppingCart,
  Search,
  Grid,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { diamonds } from '@/lib/data';
import type { Diamond } from '@/lib/data';
import { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockBuyerOrders } from '@/lib/marketplaceData';


export default function DiamondSearchPage() {
  const { likedItems, toggleLike, cartItems, addToCart } = useAppContext();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = searchParams.get('q') || '';
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  const [activeTab, setActiveTab] = useState('natural');
  const [activeOrderTab, setActiveOrderTab] = useState('pending');
  const [simpleFilters, setSimpleFilters] = useState({
    hasPhotos: false,
    hasVideos: false,
    returnable: false,
    myStockOnly: false,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState(new Set<number>());
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);

  const { shapes, cuts, colors, clarities, minPrice, maxPrice, minCarat, maxCarat, polishes, symmetries, fluorescences, certifications } = useMemo(() => {
    const relevantDiamonds = diamonds.filter(d => (activeTab === 'natural' && d.type === 'Natural') || (activeTab === 'lab' && d.type === 'Lab-Grown'));
    const shapes = ['Round', 'Princess', 'Cushion', 'Oval', 'Pear', 'Marquise', 'Emerald', 'Radiant', 'Heart', 'Asscher'];
    const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
    const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
    const prices = relevantDiamonds.map((d) => d.price);
    const minPrice = Math.floor(Math.min(...prices, 0));
    const maxPrice = Math.ceil(Math.max(...prices, 1000));
    const carats = relevantDiamonds.map((d) => d.carat);
    const minCarat = Math.min(...carats, 0);
    const maxCarat = Math.max(...carats, 1);
    const polishes = ['Excellent', 'Very Good', 'Good', 'Fair'];
    const symmetries = ['Excellent', 'Very Good', 'Good', 'Fair'];
    const fluorescences = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];
    const certifications = ['GIA', 'IGI', 'HRD', 'SGL'];
    return { shapes, cuts, colors, clarities, minPrice, maxPrice, minCarat, maxCarat, polishes, symmetries, fluorescences, certifications };
  }, [activeTab]);

  const defaultAdvancedFilters = useMemo(() => ({
    shapes: new Set<string>(),
    price: [minPrice, maxPrice] as [number, number],
    carat: [minCarat, maxCarat] as [number, number],
    cuts: new Set<string>(),
    colors: new Set<string>(),
    clarities: new Set<string>(),
    polishes: new Set<string>(),
    symmetries: new Set<string>(),
    fluorescences: new Set<string>(),
    certifications: new Set<string>(),
  }), [minPrice, maxPrice, minCarat, maxCarat]);
  
  const myOrders = mockBuyerOrders;

  const [advancedFilters, setAdvancedFilters] = useState(defaultAdvancedFilters);
  const [tempAdvancedFilters, setTempAdvancedFilters] = useState(defaultAdvancedFilters);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

   useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

   useEffect(() => {
    setAdvancedFilters(defaultAdvancedFilters);
  }, [defaultAdvancedFilters]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(localSearchTerm.trim())}`, { scroll: false });
  };

  const toggleSimpleFilter = (filterName: keyof typeof simpleFilters) => {
    setSimpleFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };
  
  const handleTempAdvancedFilterChange = <K extends keyof typeof advancedFilters, V>(key: K, value: V) => {
    setTempAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleTempSetToggle = (key: 'shapes' | 'cuts' | 'colors' | 'clarities' | 'polishes' | 'symmetries' | 'fluorescences' | 'certifications', value: string) => {
    setTempAdvancedFilters(prev => {
      const newSet = new Set(prev[key]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [key]: newSet };
    });
  };

  const handleApplyFilters = () => {
    setAdvancedFilters(tempAdvancedFilters);
    setIsSheetOpen(false);
  };

  const handleClearTempFilters = () => {
    setTempAdvancedFilters(defaultAdvancedFilters);
  }

  const handleSheetOpenChange = (open: boolean) => {
    if (open) {
      setTempAdvancedFilters(advancedFilters);
    }
    setIsSheetOpen(open);
  };

  const resetFilters = () => {
    setAdvancedFilters(defaultAdvancedFilters);
    setSimpleFilters({
        hasPhotos: false,
        hasVideos: false,
        returnable: false,
        myStockOnly: false,
    });
    router.push('/', { scroll: false });
  };
  
  const filteredDiamonds = useMemo(() => {
    return diamonds.filter((diamond: Diamond) => {
      const matchesTab = 
        (activeTab === 'natural' && diamond.type === 'Natural') ||
        (activeTab === 'lab' && diamond.type === 'Lab-Grown');

      if (!matchesTab) return false;

      const searchTermLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchTermLower ||
        diamond.stockId.toLowerCase().includes(searchTermLower) ||
        diamond.igi.toLowerCase().includes(searchTermLower) ||
        diamond.shape.toLowerCase().includes(searchTermLower) ||
        diamond.type.toLowerCase().includes(searchTermLower) ||
        diamond.color.toLowerCase().includes(searchTermLower) ||
        String(diamond.carat).includes(searchTermLower) ||
        diamond.clarity.toLowerCase().includes(searchTermLower) ||
        diamond.cut.toLowerCase().includes(searchTermLower) ||
        diamond.certification.toLowerCase().includes(searchTermLower);

      const matchesSimpleFilters =
        (!simpleFilters.hasPhotos || !!diamond.image) &&
        (!simpleFilters.hasVideos || diamond.hasVideo) &&
        (!simpleFilters.returnable || diamond.isReturnable) &&
        (!simpleFilters.myStockOnly || diamond.isMyStock);

      const matchesAdvancedFilters =
        (advancedFilters.shapes.size === 0 || advancedFilters.shapes.has(diamond.shape)) &&
        (diamond.price >= advancedFilters.price[0] && diamond.price <= advancedFilters.price[1]) &&
        (diamond.carat >= advancedFilters.carat[0] && diamond.carat <= advancedFilters.carat[1]) &&
        (advancedFilters.cuts.size === 0 || advancedFilters.cuts.has(diamond.cut)) &&
        (advancedFilters.colors.size === 0 || advancedFilters.colors.has(diamond.color)) &&
        (advancedFilters.clarities.size === 0 || advancedFilters.clarities.has(diamond.clarity)) &&
        (advancedFilters.polishes.size === 0 || advancedFilters.polishes.has(diamond.polish)) &&
        (advancedFilters.symmetries.size === 0 || advancedFilters.symmetries.has(diamond.symmetry)) &&
        (advancedFilters.fluorescences.size === 0 || advancedFilters.fluorescences.has(diamond.fluorescence)) &&
        (advancedFilters.certifications.size === 0 || advancedFilters.certifications.has(diamond.certification));

      return matchesSearch && matchesSimpleFilters && matchesAdvancedFilters;
    });
  }, [searchTerm, simpleFilters, advancedFilters, activeTab, diamonds]);

  // When filters change, we should clear the selection
  useEffect(() => {
    setSelectedItems(new Set());
  }, [searchTerm, simpleFilters, advancedFilters, activeTab]);

  const activeFilterCount = useMemo(() =>
    Object.values(simpleFilters).filter(Boolean).length +
    advancedFilters.shapes.size +
    advancedFilters.cuts.size +
    advancedFilters.colors.size +
    advancedFilters.clarities.size +
    advancedFilters.polishes.size +
    advancedFilters.symmetries.size +
    advancedFilters.fluorescences.size +
    advancedFilters.certifications.size +
    (advancedFilters.price[0] !== minPrice || advancedFilters.price[1] !== maxPrice ? 1 : 0) +
    (advancedFilters.carat[0] !== minCarat || advancedFilters.carat[1] !== maxCarat ? 1 : 0)
  , [advancedFilters, simpleFilters, minPrice, maxPrice, minCarat, maxCarat]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItems(new Set(filteredDiamonds.map(d => d.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const caratRanges = [
    { label: '0-0.49', range: [0, 0.49] as [number, number] },
    { label: '0.50-0.99', range: [0.5, 0.99] as [number, number] },
    { label: '1.00-1.49', range: [1.0, 1.49] as [number, number] },
    { label: '1.50-1.99', range: [1.5, 1.99] as [number, number] },
    { label: '2.00-2.99', range: [2.0, 2.99] as [number, number] },
    { label: '3.00-3.99', range: [3.0, 3.99] as [number, number] },
    { label: '4.00-4.99', range: [4.0, 4.99] as [number, number] },
    { label: '5.00+', range: [5.0, maxCarat] as [number, number] },
  ];

  const areAllSelected = filteredDiamonds.length > 0 && selectedItems.size === filteredDiamonds.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredDiamonds.length;

  const tabTitle = activeTab === 'natural' ? t('search.naturalDiamonds') : activeTab === 'lab' ? t('search.labGrownDiamonds') : t('search.gemstones');

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto py-6 px-4">
          <Tabs defaultValue="natural" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="bg-transparent p-0 border-b border-border rounded-none">
              <TabsTrigger value="natural" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">{t('search.naturalDiamonds')}</TabsTrigger>
              <TabsTrigger value="lab" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">{t('search.labGrownDiamonds')}</TabsTrigger>
              <TabsTrigger value="gemstones" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">{t('search.gemstones')} <Badge variant="outline" className="ml-2">{t('search.new')}</Badge></TabsTrigger>
              <TabsTrigger value="my-orders" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">{t('search.myOrders')}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {activeTab === 'my-orders' ? (
                <div>
                  <h1 className="text-2xl font-bold mb-6">{t('search.myOrders')}</h1>
                  <Tabs defaultValue="pending" onValueChange={setActiveOrderTab} value={activeOrderTab}>
                    <TabsList>
                      <TabsTrigger value="pending">{t('search.pendingDelivery')}</TabsTrigger>
                      <TabsTrigger value="fulfilled">{t('search.ordersFulfilled')}</TabsTrigger>
                      <TabsTrigger value="returns">{t('search.myReturns')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-6">
                      <Card>
                        <CardContent className="p-0">
                          {myOrders.pending.length > 0 ? (
                            <ul className="divide-y">
                              {myOrders.pending.map((order) => (
                                <li key={order.orderId} className="flex items-center gap-4 p-4">
                                  <Image src={order.diamond.image} alt={order.diamond.shape} width={80} height={80} className="rounded-md border" data-ai-hint={order.diamond.hint} />
                                  <div className="flex-grow">
                                    <p className="font-semibold">{`${order.diamond.shape} ${order.diamond.carat.toFixed(2)}ct ${order.diamond.color} ${order.diamond.clarity}`}</p>
                                    <p className="text-sm text-muted-foreground">{t('search.orderId')}: {order.orderId}</p>
                                    <p className="text-sm text-muted-foreground">{t('search.orderDate')}: {order.date}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatPrice(order.diamond.price)}</p>
                                    <Badge variant="secondary">{order.status}</Badge>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center p-8 text-muted-foreground">{t('search.noPendingOrders')}</div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="fulfilled" className="mt-6">
                       <Card>
                        <CardContent className="p-0">
                          {myOrders.fulfilled.length > 0 ? (
                            <ul className="divide-y">
                              {myOrders.fulfilled.map((order) => (
                                <li key={order.orderId} className="flex items-center gap-4 p-4">
                                  <Image src={order.diamond.image} alt={order.diamond.shape} width={80} height={80} className="rounded-md border" data-ai-hint={order.diamond.hint} />
                                  <div className="flex-grow">
                                    <p className="font-semibold">{`${order.diamond.shape} ${order.diamond.carat.toFixed(2)}ct ${order.diamond.color} ${order.diamond.clarity}`}</p>
                                    <p className="text-sm text-muted-foreground">{t('search.orderId')}: {order.orderId}</p>
                                    <p className="text-sm text-muted-foreground">{t('search.orderDate')}: {order.date}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatPrice(order.diamond.price)}</p>
                                    <Badge variant="outline">{order.status}</Badge>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center p-8 text-muted-foreground">{t('search.noFulfilledOrders')}</div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="returns" className="mt-6">
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          {t('search.noReturns')}
                        </CardContent>
                      </Card>
                    </TabsContent>

                  </Tabs>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold">{tabTitle}</h1>
                      <p className="text-muted-foreground">{filteredDiamonds.length.toLocaleString()} {t('search.results')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="recent">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">{t('search.sortRecent')}</SelectItem>
                          <SelectItem value="price_asc">Price: Low to High</SelectItem>
                          <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Dialog open={isSavedSearchesOpen} onOpenChange={setIsSavedSearchesOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost">{t('search.savedSearches')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Saved Searches</DialogTitle>
                            <DialogDescription>
                              This feature is coming soon. You'll be able to save your filter settings and apply them later.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 text-center text-muted-foreground">
                              <p>Your saved searches will appear here.</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}>
                        {viewMode === 'grid' ? <List className="mr-2 h-4 w-4" /> : <Grid className="mr-2 h-4 w-4" />}
                        {viewMode === 'grid' ? 'List view' : 'Grid view'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-6 p-4 border rounded-lg">
                      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                        <SheetTrigger asChild>
                          <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" /> All filters
                            {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2 rounded-full px-2">{activeFilterCount}</Badge>}
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="flex flex-col sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>All Filters</SheetTitle>
                            <SheetDescription>
                              Select your desired filters and click apply.
                            </SheetDescription>
                          </SheetHeader>
                          <Separator />
                          <ScrollArea className="flex-grow my-4 pr-6">
                            <Accordion type="multiple" defaultValue={['shape', 'price', 'carat', 'cut', 'color', 'clarity']} className="w-full">
                              <AccordionItem value="shape">
                                <AccordionTrigger>Shape</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {shapes.map(s => (
                                      <Button key={s} variant={tempAdvancedFilters.shapes.has(s) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('shapes', s)}>{s}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="price">
                                <AccordionTrigger>Price</AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="relative w-full">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                      <Input
                                        type="number"
                                        placeholder={minPrice.toLocaleString()}
                                        value={tempAdvancedFilters.price[0]}
                                        onChange={(e) => {
                                          const minVal = parseInt(e.target.value, 10);
                                          const currentMax = tempAdvancedFilters.price[1];
                                          const newMin = isNaN(minVal) ? minPrice : minVal;
                                          const newMax = newMin > currentMax ? newMin : currentMax;
                                          handleTempAdvancedFilterChange('price', [newMin, newMax]);
                                        }}
                                        className="pl-6"
                                      />
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="relative w-full">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                      <Input
                                        type="number"
                                        placeholder={maxPrice.toLocaleString()}
                                        value={tempAdvancedFilters.price[1]}
                                        onChange={(e) => {
                                          const maxVal = parseInt(e.target.value, 10);
                                          const currentMin = tempAdvancedFilters.price[0];
                                          const newMax = isNaN(maxVal) ? maxPrice : maxVal;
                                          const newMin = newMax < currentMin ? newMax : currentMin;
                                          handleTempAdvancedFilterChange('price', [newMin, newMax]);
                                        }}
                                        className="pl-6"
                                      />
                                    </div>
                                  </div>
                                  <Slider min={minPrice} max={maxPrice} step={100} value={tempAdvancedFilters.price} onValueChange={value => handleTempAdvancedFilterChange('price', value as [number, number])} />
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="carat">
                                <AccordionTrigger>Carat</AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder={minCarat.toFixed(2)}
                                      value={tempAdvancedFilters.carat[0]}
                                      onChange={(e) => {
                                          const minVal = parseFloat(e.target.value);
                                          const currentMax = tempAdvancedFilters.carat[1];
                                          const newMin = isNaN(minVal) ? minCarat : minVal;
                                          const newMax = newMin > currentMax ? newMin : currentMax;
                                          handleTempAdvancedFilterChange('carat', [newMin, newMax]);
                                      }}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder={maxCarat.toFixed(2)}
                                      value={tempAdvancedFilters.carat[1]}
                                      onChange={(e) => {
                                          const maxVal = parseFloat(e.target.value);
                                          const currentMin = tempAdvancedFilters.carat[0];
                                          const newMax = isNaN(maxVal) ? maxCarat : maxVal;
                                          const newMin = newMax < currentMin ? newMax : currentMin;
                                          handleTempAdvancedFilterChange('carat', [newMin, newMax]);
                                      }}
                                    />
                                  </div>
                                  <Slider min={minCarat} max={maxCarat} step={0.01} value={tempAdvancedFilters.carat} onValueChange={value => handleTempAdvancedFilterChange('carat', value as [number, number])} />
                                  <div className="grid grid-cols-4 gap-2 mt-4">
                                    {caratRanges.map(cr => (
                                        <Button
                                            key={cr.label}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTempAdvancedFilterChange('carat', cr.range)}
                                            className="text-xs"
                                        >
                                            {cr.label}
                                        </Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="cut">
                                <AccordionTrigger>Cut</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {cuts.map(c => (
                                      <Button key={c} variant={tempAdvancedFilters.cuts.has(c) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('cuts', c)}>{c}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="color">
                                <AccordionTrigger>Color</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-4 gap-2">
                                    {colors.map(c => (
                                      <Button key={c} variant={tempAdvancedFilters.colors.has(c) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('colors', c)}>{c}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="clarity">
                                <AccordionTrigger>Clarity</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-4 gap-2">
                                    {clarities.map(c => (
                                      <Button key={c} variant={tempAdvancedFilters.clarities.has(c) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('clarities', c)}>{c}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="polish">
                                <AccordionTrigger>Polish</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {polishes.map(p => (
                                      <Button key={p} variant={tempAdvancedFilters.polishes.has(p) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('polishes', p)}>{p}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="symmetry">
                                <AccordionTrigger>Symmetry</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {symmetries.map(s => (
                                      <Button key={s} variant={tempAdvancedFilters.symmetries.has(s) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('symmetries', s)}>{s}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="fluorescence">
                                <AccordionTrigger>Fluorescence</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {fluorescences.map(f => (
                                      <Button key={f} variant={tempAdvancedFilters.fluorescences.has(f) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('fluorescences', f)}>{f}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="certification">
                                <AccordionTrigger>Certification</AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-3 gap-2">
                                    {certifications.map(c => (
                                      <Button key={c} variant={tempAdvancedFilters.certifications.has(c) ? 'default' : 'outline'} onClick={() => handleTempSetToggle('certifications', c)}>{c}</Button>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </ScrollArea>
                          <SheetFooter className="p-4 border-t bg-background sticky bottom-0 flex-row gap-2">
                            <Button variant="outline" className="flex-1" onClick={handleClearTempFilters}>Clear</Button>
                            <Button className="flex-1" onClick={handleApplyFilters}>Apply Filters</Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Enter cert. number, Stock ID..." 
                          className="pl-9 w-64"
                          value={localSearchTerm}
                          onChange={(e) => setLocalSearchTerm(e.target.value)}
                        />
                      </form>
                      <Button 
                        variant={simpleFilters.hasPhotos ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => toggleSimpleFilter('hasPhotos')}
                      >
                        Has photos
                      </Button>
                      <Button 
                        variant={simpleFilters.hasVideos ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => toggleSimpleFilter('hasVideos')}
                      >
                        Has videos
                      </Button>
                      <Button 
                        variant={simpleFilters.returnable ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => toggleSimpleFilter('returnable')}
                      >
                        Returnable
                      </Button>
                      <Button 
                        variant={simpleFilters.myStockOnly ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => toggleSimpleFilter('myStockOnly')}
                      >
                        My stock only
                      </Button>
                      {(activeFilterCount > 0 || searchTerm) && <Button variant="ghost" size="sm" onClick={resetFilters}>Clear All Filters</Button>}
                  </div>


                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {filteredDiamonds.map((diamond) => {
                        const isLiked = likedItems.has(diamond.id);
                        const isInCart = cartItems.has(diamond.id);
                        
                        return (
                        <Card key={diamond.id} className="overflow-hidden group flex flex-col text-sm">
                          <div className="p-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`select-grid-${diamond.id}`}
                                checked={selectedItems.has(diamond.id)}
                                onCheckedChange={(checked) => handleSelectItem(diamond.id, !!checked)}
                              />
                              <label htmlFor={`select-grid-${diamond.id}`} className="font-medium">Select</label>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleLike(diamond.id)}>
                                <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><GitCompareArrows className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          <CardContent
                            className="p-0"
                            onMouseEnter={() => diamond.videoUrl && setHoveredCardId(diamond.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                          >
                            {hoveredCardId === diamond.id && diamond.videoUrl ? (
                              <iframe
                                src={`${diamond.videoUrl}${diamond.videoUrl.includes('?') ? '&' : '?'}autoplay=1&autospin=1&sound=0`}
                                className="w-full object-cover aspect-square border-0"
                                allow="autoplay; fullscreen"
                                sandbox="allow-scripts allow-same-origin"
                              />
                            ) : (
                              <Link href={`/products/${diamond.id}`}>
                                  <Image
                                    src={diamond.image}
                                    alt={diamond.shape}
                                    width={300}
                                    height={300}
                                    className="w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
                                    data-ai-hint={diamond.hint}
                                  />
                              </Link>
                            )}
                          </CardContent>
                          <div className="p-3 flex-grow flex flex-col">
                            <div className="text-xs text-muted-foreground mb-2">
                              <span>{diamond.certification} {diamond.igi}</span> • <span>Stock ID {diamond.stockId}</span>
                            </div>
                            <Link href={`/products/${diamond.id}`}>
                                <p className="font-bold mb-1 hover:underline">{`${diamond.shape} ${diamond.carat.toFixed(2)}ct ${diamond.color} ${diamond.clarity} ${diamond.cut}`}</p>
                            </Link>
                            <p className="text-muted-foreground text-xs mb-2">{diamond.measurements}</p>
                            <p className="text-muted-foreground text-xs mb-3">{`Polish: ${diamond.polish}, Symmetry: ${diamond.symmetry}, Fluorescence: ${diamond.fluorescence}`}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {diamond.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                            </div>
                            <div className="flex-grow"></div>
                            <div className="text-xs text-muted-foreground mb-2">Express Delivery 1-2 business days</div>
                            <div className="flex items-center gap-2 text-xs mb-3">
                              <Checkbox id={`returnable-${diamond.id}`} />
                              <label htmlFor={`returnable-${diamond.id}`}>Add returnable option</label>
                            </div>
                            <div className="flex items-baseline gap-2 mb-3">
                              <div className="text-lg font-bold">{formatPrice(diamond.price)}</div>
                              <Badge className="bg-accent/20 text-accent hover:bg-accent/30">-{diamond.discount.toFixed(2)}%</Badge>
                            </div>
                            <Button 
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => addToCart(diamond.id)}
                              disabled={isInCart}
                            >
                              <ShoppingCart size={16} className="mr-2" />
                              {isInCart ? 'Added to cart' : 'Add to cart'}
                            </Button>
                          </div>
                        </Card>
                      )})}
                    </div>
                  ) : (
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <Checkbox 
                                checked={areAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Cut</TableHead>
                            <TableHead className="text-right">Carat</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center w-[200px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDiamonds.map((diamond) => {
                            const isLiked = likedItems.has(diamond.id);
                            const isInCart = cartItems.has(diamond.id);
                            return (
                              <TableRow key={diamond.id}>
                                <TableCell>
                                  <Checkbox 
                                    id={`select-list-${diamond.id}`}
                                    checked={selectedItems.has(diamond.id)}
                                    onCheckedChange={(checked) => handleSelectItem(diamond.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Link href={`/products/${diamond.id}`}>
                                      <Image
                                        src={diamond.image}
                                        alt={diamond.shape}
                                        width={50}
                                        height={50}
                                        className="rounded-md border"
                                        data-ai-hint={diamond.hint}
                                      />
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/products/${diamond.id}`} className="hover:underline">
                                    <div className="font-bold">{`${diamond.shape} ${diamond.color} ${diamond.clarity}`}</div>
                                  </Link>
                                  <div className="text-xs text-muted-foreground">Stock ID: {diamond.stockId}</div>
                                  <div className="text-xs text-muted-foreground">{diamond.certification}: {diamond.igi}</div>
                                </TableCell>
                                <TableCell>{diamond.cut}</TableCell>
                                <TableCell className="text-right">{diamond.carat.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-bold">{formatPrice(diamond.price)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleLike(diamond.id)}>
                                      <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
                                    </Button>
                                    <Button 
                                      size="sm"
                                      className="h-8"
                                      onClick={() => addToCart(diamond.id)}
                                      disabled={isInCart}
                                    >
                                      <ShoppingCart size={16} className="mr-2" />
                                      {isInCart ? 'Added' : 'Add'}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  )}
                
                  {filteredDiamonds.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h2 className="text-2xl font-semibold mb-2">No Diamonds Found</h2>
                          <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
                          <Button onClick={resetFilters}>Clear All Filters</Button>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
