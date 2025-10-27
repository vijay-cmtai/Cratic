// src/components/DynamicHeader.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import {
  Diamond,
  Search,
  PanelLeft,
  Globe,
  Heart,
  ShoppingCart,
  UserCircle,
  ChevronDown,
  UserPlus,
  LogIn,
  Share2,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

import { AppDispatch, RootState } from "@/lib/store";
import { logout } from "@/lib/features/users/userSlice";
import { fetchWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { fetchCart } from "@/lib/features/cart/cartSlice";

const solutions = [
  {
    title: "B2B Sales Tool",
    description: "Sell more with powerful share & quote features",
    icon: "💼",
  },
  {
    title: "Inventory API",
    description: "Integrate our live diamond feed into your website",
    icon: "🔌",
  },
  {
    title: "White Label Website",
    description: "Get a ready-to-sell website with your own branding",
    icon: "🏷️",
  },
];

export default function DynamicHeader() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { userInfo } = useSelector((state: RootState) => state.user);
  const { items: likedItems, listStatus: wishlistStatus } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { items: cartItems, listStatus: cartStatus } = useSelector(
    (state: RootState) => state.cart
  );

  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [headerSearchTerm, setHeaderSearchTerm] = useState(
    searchParams.get("q") || ""
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      if (wishlistStatus === "idle") {
        dispatch(fetchWishlist());
      }
      if (cartStatus === "idle") {
        dispatch(fetchCart());
      }
    }
  }, [userInfo, wishlistStatus, cartStatus, dispatch]);

  useEffect(() => {
    setHeaderSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/diamond-search?q=${encodeURIComponent(headerSearchTerm.trim())}`
    );
  };

  const handleShare = async () => {
    toast({ title: "Share feature coming soon!" });
  };

  const currentLanguageName =
    supportedLanguages.find((l) => l.code === language)?.name || "Language";

  return (
    <div className="relative">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      <div className="relative container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Diamond className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Rare Diamonds
                </span>
                <div className="flex items-center gap-1 -mt-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-slate-500">
                    Premium Quality
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-6 lg:mx-8">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search by ID, shape, color, clarity..."
                  className="pl-12 pr-4 h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={headerSearchTerm}
                  onChange={(e) => setHeaderSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    <span>⌘</span>K
                  </kbd>
                </div>
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t("header.solutions")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-slate-500 px-3 py-2">
                  B2B - Wholesale Solutions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-1">
                  {solutions.map((solution) => (
                    <DropdownMenuItem
                      key={solution.title}
                      className="flex items-start gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="text-2xl mt-0.5">{solution.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {solution.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {solution.description}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  <span className="hidden xl:inline">
                    {currentLanguageName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-slate-500">
                  Select Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {supportedLanguages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className="cursor-pointer"
                    >
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-slate-500">
                  Select Currency
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {supportedCurrencies.map((c) => (
                    <DropdownMenuItem
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className="cursor-pointer"
                    >
                      <span className="flex-1">{`${c.code} - ${c.name}`}</span>
                      {currency === c.code && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Wishlist & Cart - All Screens */}
          <div className="flex items-center gap-1">
            <Link href="/wishlist" passHref>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Heart className="h-5 w-5" />
                {likedItems?.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                  >
                    {likedItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/cart" passHref>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems?.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu - Desktop */}
            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden lg:flex items-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                        {userInfo.name?.charAt(0).toUpperCase() ||
                          userInfo.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                          {userInfo.name?.charAt(0).toUpperCase() ||
                            userInfo.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {userInfo.name || "User"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {userInfo.email}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userInfo.role === "Admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userInfo.role === "Supplier" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/supplier/dashboard"
                        className="flex items-center"
                      >
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                          <LayoutDashboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>Supplier Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/account/orders" className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2">
                        <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                  >
                    <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">{t("header.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/login" className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                        <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>{t("header.login")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/register" className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                        <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>{t("header.register")}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    {userInfo ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {userInfo.name?.charAt(0).toUpperCase() ||
                              userInfo.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {userInfo.name || "User"}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {userInfo.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        Menu
                      </div>
                    )}
                  </div>

                  {/* Mobile Search */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          placeholder="Search diamonds..."
                          className="pl-10 rounded-xl"
                          value={headerSearchTerm}
                          onChange={(e) => setHeaderSearchTerm(e.target.value)}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {userInfo && (
                        <>
                          {userInfo.role === "Admin" && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-semibold">Admin Panel</span>
                            </Link>
                          )}
                          {userInfo.role === "Supplier" && (
                            <Link
                              href="/supplier/dashboard"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <LayoutDashboard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="font-semibold">
                                Supplier Portal
                              </span>
                            </Link>
                          )}
                          <Link
                            href="/account/orders"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                              <LayoutDashboard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-semibold">My Account</span>
                          </Link>
                        </>
                      )}

                      {!userInfo && (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold">
                              {t("header.login")}
                            </span>
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-semibold">
                              {t("header.register")}
                            </span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Mobile Settings */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                          Language
                        </div>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          {supportedLanguages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                          Currency
                        </div>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          {supportedCurrencies.map((c) => (
                            <option key={c.code} value={c.code}>
                              {`${c.code} - ${c.name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Mobile Logout */}
                  {userInfo && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-semibold"
                      >
                        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                          <LogOut className="h-5 w-5" />
                        </div>
                        {t("header.logout")}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
    </div>
  );
}
