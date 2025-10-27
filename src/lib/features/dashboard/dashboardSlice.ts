"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/lib/store";
export interface StatCardData {
  value: string;
  change: string;
}

export interface MonthlySale {
  month: string;
  revenue: number;
}

export interface BestSeller {
  name: string;
  image: string;
  sales: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

export interface DashboardData {
  stats: {
    totalRevenue: StatCardData;
    newOrders: StatCardData;
    productsInStock: StatCardData;
    newCustomers: StatCardData;
  };
  salesOverview: MonthlySale[];
  bestSellers: BestSeller[];
  recentOrders: RecentOrder[];
}

// --- Slice State Interface ---
interface DashboardState {
  data: DashboardData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// --- Initial State ---
const initialState: DashboardState = {
  data: null,
  status: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/supplier`;

const getAuthHeaders = (getState: () => RootState) => {
  const state = getState();
  const token = state.user.userInfo?.token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const fetchDashboardData = createAsyncThunk<
  DashboardData,
  void,
  { state: RootState }
>("dashboard/fetchData", async (_, { getState, rejectWithValue }) => {
  try {
    const headers = getAuthHeaders(getState);
    if (!headers.Authorization) {
      throw new Error("Not authorized, no token found.");
    }
    const { data } = await axios.get<DashboardData>(API_URL, { headers });
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch dashboard data"
    );
  }
});

// --- Dashboard Slice ---
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchDashboardData.fulfilled,
        (state, action: PayloadAction<DashboardData>) => {
          state.status = "succeeded";
          state.data = action.payload;
        }
      )
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
