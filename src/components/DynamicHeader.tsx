"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";

// Icons
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
} from "lucide-react";

// UI Components
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
import { ScrollArea } from "./ui/scroll-area";

// Hooks & Contexts
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

// Redux Imports
import { AppDispatch, RootState } from "@/lib/store";
import { logout } from "@/lib/features/users/userSlice"; // Sahi 'logout' action ko import karein

// Data
import { diamonds } from "@/lib/data";

const solutions = [
  {
    title: "B2B Sales Tool",
    description: "Sell more with powerful share & quote features",
  },
  // ... baaki solutions yahan add karein
];

export default function DynamicHeader() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Redux Integration ---
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.user);

  // Other Contexts
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { currency, setCurrency, formatPrice, supportedCurrencies } =
    useCurrency();

  const [headerSearchTerm, setHeaderSearchTerm] = useState(
    searchParams.get("q") || ""
  );

  // Dummy data (Inhe aapko apne Redux/Context se manage karna hoga)
  const likedItems = new Set();
  const cartItems = new Set();
  const likedDiamonds = diamonds.filter((d) => likedItems.has(d.id));

  useEffect(() => {
    setHeaderSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const handleLogout = () => {
    dispatch(logout()); // Redux logout action ko call karein
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(headerSearchTerm.trim())}`);
  };

  const handleShare = async () => {
    // Share logic yahan rahega
  };

  const currentLanguageName =
    supportedLanguages.find((l) => l.code === language)?.name || "English";

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <PanelLeft />
          </Button>
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-headline"
          >
            <Diamond className="h-6 w-6" />
            <span>Rare Diamonds</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, shape, color, clarity..."
                className="pl-9"
                value={headerSearchTerm}
                onChange={(e) => setHeaderSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {t("header.solutions")}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>B2B - Wholesale</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {solutions.map((solution) => (
                <DropdownMenuItem
                  key={solution.title}
                  className="flex-col items-start gap-1 py-2 cursor-pointer"
                >
                  <div className="font-semibold">{solution.title}</div>
                  <div className="text-xs text-muted-foreground whitespace-normal">
                    {solution.description}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Globe className="mr-1" />
                {currentLanguageName}
                <ChevronDown className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ScrollArea className="h-72 w-48">
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {currency}
                <ChevronDown className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ScrollArea className="h-72 w-56">
                {supportedCurrencies.map((c) => (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                  >{`${c.code} - ${c.name}`}</DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Heart />
                {likedItems.size > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 h-auto leading-none">
                    {likedItems.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            {/* Wishlist Dropdown Content */}
          </DropdownMenu>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart />
              {cartItems.size > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 h-auto leading-none">
                  {cartItems.size}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth Section */}
          {userInfo ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userInfo.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userInfo.role === "Supplier" && (
                  <DropdownMenuItem asChild>
                    <Link href="/supplier/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Supplier Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {userInfo.role === "Buyer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/?tab=my-orders">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {userInfo.role === "Admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("header.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>{t("header.login")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>{t("header.register")}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* <Button onClick={toggleChat}>{t('header.liveChat')}</Button> */}
        </div>
      </div>
    </div>
  );
}
