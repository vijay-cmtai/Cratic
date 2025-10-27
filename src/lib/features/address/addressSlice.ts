// lib/features/address/addressSlice.ts (NEW FILE)

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/lib/store";

// Address ka structure define karein
export interface Address {
  _id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "Home" | "Work" | "Shipping" | "Billing";
  isDefault: boolean;
}

// Slice ki state ka structure
interface AddressState {
  addresses: Address[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  listStatus: "idle",
  actionStatus: "idle",
  error: null,
};

// API URL aur Token helper
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/addresses`;
const getToken = (state: RootState) => state.user.userInfo?.token;

// Async Thunks (API Calls)

export const fetchAddresses = createAsyncThunk<
  Address[],
  void,
  { state: RootState }
>("address/fetchAddresses", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<Address[]>(API_URL, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
});

export const addAddress = createAsyncThunk<
  Address,
  Omit<Address, "_id">,
  { state: RootState }
>("address/addAddress", async (addressData, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post<Address>(API_URL, addressData, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add address"
    );
  }
});

export const deleteAddress = createAsyncThunk<
  string,
  { addressId: string },
  { state: RootState }
>(
  "address/deleteAddress",
  async ({ addressId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${addressId}`, config);
      return addressId; // Deletion ke baad ID return karein
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

// Slice Definition
const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    resetAddressStatus: (state) => {
      state.actionStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(
        fetchAddresses.fulfilled,
        (state, action: PayloadAction<Address[]>) => {
          state.listStatus = "succeeded";
          state.addresses = action.payload;
        }
      )
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload as string;
      })
      // Adding an address
      .addCase(addAddress.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(
        addAddress.fulfilled,
        (state, action: PayloadAction<Address>) => {
          state.actionStatus = "succeeded";
          state.addresses.push(action.payload);
        }
      )
      .addCase(addAddress.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload as string;
      })
      // Deleting an address
      .addCase(deleteAddress.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(
        deleteAddress.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.actionStatus = "succeeded";
          state.addresses = state.addresses.filter(
            (addr) => addr._id !== action.payload
          );
        }
      )
      .addCase(deleteAddress.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetAddressStatus } = addressSlice.actions;
export default addressSlice.reducer;
