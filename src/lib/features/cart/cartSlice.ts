import axios from "axios";
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  AnyAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";

interface CartState {
  items: Diamond[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CartState = {
  items: [],
  listStatus: "idle",
  actionStatus: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cart`;

const getToken = (state: RootState) => state.user.userInfo?.token;

export const fetchCart = createAsyncThunk<
  Diamond[],
  void,
  { state: RootState }
>("cart/fetchCart", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<Diamond[]>(API_URL, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch cart"
    );
  }
});

export const addToCart = createAsyncThunk<
  Diamond,
  { diamondId: string },
  { state: RootState }
>("cart/addToCart", async ({ diamondId }, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post<{ cart: Diamond[] }>(
      `${API_URL}/add`,
      { diamondId },
      config
    );
    const addedItem = data.cart.find((item) => item._id === diamondId);
    if (!addedItem) throw new Error("Item not found in updated cart");
    return addedItem;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add to cart"
    );
  }
});

export const removeFromCart = createAsyncThunk<
  string,
  { diamondId: string },
  { state: RootState }
>(
  "cart/removeFromCart",
  async ({ diamondId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/remove/${diamondId}`, config);
      return diamondId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  }
);

export const moveFromWishlistToCart = createAsyncThunk<
  { cart: Diamond[]; wishlist: any[] },
  { diamondId: string },
  { state: RootState }
>(
  "cart/moveFromWishlistToCart",
  async ({ diamondId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(
        `${API_URL}/move-from-wishlist`,
        { diamondId },
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to move item"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartStatus: (state) => {
      state.actionStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const actionPending = (state: CartState) => {
      state.actionStatus = "loading";
      state.error = null;
    };
    const actionRejected = (state: CartState, action: AnyAction) => {
      state.actionStatus = "failed";
      state.error = action.payload;
    };
    const listPending = (state: CartState) => {
      state.listStatus = "loading";
      state.error = null;
    };
    const listRejected = (state: CartState, action: AnyAction) => {
      state.listStatus = "failed";
      state.error = action.payload;
    };

    builder
      .addCase(fetchCart.pending, listPending)
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<Diamond[]>) => {
          state.listStatus = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchCart.rejected, listRejected)

      .addCase(addToCart.pending, actionPending)
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Diamond>) => {
        state.actionStatus = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(addToCart.rejected, actionRejected)

      .addCase(removeFromCart.pending, actionPending)
      .addCase(
        removeFromCart.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.actionStatus = "succeeded";
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        }
      )
      .addCase(removeFromCart.rejected, actionRejected)

      .addCase(moveFromWishlistToCart.pending, actionPending)
      .addCase(moveFromWishlistToCart.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = action.payload.cart;
      })
      .addCase(moveFromWishlistToCart.rejected, actionRejected);
  },
});

export const { resetCartStatus } = cartSlice.actions;
export default cartSlice.reducer;
