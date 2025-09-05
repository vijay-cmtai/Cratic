"use client";

import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Redux imports
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchAllUsers,
  updateUserStatus,
  deleteUser,
  resetActionStatus,
} from "@/lib/features/users/userSlice";

export default function AdminUsersListPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { users, listStatus, actionStatus, error } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === "succeeded") {
      toast({ title: "Success", description: "User list has been updated." });
      dispatch(fetchAllUsers()); // List ko refresh karein
      dispatch(resetActionStatus());
    }
    if (actionStatus === "failed") {
      toast({ variant: "destructive", title: "Error", description: error });
      dispatch(resetActionStatus());
    }
  }, [actionStatus, error, dispatch, toast]);

  const handleStatusUpdate = (
    userId: string,
    newStatus: "Approved" | "Rejected"
  ) => {
    dispatch(updateUserStatus({ userId, status: newStatus }));
  };

  // ✅ ERROR 1 FIXED: 'window' ko safely check kiya gaya hai
  const handleDelete = (userId: string, userName: string) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        `Are you sure you want to delete the user: ${userName}? This action cannot be undone.`
      )
    ) {
      dispatch(deleteUser(userId));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // ✅ ERROR 2 FIXED: Function ab sirf valid variants return karega
  const getStatusVariant = (
    status?: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Approved":
        return "default"; // "success" ko "default" se replace kiya
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
      <h1 className="text-3xl font-bold mb-6">All Registered Users</h1>
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User & Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listStatus === "loading" && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />{" "}
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" && users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {listStatus === "succeeded" &&
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {user.companyName || "No Company"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "Admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {user.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(user._id, "Approved")
                            }
                            disabled={actionStatus === "loading"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(user._id, "Rejected")
                            }
                            disabled={actionStatus === "loading"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user._id, user.name)}
                        disabled={actionStatus === "loading"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
