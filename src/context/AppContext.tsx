"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/store";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface AppContextType {
  likedItems: Set<number>;
  toggleLike: (diamondId: number) => void;
  cartItems: Set<number>;
  addToCart: (diamondId: number) => void;
  removeFromCart: (diamondId: number) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  user: User | null;
  role: string | null;
  setRole: (role: string | null) => void;
  isLoadingAuth: boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [likedItems, setLikedItems] = useState(new Set<number>());
  const [cartItems, setCartItems] = useState(new Set<number>());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // If auth object is null (Firebase not configured), don't listen for auth changes.
    if (!auth) {
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // When auth state changes, try to get role from session storage
        const storedRole = sessionStorage.getItem("userRole");
        if (storedRole) {
          setRole(storedRole);
        }
      } else {
        // Clear role when user logs out
        setRole(null);
        sessionStorage.removeItem("userRole");
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSetRole = (newRole: string | null) => {
    setRole(newRole);
    if (newRole) {
      sessionStorage.setItem("userRole", newRole);
    } else {
      sessionStorage.removeItem("userRole");
    }
  };

  const toggleLike = (diamondId: number) => {
    setLikedItems((prevLiked) => {
      const newLiked = new Set(prevLiked);
      if (newLiked.has(diamondId)) {
        newLiked.delete(diamondId);
        toast({ title: "Removed from liked items." });
      } else {
        newLiked.add(diamondId);
        toast({ title: "Added to liked items!" });
      }
      return newLiked;
    });
  };

  const addToCart = (diamondId: number) => {
    if (cartItems.has(diamondId)) {
      toast({
        variant: "default",
        title: "Already in Cart",
        description: "This diamond is already in your shopping cart.",
      });
      return;
    }
    setCartItems((prevCart) => {
      const newCart = new Set(prevCart);
      newCart.add(diamondId);
      toast({
        title: "Added to Cart!",
        description: "The diamond has been added to your cart.",
      });
      return newCart;
    });
  };

  const removeFromCart = (diamondId: number) => {
    setCartItems((prevCart) => {
      const newCart = new Set(prevCart);
      newCart.delete(diamondId);
      toast({
        variant: "destructive",
        title: "Removed from Cart",
        description: "The diamond has been removed from your cart.",
      });
      return newCart;
    });
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const logout = async () => {
    // If auth object is null, we can't log out.
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Firebase is not configured.",
      });
      return;
    }
    try {
      await signOut(auth);
      handleSetRole(null); // Clear role on logout
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        likedItems,
        toggleLike,
        cartItems,
        addToCart,
        removeFromCart,
        isChatOpen,
        toggleChat,
        user,
        role,
        setRole: handleSetRole,
        isLoadingAuth,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
