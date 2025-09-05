"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { loginUser, resetActionStatus } from "@/lib/features/users/userSlice";
import { AppDispatch, RootState } from "@/lib/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const {
    userInfo: user,
    actionStatus,
    error,
  } = useSelector((state: RootState) => state.user);

  const isLoading = actionStatus === "loading";
  const isSuccess = actionStatus === "succeeded";
  const isError = actionStatus === "failed";

  useEffect(() => {
    if (user) {
      if (user.role === "Admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "Supplier") {
        router.push("/supplier");
      } else {
        router.push("/");
      }
    }

    // Agar login attempt mein error aata hai
    if (isError) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error, // 'error' state ka istemal
      });
    }

    // Login successful hone ke baad (lekin redirect se pehle)
    if (isSuccess && user) {
      // user ka check zaroori hai
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    }

    // Statuses ko reset karein taki yeh effect dobara na chale
    // CHANGE 3: 'reset' ki jagah 'resetActionStatus' call kiya gaya hai
    if (actionStatus !== "idle") {
      dispatch(resetActionStatus());
    }
  }, [user, actionStatus, isError, isSuccess, error, router, dispatch, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(loginUser(userData));
  };

  // Agar user object hai, to matlab user logged in hai aur redirection hoga.
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-full bg-background py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-16" />{" "}
              <Skeleton className="h-10 w-full" />{" "}
            </div>
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-16" />{" "}
              <Skeleton className="h-10 w-full" />{" "}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {" "}
            <Skeleton className="h-10 w-full" />{" "}
            <Skeleton className="h-4 w-3/4" />{" "}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full bg-background py-12">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">
              Marketplace Login
            </CardTitle>
            <CardDescription>
              Login as a Buyer, Supplier, or Admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Logging in..."
              ) : (
                <>
                  {" "}
                  <LogIn className="mr-2 h-4 w-4" /> Login{" "}
                </>
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
