"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { fetchDashboardData } from "@/lib/features/dashboard/dashboardSlice";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Link from "next/link";
import Image from "next/image";

// --- Helper Components (Keep these as they are) ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  colorClass,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  colorClass: string;
}) => (
  <Card
    className={`text-white overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorClass}`}
  >
    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/20 transition-colors" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium uppercase tracking-wider text-white/90">
        {title}
      </CardTitle>
      <Icon className="h-6 w-6 text-white/80" />
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="text-3xl font-bold">{value}</div>
      <div className="flex items-center gap-1 text-xs mt-1 text-green-300">
        <ArrowUpRight className="h-3 w-3" />
        <span>{change}</span>
      </div>
    </CardContent>
  </Card>
);

// --- Main Dashboard Page Component ---

export default function SupplierDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: dashboardData,
    status,
    error,
  } = useSelector((state: RootState) => state.dashboard);
  const { userInfo } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Fetch data only if the user is logged in and data hasn't been fetched yet
    if (userInfo && status === "idle") {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, userInfo, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  // If data hasn't loaded for any reason (e.g., no userInfo yet)
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Initializing...</p>
      </div>
    );
  }

  // Destructure data for easier access
  const { stats, salesOverview, bestSellers, recentOrders } = dashboardData;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {userInfo?.name || "Supplier"}!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your store's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue.value}
          icon={DollarSign}
          change={stats.totalRevenue.change}
          colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="New Orders"
          value={stats.newOrders.value}
          icon={ShoppingCart}
          change={stats.newOrders.change}
          colorClass="bg-gradient-to-r from-violet-500 to-purple-600"
        />
        <StatCard
          title="Products in Stock"
          value={stats.productsInStock.value}
          icon={Package}
          change={stats.productsInStock.change}
          colorClass="bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <StatCard
          title="New Customers"
          value={stats.newCustomers.value}
          icon={Users}
          change={stats.newCustomers.change}
          colorClass="bg-gradient-to-r from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your revenue performance over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesOverview}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Best Sellers</CardTitle>
            <CardDescription>
              Your top-performing products this month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bestSellers.map((product) => (
              <div key={product.name} className="flex items-center gap-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="rounded-md border bg-muted object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} sales
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of your most recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild variant="outline">
            <Link href="/supplier/orders">View All Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
