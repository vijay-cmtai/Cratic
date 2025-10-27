"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  List,
  Heart,
  GitCompareArrows,
  Download,
  ShoppingCart,
  Search,
  Grid,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchDiamonds } from "@/lib/features/inventory/inventorySlice";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";
import {
  fetchCart,
  addToCart as addToCartAction,
} from "@/lib/features/cart/cartSlice";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice";

const placeholderImage = "/placeholder-diamond.jpg";

interface AdvancedFilters {
  shapes: Set<string>;
  price: [number, number];
  carat: [number, number];
  cuts: Set<string>;
  colors: Set<string>;
  clarities: Set<string>;
  polishes: Set<string>;
  symmetries: Set<string>;
  fluorescences: Set<string>;
  certifications: Set<string>;
}

interface SimpleFilters {
  hasPhotos: boolean;
  hasVideos: boolean;
}

export default function DiamondSearchPage() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { diamonds, listStatus, error, page, pages, total } = useSelector(
    (state: RootState) => state.inventory
  );
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { userInfo } = useSelector((state: RootState) => state.user);

  const isLoading = listStatus === "loading";

  // Search and pagination state from URL for consistency
  const searchTerm = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page") || "1");

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [activeTab, setActiveTab] = useState<"lab" | "natural">("lab");
  const [sortBy, setSortBy] = useState("recent");

  // Filter states
  const [simpleFilters, setSimpleFilters] = useState<SimpleFilters>({
    hasPhotos: false,
    hasVideos: false,
  });

  // View and interaction states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  // Static filter options
  const filterOptions = useMemo(
    () => ({
      shapes: [
        "ROUND",
        "PRINCESS",
        "CUSHION",
        "OVAL",
        "PEAR",
        "MARQUISE",
        "EMERALD",
        "RADIANT",
        "HEART",
        "ASSCHER",
      ],
      cuts: ["EX", "VG", "GD", "Fair", "Poor"],
      colors: [
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "FANCY VIVID BLUE",
      ],
      clarities: [
        "FL",
        "IF",
        "VVS1",
        "VVS2",
        "VS1",
        "VS2",
        "SI1",
        "SI2",
        "I1",
        "I2",
        "I3",
      ],
      polishes: ["EX", "VG", "GD", "Fair"],
      symmetries: ["EX", "VG", "GD", "Fair"],
      fluorescences: ["None", "Faint", "Medium", "Strong", "Very Strong"],
      certifications: ["GIA", "IGI", "HRD", "SGL"],
      minPrice: 0,
      maxPrice: 100000,
      minCarat: 0,
      maxCarat: 10,
    }),
    []
  );

  // Initialize advanced filters
  const defaultAdvancedFilters = useMemo<AdvancedFilters>(
    () => ({
      shapes: new Set<string>(),
      price: [filterOptions.minPrice, filterOptions.maxPrice],
      carat: [filterOptions.minCarat, filterOptions.maxCarat],
      cuts: new Set<string>(),
      colors: new Set<string>(),
      clarities: new Set<string>(),
      polishes: new Set<string>(),
      symmetries: new Set<string>(),
      fluorescences: new Set<string>(),
      certifications: new Set<string>(),
    }),
    [filterOptions]
  );

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
    defaultAdvancedFilters
  );
  const [tempAdvancedFilters, setTempAdvancedFilters] =
    useState<AdvancedFilters>(defaultAdvancedFilters);

  useEffect(
    () => setTempAdvancedFilters(defaultAdvancedFilters),
    [defaultAdvancedFilters]
  );

  // ✅ FIX: This is the main effect. It triggers an API call whenever any filter, search, sort, or page changes.
  useEffect(() => {
    const fetchParams: any = {
      page: currentPage,
      search: searchTerm,
      type: activeTab === "lab" ? "LAB GROWN" : "NATURAL",
      sortBy,
      ...simpleFilters,
    };

    const addSetToArrayParam = (key: string, set: Set<string>) => {
      if (set.size > 0) fetchParams[key] = Array.from(set);
    };

    addSetToArrayParam("shapes", advancedFilters.shapes);
    addSetToArrayParam("cuts", advancedFilters.cuts);
    addSetToArrayParam("colors", advancedFilters.colors);
    addSetToArrayParam("clarities", advancedFilters.clarities);
    addSetToArrayParam("polishes", advancedFilters.polishes);
    addSetToArrayParam("symmetries", advancedFilters.symmetries);
    addSetToArrayParam("fluorescences", advancedFilters.fluorescences);
    addSetToArrayParam("certifications", advancedFilters.certifications);

    if (
      advancedFilters.price[0] !== filterOptions.minPrice ||
      advancedFilters.price[1] !== filterOptions.maxPrice
    ) {
      fetchParams.price_min = advancedFilters.price[0];
      fetchParams.price_max = advancedFilters.price[1];
    }
    if (
      advancedFilters.carat[0] !== filterOptions.minCarat ||
      advancedFilters.carat[1] !== filterOptions.maxCarat
    ) {
      fetchParams.carat_min = advancedFilters.carat[0];
      fetchParams.carat_max = advancedFilters.carat[1];
    }

    dispatch(fetchDiamonds(fetchParams));
  }, [
    dispatch,
    searchTerm,
    currentPage,
    activeTab,
    sortBy,
    simpleFilters,
    advancedFilters,
    filterOptions,
  ]);

  // Update local search term when URL changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // ✅ FIX: Reset page to 1 when any filter changes. This is done by `updateUrlParams` function now.
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      // Always reset page to 1 on filter change, unless 'page' is the only thing changing
      if (!("page" in newParams && Object.keys(newParams).length === 1)) {
        currentParams.set("page", "1");
      }

      for (const [key, value] of Object.entries(newParams)) {
        if (value === undefined || value === "") {
          currentParams.delete(key);
        } else {
          currentParams.set(key, String(value));
        }
      }
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Reset selected items when data changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [diamonds]);

  const cartItemIds = useMemo(
    () => new Set(cartItems.map((item) => item._id)),
    [cartItems]
  );
  const wishlistItemIds = useMemo(
    () => new Set(wishlistItems.map((item) => item._id)),
    [wishlistItems]
  );

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += Object.values(simpleFilters).filter(Boolean).length;
    count += advancedFilters.shapes.size;
    count += advancedFilters.cuts.size;
    count += advancedFilters.colors.size;
    count += advancedFilters.clarities.size;
    count += advancedFilters.polishes.size;
    count += advancedFilters.symmetries.size;
    count += advancedFilters.fluorescences.size;
    count += advancedFilters.certifications.size;
    if (
      advancedFilters.price[0] !== filterOptions.minPrice ||
      advancedFilters.price[1] !== filterOptions.maxPrice
    )
      count++;
    if (
      advancedFilters.carat[0] !== filterOptions.minCarat ||
      advancedFilters.carat[1] !== filterOptions.maxCarat
    )
      count++;
    return count;
  }, [advancedFilters, simpleFilters, filterOptions]);

  // Event handlers
  const handleAddToCart = useCallback(
    (diamondId: string) => {
      if (!userInfo) {
        router.push("/login?redirect=/diamond-search");
        return;
      }
      dispatch(addToCartAction({ diamondId }));
    },
    [userInfo, router, dispatch]
  );

  const handleToggleWishlist = useCallback(
    (diamondId: string) => {
      if (!userInfo) {
        router.push("/login?redirect=/diamond-search");
        return;
      }
      const isLiked = wishlistItemIds.has(diamondId);
      if (isLiked) {
        dispatch(removeFromWishlist({ diamondId }));
      } else {
        dispatch(addToWishlist({ diamondId }));
      }
    },
    [userInfo, router, dispatch, wishlistItemIds]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateUrlParams({ q: localSearchTerm.trim() });
    },
    [localSearchTerm, updateUrlParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= pages) {
        updateUrlParams({ page: newPage });
        window.scrollTo(0, 0);
      }
    },
    [pages, updateUrlParams]
  );

  const toggleSimpleFilter = useCallback((filterName: keyof SimpleFilters) => {
    setSimpleFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
    // Page reset will be handled by the main useEffect dependency change
  }, []);

  const handleTempAdvancedFilterChange = useCallback(
    <K extends keyof AdvancedFilters, V>(key: K, value: V) => {
      setTempAdvancedFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleTempSetToggle = useCallback(
    (
      key: keyof Pick<
        AdvancedFilters,
        | "shapes"
        | "cuts"
        | "colors"
        | "clarities"
        | "polishes"
        | "symmetries"
        | "fluorescences"
        | "certifications"
      >,
      value: string
    ) => {
      setTempAdvancedFilters((prev) => {
        const newSet = new Set(prev[key]);
        if (newSet.has(value)) newSet.delete(value);
        else newSet.add(value);
        return { ...prev, [key]: newSet };
      });
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    setAdvancedFilters(tempAdvancedFilters);
    updateUrlParams({}); // This will trigger a page reset to 1
    setIsSheetOpen(false);
  }, [tempAdvancedFilters, updateUrlParams]);

  const handleClearTempFilters = useCallback(() => {
    setTempAdvancedFilters(defaultAdvancedFilters);
  }, [defaultAdvancedFilters]);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (open) setTempAdvancedFilters(advancedFilters);
      setIsSheetOpen(open);
    },
    [advancedFilters]
  );

  const resetFilters = useCallback(() => {
    setAdvancedFilters(defaultAdvancedFilters);
    setSimpleFilters({ hasPhotos: false, hasVideos: false });
    if (searchTerm) updateUrlParams({ q: "" });
  }, [defaultAdvancedFilters, searchTerm, updateUrlParams]);

  const handleSelectAll = useCallback(
    (checked: boolean | "indeterminate") => {
      setSelectedItems(
        checked === true ? new Set(diamonds.map((d) => d._id)) : new Set()
      );
    },
    [diamonds]
  );

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  }, []);

  const caratRanges = useMemo(
    () => [
      { label: "0-0.49", range: [0, 0.49] as [number, number] },
      { label: "0.50-0.99", range: [0.5, 0.99] as [number, number] },
      { label: "1.00-1.49", range: [1.0, 1.49] as [number, number] },
      { label: "1.50-1.99", range: [1.5, 1.99] as [number, number] },
      { label: "2.00-2.99", range: [2.0, 2.99] as [number, number] },
      { label: "3.00-3.99", range: [3.0, 3.99] as [number, number] },
      { label: "4.00-4.99", range: [4.0, 4.99] as [number, number] },
      {
        label: "5.00+",
        range: [5.0, filterOptions.maxCarat] as [number, number],
      },
    ],
    [filterOptions.maxCarat]
  );

  const areAllSelected =
    diamonds.length > 0 && selectedItems.size === diamonds.length;
  const isIndeterminate =
    selectedItems.size > 0 && selectedItems.size < diamonds.length;
  const tabTitle =
    activeTab === "natural"
      ? t("search.naturalDiamonds")
      : t("search.labGrownDiamonds");

  return (
    <div className="bg-background">
      <div className="container mx-auto py-6 px-4">
        <Tabs
          defaultValue="lab"
          onValueChange={(value) => setActiveTab(value as "lab" | "natural")}
          value={activeTab}
        >
          <TabsList className="bg-transparent p-0 border-b border-border rounded-none">
            <TabsTrigger
              value="natural"
              className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              {t("search.naturalDiamonds")}
            </TabsTrigger>
            <TabsTrigger
              value="lab"
              className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              {t("search.labGrownDiamonds")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">{tabTitle}</h1>
                <p className="text-muted-foreground">
                  {/* ✅ FIX: Use `total` from Redux for an accurate count across all pages */}
                  {isLoading
                    ? "Loading results..."
                    : `${total.toLocaleString()} ${t("search.results")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      {t("search.sortRecent")}
                    </SelectItem>
                    <SelectItem value="price_asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="carat_asc">
                      Carat: Low to High
                    </SelectItem>
                    <SelectItem value="carat_desc">
                      Carat: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
                  }
                >
                  {viewMode === "grid" ? (
                    <List className="mr-2 h-4 w-4" />
                  ) : (
                    <Grid className="mr-2 h-4 w-4" />
                  )}
                  {viewMode === "grid" ? "List view" : "Grid view"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 border rounded-lg">
              <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> All filters{" "}
                    {activeFilterCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 rounded-full px-2"
                      >
                        {activeFilterCount}
                      </Badge>
                    )}
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
                    <Accordion
                      type="multiple"
                      defaultValue={[
                        "shape",
                        "price",
                        "carat",
                        "cut",
                        "color",
                        "clarity",
                      ]}
                      className="w-full"
                    >
                      {/* Accordion Items for filters (Shapes, Price, Carat, etc.) */}
                      <AccordionItem value="shape">
                        <AccordionTrigger>Shape</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-3 gap-2">
                            {filterOptions.shapes.map((shape) => (
                              <Button
                                key={shape}
                                variant={
                                  tempAdvancedFilters.shapes.has(shape)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handleTempSetToggle("shapes", shape)
                                }
                                className="text-xs h-8"
                              >
                                {shape}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="price">
                        <AccordionTrigger>Price</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center gap-2 mb-4">
                            <Input
                              type="number"
                              placeholder={filterOptions.minPrice.toLocaleString()}
                              value={tempAdvancedFilters.price[0]}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                handleTempAdvancedFilterChange("price", [
                                  isNaN(v) ? filterOptions.minPrice : v,
                                  tempAdvancedFilters.price[1],
                                ]);
                              }}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              placeholder={filterOptions.maxPrice.toLocaleString()}
                              value={tempAdvancedFilters.price[1]}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                handleTempAdvancedFilterChange("price", [
                                  tempAdvancedFilters.price[0],
                                  isNaN(v) ? filterOptions.maxPrice : v,
                                ]);
                              }}
                            />
                          </div>
                          <Slider
                            min={filterOptions.minPrice}
                            max={filterOptions.maxPrice}
                            step={100}
                            value={tempAdvancedFilters.price}
                            onValueChange={(v) =>
                              handleTempAdvancedFilterChange(
                                "price",
                                v as [number, number]
                              )
                            }
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="carat">
                        <AccordionTrigger>Carat</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center gap-2 mb-4">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={filterOptions.minCarat.toFixed(2)}
                              value={tempAdvancedFilters.carat[0]}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                handleTempAdvancedFilterChange("carat", [
                                  isNaN(v) ? filterOptions.minCarat : v,
                                  tempAdvancedFilters.carat[1],
                                ]);
                              }}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={filterOptions.maxCarat.toFixed(2)}
                              value={tempAdvancedFilters.carat[1]}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                handleTempAdvancedFilterChange("carat", [
                                  tempAdvancedFilters.carat[0],
                                  isNaN(v) ? filterOptions.maxCarat : v,
                                ]);
                              }}
                            />
                          </div>
                          <Slider
                            min={filterOptions.minCarat}
                            max={filterOptions.maxCarat}
                            step={0.01}
                            value={tempAdvancedFilters.carat}
                            onValueChange={(v) =>
                              handleTempAdvancedFilterChange(
                                "carat",
                                v as [number, number]
                              )
                            }
                          />
                          <div className="grid grid-cols-4 gap-2 mt-4">
                            {caratRanges.map((cr) => (
                              <Button
                                key={cr.label}
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleTempAdvancedFilterChange(
                                    "carat",
                                    cr.range
                                  )
                                }
                                className="text-xs h-8"
                              >
                                {cr.label}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      {/* ... other accordion items for cut, color, clarity etc. will go here ... */}
                    </Accordion>
                  </ScrollArea>
                  <SheetFooter className="p-4 border-t bg-background sticky bottom-0 flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleClearTempFilters}
                    >
                      Clear
                    </Button>
                    <Button className="flex-1" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
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
                variant={simpleFilters.hasPhotos ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleSimpleFilter("hasPhotos")}
              >
                Has photos
              </Button>
              <Button
                variant={simpleFilters.hasVideos ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleSimpleFilter("hasVideos")}
              >
                Has videos
              </Button>

              {(activeFilterCount > 0 || searchTerm) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-red-500 mb-4">
                    Error loading diamonds
                  </div>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button
                    onClick={() =>
                      dispatch(
                        fetchDiamonds({ page: currentPage, search: searchTerm })
                      )
                    }
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ✅ FIX: Render based on `diamonds` from Redux, not a client-side filtered array */}
            {!isLoading && !error && diamonds.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* Grid View Map */}
                    {diamonds.map((diamond) => {
                      const isLiked = wishlistItemIds.has(diamond._id);
                      const isInCart = cartItemIds.has(diamond._id);
                      return (
                        <Card
                          key={diamond._id}
                          className="overflow-hidden group flex flex-col text-sm"
                        >
                          <div className="p-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`select-grid-${diamond._id}`}
                                checked={selectedItems.has(diamond._id)}
                                onCheckedChange={(checked) =>
                                  handleSelectItem(diamond._id, !!checked)
                                }
                              />
                              <label
                                htmlFor={`select-grid-${diamond._id}`}
                                className="font-medium text-xs cursor-pointer"
                              >
                                Select
                              </label>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleToggleWishlist(diamond._id)
                                }
                              >
                                {" "}
                                <Heart
                                  className={cn(
                                    "w-4 h-4",
                                    isLiked && "fill-red-500 text-red-500"
                                  )}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <GitCompareArrows className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Link
                            href={`/products/${diamond.stockId}`}
                            className="flex flex-col flex-grow"
                          >
                            <CardContent
                              className="p-0"
                              onMouseEnter={() =>
                                diamond.videoLink &&
                                setHoveredCardId(diamond._id)
                              }
                              onMouseLeave={() => setHoveredCardId(null)}
                            >
                              {hoveredCardId === diamond._id &&
                              diamond.videoLink ? (
                                <iframe
                                  src={`${diamond.videoLink}${diamond.videoLink.includes("?") ? "&" : "?"}autoplay=1&autospin=1&sound=0`}
                                  className="w-full object-cover aspect-square border-0"
                                  allow="autoplay; fullscreen"
                                />
                              ) : (
                                <img
                                  src={diamond.imageLink || placeholderImage}
                                  alt={diamond.shape || "diamond"}
                                  width={300}
                                  height={300}
                                  className="w-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                            </CardContent>
                            <div className="p-3 flex-grow flex flex-col">
                              <div className="text-xs text-muted-foreground mb-2">
                                <span>
                                  {diamond.lab} {diamond.reportNumber}
                                </span>{" "}
                                • <span>Stock ID {diamond.stockId}</span>
                              </div>
                              <p className="font-bold mb-1 hover:underline">{`${diamond.shape} ${diamond.carat?.toFixed(2) || "N/A"}ct ${diamond.color} ${diamond.clarity} ${diamond.cut || ""}`}</p>
                              <p className="text-muted-foreground text-xs mb-2">{`${diamond.length || ""}x${diamond.width || ""}x${diamond.height || ""}`}</p>
                              <div className="flex-grow"></div>
                              <div className="flex items-baseline gap-2 mb-3">
                                <div className="text-lg font-bold">
                                  {formatPrice(diamond.price || 0)}
                                </div>
                              </div>
                            </div>
                          </Link>
                          <div className="p-3 pt-0">
                            <Button
                              className="w-full"
                              onClick={() => handleAddToCart(diamond._id)}
                              disabled={isInCart}
                            >
                              <ShoppingCart size={16} className="mr-2" />
                              {isInCart ? "Added to cart" : "Add to cart"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={
                                areAllSelected ||
                                (isIndeterminate ? "indeterminate" : false)
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Cut</TableHead>
                          <TableHead className="text-right">Carat</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center w-[200px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* List View Map */}
                        {diamonds.map((diamond) => {
                          const isLiked = wishlistItemIds.has(diamond._id);
                          const isInCart = cartItemIds.has(diamond._id);
                          return (
                            <TableRow key={diamond._id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedItems.has(diamond._id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectItem(diamond._id, !!checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Link href={`/products/${diamond.stockId}`}>
                                  <img
                                    src={diamond.imageLink || placeholderImage}
                                    alt={diamond.shape || "diamond"}
                                    width={50}
                                    height={50}
                                    className="rounded-md border"
                                  />
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={`/products/${diamond.stockId}`}
                                  className="hover:underline"
                                >
                                  <div className="font-bold">{`${diamond.shape} ${diamond.color} ${diamond.clarity}`}</div>
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                  Stock ID: {diamond.stockId}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {diamond.lab}: {diamond.reportNumber}
                                </div>
                              </TableCell>
                              <TableCell>{diamond.cut || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                {diamond.carat?.toFixed(2) || "N/A"}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatPrice(diamond.price || 0)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleToggleWishlist(diamond._id)
                                    }
                                  >
                                    <Heart
                                      className={cn(
                                        "w-4 h-4",
                                        isLiked && "fill-red-500 text-red-500"
                                      )}
                                    />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => handleAddToCart(diamond._id)}
                                    disabled={isInCart}
                                  >
                                    <ShoppingCart size={16} className="mr-2" />
                                    {isInCart ? "Added" : "Add"}
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

                {pages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {currentPage} of {pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages || isLoading}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              !isLoading &&
              !error && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">
                      No Diamonds Found
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters, or switch to the other diamond
                      type tab.
                    </p>
                    <Button onClick={resetFilters}>Clear All Filters</Button>
                  </CardContent>
                </Card>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
