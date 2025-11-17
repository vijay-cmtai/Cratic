import axios from "axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import { fetchCart } from "@/lib/features/cart/cartSlice";
// --- Interfaces (No changes needed here) ---
export interface PopulatedOrderItem {
  _id: string;
  stockId: string;
  imageLink?: string;
  shape?: string;
  priceAtOrder: number;
  diamond: {
    _id: string;
    stockId: string;
    shape?: string;
    imageLink?: string;
  };
}
export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}
export interface Order {
  _id: string;
  userId: OrderUser;
  items: PopulatedOrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentInfo: { payment_status: string };
  createdAt: string;
}
export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}
export interface CreateOrderResponse {
  order: Order;
  razorpayOrder: RazorpayOrderResponse;
  razorpayKeyId: string;
}
// ✅ INTERFACE UPDATE: myOrders added
interface OrderState {
  create: {
    lastOrder: Order | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  verify: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  current: {
    data: Order | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  sellerOrders: {
    data: Order[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  // This new state is for the user's personal orders page
  myOrders: {
    data: Order[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}
// ✅ INITIAL STATE UPDATE: myOrders added
const initialState: OrderState = {
  create: { lastOrder: null, status: "idle", error: null },
  verify: { status: "idle", error: null },
  current: { data: null, status: "idle", error: null },
  sellerOrders: { data: [], status: "idle", error: null },
  myOrders: { data: [], status: "idle", error: null },
};
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
const getToken = (state: RootState) => state.user.userInfo?.token;
// --- Async Thunks ---
export const createOrderAndInitiatePayment = createAsyncThunk<
  CreateOrderResponse,
  void,
  { state: RootState }
>(
  "order/createAndInitiatePayment",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const { data } = await axios.post<CreateOrderResponse>(
        API_URL,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchCart());
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const verifyPayment = createAsyncThunk<
  { orderId: string },
  {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  { state: RootState }
>("order/verifyPayment", async (paymentData, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const { data } = await axios.post<{ orderId: string }>(
      `${API_URL}/verify-payment`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Payment verification failed"
    );
  }
});

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { state: RootState }
>("order/fetchOrderById", async (orderId, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const { data } = await axios.get<{ order: Order }>(
      `${API_URL}/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.order;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch order details"
    );
  }
});

export const fetchSellerOrders = createAsyncThunk<
  Order[],
  void,
  { state: RootState }
>("order/fetchSellerOrders", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const { data } = await axios.get<{ orders: Order[] }>(
      `${API_URL}/seller-orders`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.orders;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch seller orders"
    );
  }
});

// ✅ YEH HAI AAPKA NAYA THUNK JO EXPORT HO RAHA HAI
export const fetchMyOrders = createAsyncThunk<
  Order[],
  void,
  { state: RootState }
>("order/fetchMyOrders", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized, no token");

    // Important: Aapke backend API mein GET /api/orders/myorders route hona chahiye
    const { data } = await axios.get<{ orders: Order[] }>(
      `${API_URL}/myorders`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data.orders;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch your orders"
    );
  }
});

// --- The Slice ---
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetCreateOrderStatus: (state) => {
      state.create.status = "idle";
      state.create.error = null;
      state.verify.status = "idle";
      state.verify.error = null;
    },
    resetCurrentOrder: (state) => {
      state.current = { data: null, status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderAndInitiatePayment.pending, (state) => {
        state.create.status = "loading";
      })
      .addCase(createOrderAndInitiatePayment.fulfilled, (state, action) => {
        state.create.status = "succeeded";
        state.create.lastOrder = action.payload.order;
      })
      .addCase(createOrderAndInitiatePayment.rejected, (state, action) => {
        state.create.status = "failed";
        state.create.error = action.payload as string;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.verify.status = "loading";
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.verify.status = "succeeded";
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verify.status = "failed";
        state.verify.error = action.payload as string;
      })
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.current.status = "loading";
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.current.status = "succeeded";
        state.current.data = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.current.status = "failed";
        state.current.error = action.payload as string;
      })
      // Fetch Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.sellerOrders.status = "loading";
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.sellerOrders.status = "succeeded";
        state.sellerOrders.data = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.sellerOrders.status = "failed";
        state.sellerOrders.error = action.payload as string;
      })
      // ✅ YEH HAIN NAYE REDUCERS AAPKE `myOrders` STATE KE LIYE
      .addCase(fetchMyOrders.pending, (state) => {
        state.myOrders.status = "loading";
      })
      .addCase(
        fetchMyOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.myOrders.status = "succeeded";
          state.myOrders.data = action.payload;
        }
      )
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.myOrders.status = "failed";
        state.myOrders.error = action.payload as string;
      });
  },
});

export const { resetCreateOrderStatus, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
