// app/account/profile/page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  updateProfile,
  resetActionStatus,
} from "@/lib/features/users/userSlice";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // For notifications
import {
  Camera,
  Edit,
  Loader2,
  Save,
  X,
  Shield,
  Building,
  User as UserIcon,
} from "lucide-react";

const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function UserProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, actionStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userInfo });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync local form state with Redux state
    setFormData({ ...userInfo });
  }, [userInfo]);

  useEffect(() => {
    // Handle feedback from Redux action
    if (actionStatus === "succeeded") {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      dispatch(resetActionStatus());
    }
    if (actionStatus === "failed") {
      toast.error(error || "Failed to update profile. Please try again.");
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...userInfo });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Append only changed fields to FormData
    Object.keys(formData).forEach((key) => {
      // @ts-ignore
      if (formData[key] !== userInfo[key] && formData[key] !== undefined) {
        // @ts-ignore
        data.append(key, formData[key]);
      }
    });

    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    // Only dispatch if there are changes
    if (data.entries().next().value || avatarFile) {
      dispatch(updateProfile(data));
    } else {
      toast.info("No changes to save.");
      setIsEditing(false);
    }
  };

  if (!userInfo) {
    // Show skeleton loader while user info is being loaded
    return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="md:col-span-2 space-y-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal and company information.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-muted">
                  <AvatarImage
                    src={avatarPreview || userInfo.avatarUrl}
                    alt={userInfo.name}
                  />
                  <AvatarFallback className="text-4xl">
                    {getInitials(userInfo.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-background"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-2xl font-semibold">{userInfo.name}</h2>
              <p className="text-muted-foreground">{userInfo.email}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Information Cards */}
        <div className="md:col-span-2 space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon size={20} /> Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details here.
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} /> Company Information
              </CardTitle>
              <CardDescription>Manage your business details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  name="companyAddress"
                  value={formData.companyAddress || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} /> Security
              </CardTitle>
              <CardDescription>
                Manage your password and account security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" disabled={isEditing}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={actionStatus === "loading"}>
                {actionStatus === "loading" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
