"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import Link from "next/link";

// Redux imports - Path ko apne project ke hisaab se adjust karein
// CHANGE 1: 'reset' ki jagah 'resetActionStatus' import kiya gaya hai
import {
  registerUser,
  resetActionStatus,
} from "@/lib/features/users/userSlice";
import { AppDispatch, RootState } from "@/lib/store";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    role: "Buyer",
    name: "",
    email: "",
    password: "",
    companyName: "",
    tradingName: "",
    businessType: "",
    companyCountry: "",
    corporateIdentityNumber: "", // Backend model se match karein
    companyWebsite: "",
    companyAddress: "",
    references: "",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // CHANGE 2: Redux state se sahi properties (actionStatus, error) get ki gayi hain
  const { actionStatus, error } = useSelector((state: RootState) => state.user);

  // isLoading ko actionStatus se derive kiya gaya hai
  const isLoading = actionStatus === "loading";

  // Success ya error hone par side-effects handle karein
  useEffect(() => {
    // CHANGE 3: Logic ko actionStatus ke hisaab se update kiya gaya hai
    if (actionStatus === "failed") {
      alert(error || "An unknown error occurred."); // 'error' state ka istemal
    }

    if (actionStatus === "succeeded") {
      alert("Registration request submitted successfully!");

      // Register hone ke baad sabhi roles ko login page par bhejein
      router.push("/login");
    }

    // Status ko reset karein taki useEffect dobara na chale
    if (actionStatus !== "idle") {
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, router, dispatch]);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onRoleChange = (value: string) => {
    setFormData((prevState) => ({ ...prevState, role: value }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const registrationData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      registrationData.append(key, value);
    });

    if (documentFile) {
      registrationData.append("businessDocument", documentFile);
    }

    dispatch(registerUser(registrationData));
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-background py-12 px-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={onSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              Register as an Admin, or apply to be a Buyer or Supplier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>I want to register as a:</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={onRoleChange}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Buyer" id="buyer" />
                  <Label htmlFor="buyer">Buyer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Supplier" id="supplier" />
                  <Label htmlFor="supplier">Supplier</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="name"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={onInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={onInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                name="password"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={onInputChange}
                disabled={isLoading}
              />
            </div>

            {formData.role !== "Admin" && (
              <div className="pt-4 mt-4 border-t animate-in fade-in-0 slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="companyName"
                      id="companyName"
                      type="text"
                      required={formData.role !== "Admin"}
                      value={formData.companyName}
                      onChange={onInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradingName">
                      Trading name (if different)
                    </Label>
                    <Input
                      name="tradingName"
                      id="tradingName"
                      type="text"
                      value={formData.tradingName}
                      onChange={onInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">
                      Business type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="businessType"
                      id="businessType"
                      type="text"
                      required={formData.role !== "Admin"}
                      value={formData.businessType}
                      onChange={onInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCountry">
                      Company country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="companyCountry"
                      id="companyCountry"
                      type="text"
                      required={formData.role !== "Admin"}
                      value={formData.companyCountry}
                      onChange={onInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="corporateIdentityNumber">
                    Corporate Identity Number
                  </Label>
                  <Input
                    name="corporateIdentityNumber"
                    id="corporateIdentityNumber"
                    type="text"
                    value={formData.corporateIdentityNumber}
                    onChange={onInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="companyWebsite">Company website</Label>
                  <Input
                    name="companyWebsite"
                    id="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={onInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="companyAddress">
                    Full Company Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="companyAddress"
                    id="companyAddress"
                    type="text"
                    required={formData.role !== "Admin"}
                    value={formData.companyAddress}
                    onChange={onInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="references">
                    Business References <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    name="references"
                    id="references"
                    required={formData.role !== "Admin"}
                    value={formData.references}
                    onChange={onInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="businessDocument">
                    Business Document (PDF, JPG)
                  </Label>
                  <Input
                    name="businessDocument"
                    id="businessDocument"
                    type="file"
                    onChange={onFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Submitting..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {formData.role === "Admin"
                    ? "Register Admin"
                    : "Submit Registration Request"}
                </>
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
