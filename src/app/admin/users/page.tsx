"use client";

import React, { useState, useEffect } from "react"; // ✅ useState ko import karein
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// ✅ Zaroori icons import karein
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllUsers } from "@/lib/features/users/userSlice";

// Helper function to format date strings
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export default function AdminUsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, listStatus } = useSelector((state: RootState) => state.user);

  // ✅ Step 1: Expanded row ka state manage karne ke liye
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleDetails = (userId: string) => {
    setExpandedUserId((prevId) => (prevId === userId ? null : userId));
  };

  // Badge ke liye sahi variant return karne wala function
  const getStatusVariant = (
    status?: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listStatus === "loading" && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {listStatus === "succeeded" && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {/* ✅ Step 2: Har user ke liye 2 rows render karein (ek main, ek details ke liye) */}
            {listStatus === "succeeded" &&
              users.map((user) => (
                <React.Fragment key={user._id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "Admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.companyName || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleDetails(user._id)}
                      >
                        {expandedUserId === user._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span className="ml-2">Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* ✅ Step 3: Collapsible Row - Yeh tabhi dikhegi jab 'expandedUserId' match hoga */}
                  {expandedUserId === user._id && (
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={6}>
                        <div className="p-4">
                          <h4 className="font-bold mb-3 text-base text-gray-700">
                            Additional User Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                            <div>
                              <p className="text-gray-500">Trading Name</p>
                              <p className="font-medium">
                                {user.tradingName || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Business Type</p>
                              <p className="font-medium">
                                {user.businessType || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Country</p>
                              <p className="font-medium">
                                {user.companyCountry || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-gray-500">Company Website</p>
                              <a
                                href={user.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {user.companyWebsite || "N/A"}
                              </a>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-gray-500">Company Address</p>
                              <p className="font-medium">
                                {user.companyAddress || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Corporate ID No.</p>
                              <p className="font-medium">
                                {user.corporateIdentityNumber || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-full">
                              <p className="text-gray-500">References</p>
                              <p className="font-medium whitespace-pre-wrap">
                                {user.references || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
