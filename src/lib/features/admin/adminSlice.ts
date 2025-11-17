// src/lib/features/admin/adminSlice.ts (CORRECTED FILE)

import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
interface ApiOrder {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: any[];
  totalAmount: number;
  status: "Pending" | "Completed" | "Cancelled" | string; // Status can be other strings too
  createdAt: string;
}

interface AdminState {
  orders: ApiOrder[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AdminState = {
  orders: [],
  status: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
const getToken = (state: RootState) => state.user.userInfo?.token;

export const fetchAllOrders = createAsyncThunk<
  ApiOrder[],
  void,
  { state: RootState }
>("admin/fetchAllOrders", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized, no token");

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<{ orders: ApiOrder[] }>(
      `${API_URL}/`, // <-- THIS IS THE CORRECT ENDPOINT
      config
    );

    return data.orders;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch all orders"
    );
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAllOrders.fulfilled,
        (state, action: PayloadAction<ApiOrder[]>) => {
          state.status = "succeeded";
          state.orders = action.payload;
        }
      )
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default adminSlice.reducer;
