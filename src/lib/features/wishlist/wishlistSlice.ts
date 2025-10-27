import axios from "axios";
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  AnyAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { Diamond } from "@/lib/features/inventory/inventorySlice";
import { moveFromWishlistToCart } from "@/lib/features/cart/cartSlice";

interface WishlistState {
  items: Diamond[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  listStatus: "idle",
  actionStatus: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/wishlist`;
const getToken = (state: RootState) => state.user.userInfo?.token;

export const fetchWishlist = createAsyncThunk<
  Diamond[],
  void,
  { state: RootState }
>("wishlist/fetchWishlist", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<Diamond[]>(API_URL, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch wishlist"
    );
  }
});

export const addToWishlist = createAsyncThunk<
  Diamond,
  { diamondId: string },
  { state: RootState }
>(
  "wishlist/addToWishlist",
  async ({ diamondId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post<{ wishlist: Diamond[] }>(
        `${API_URL}/add`,
        { diamondId },
        config
      );
      const addedItem = data.wishlist.find((item) => item._id === diamondId);
      if (!addedItem) throw new Error("Item not found in updated wishlist");
      return addedItem;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk<
  string,
  { diamondId: string },
  { state: RootState }
>(
  "wishlist/removeFromWishlist",
  async ({ diamondId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/remove/${diamondId}`, config);
      return diamondId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlistStatus: (state) => {
      state.actionStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const actionPending = (state: WishlistState) => {
      state.actionStatus = "loading";
      state.error = null;
    };
    const actionRejected = (state: WishlistState, action: AnyAction) => {
      state.actionStatus = "failed";
      state.error = action.payload;
    };
    const listPending = (state: WishlistState) => {
      state.listStatus = "loading";
      state.error = null;
    };
    const listRejected = (state: WishlistState, action: AnyAction) => {
      state.listStatus = "failed";
      state.error = action.payload;
    };

    builder
      .addCase(fetchWishlist.pending, listPending)
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<Diamond[]>) => {
          state.listStatus = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchWishlist.rejected, listRejected)

      .addCase(addToWishlist.pending, actionPending)
      .addCase(
        addToWishlist.fulfilled,
        (state, action: PayloadAction<Diamond>) => {
          state.actionStatus = "succeeded";
          state.items.push(action.payload);
        }
      )
      .addCase(addToWishlist.rejected, actionRejected)

      .addCase(removeFromWishlist.pending, actionPending)
      .addCase(
        removeFromWishlist.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.actionStatus = "succeeded";
          state.items = state.items.filter(
            (item) => item._id !== action.payload
          );
        }
      )
      .addCase(removeFromWishlist.rejected, actionRejected)

      .addCase(moveFromWishlistToCart.fulfilled, (state, action) => {
        state.items = action.payload.wishlist;
      });
  },
});

export const { resetWishlistStatus } = wishlistSlice.actions;
export default wishlistSlice.reducer;
