"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../store";

export interface Diamond {
  _id: string;
  stockId: string;
  availability: string;
  shape?: string;
  carat?: number;
  color?: string;
  clarity?: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  price?: number;
  lab?: string;
  reportNumber?: string;
  videoLink?: string;
  imageLink?: string;
  certLink?: string;
  type?: "NATURAL" | "LAB GROWN" | "CVD" | "HPHT";
  length?: number;
  width?: number;
  height?: number;
  table?: number;
  depth?: number;
  girdle?: string;
  culet?: string;
  location?: string;
  isActive?: boolean;
  description?: string;
  fluorescenceIntensity?: string;
  user?: { name: string };
  createdAt?: string;
  [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 300000,
});

interface InventoryState {
  list: Diamond[];
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  summary: { message: string; [key: string]: any } | null;
  diamonds: Diamond[];
  page: number;
  pages: number;
  total: number;
  singleDiamond: Diamond | null;
  singleStatus: "idle" | "loading" | "succeeded" | "failed";
  singleError: string | null;
}

const initialState: InventoryState = {
  list: [],
  listStatus: "idle",
  actionStatus: "idle",
  error: null,
  summary: null,
  diamonds: [],
  page: 1,
  pages: 1,
  total: 0,
  singleDiamond: null,
  singleStatus: "idle",
  singleError: null,
};

const getAuthHeaders = (getState: () => unknown) => {
  const state = getState() as RootState;
  const token = state?.user?.userInfo?.token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// --- Async Thunks ---

export const fetchDiamonds = createAsyncThunk(
  "inventory/fetchDiamonds",
  async (
    params: { page?: number; search?: string; [key: string]: any },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.get("/inventory", { params });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDiamondById = createAsyncThunk(
  "inventory/fetchDiamondById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Diamond>(`/inventory/${id}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDiamondByStockId = createAsyncThunk(
  "inventory/fetchDiamondByStockId",
  async (stockId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Diamond>(
        `/inventory/stock/${stockId}`
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          `Diamond with stock ID ${stockId} not found`
      );
    }
  }
);

export const addManualDiamond = createAsyncThunk(
  "inventory/addManual",
  async (
    payload: Partial<Diamond> & { sellerId?: string | null },
    { getState, rejectWithValue }
  ) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.post("/inventory/add-manual", payload, {
        headers,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const uploadCsv = createAsyncThunk(
  "inventory/uploadCsv",
  async (
    {
      csvFile,
      mapping,
      sellerId,
    }: {
      csvFile: File;
      mapping: { [key: string]: string };
      sellerId?: string | null;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const headers = getAuthHeaders(getState);
      const formData = new FormData();
      formData.append("csvFile", csvFile);
      formData.append("mapping", JSON.stringify(mapping));
      if (sellerId) {
        formData.append("sellerId", sellerId);
      }
      const { data } = await apiClient.post("/inventory/upload-csv", formData, {
        headers,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateDiamondDetails = createAsyncThunk(
  "inventory/updateDiamondDetails",
  async (
    { id, data: diamondData }: { id: string; data: Partial<Diamond> },
    { getState, rejectWithValue }
  ) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.put(`/inventory/${id}`, diamondData, {
        headers,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteDiamond = createAsyncThunk(
  "inventory/deleteDiamond",
  async (diamondId: string, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      await apiClient.delete(`/inventory/${diamondId}`, { headers });
      return { message: "Diamond removed successfully.", diamondId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const syncFromApi = createAsyncThunk(
  "inventory/syncFromApi",
  async (
    {
      apiUrl,
      mapping,
      sellerId,
      enableAutoSync,
    }: {
      apiUrl: string;
      mapping: Record<string, string>;
      sellerId?: string | null;
      enableAutoSync: boolean;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.post(
        "/inventory/sync-api",
        { apiUrl, mapping, sellerId, enableAutoSync },
        { headers }
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const syncFromFtp = createAsyncThunk(
  "inventory/syncFromFtp",
  async (
    payload: {
      ftpCreds: { host: string; user: string; password: string; path: string };
      mapping: Record<string, string>;
      sellerId?: string | null;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const headers = getAuthHeaders(getState);
      const backendPayload = {
        ...payload.ftpCreds,
        mapping: payload.mapping,
        sellerId: payload.sellerId,
      };
      const { data } = await apiClient.post(
        "/inventory/sync-ftp",
        backendPayload,
        { headers }
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const previewCsvHeaders = createAsyncThunk(
  "inventory/previewCsvHeaders",
  async (csvFile: File, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const formData = new FormData();
      formData.append("csvFile", csvFile);
      const { data } = await apiClient.post(
        "/inventory/preview-csv-headers",
        formData,
        { headers }
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to preview CSV headers."
      );
    }
  }
);

export const previewApiHeaders = createAsyncThunk(
  "inventory/previewApiHeaders",
  async (apiUrl: string, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.post(
        "/inventory/preview-headers-url",
        { apiUrl },
        { headers }
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to preview API headers."
      );
    }
  }
);

export const previewFtpHeaders = createAsyncThunk(
  "inventory/previewFtpHeaders",
  async (ftpCreds: any, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.post(
        "/inventory/preview-ftp-headers",
        ftpCreds,
        { headers }
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to preview FTP headers."
      );
    }
  }
);

export const fetchSupplierInventory = createAsyncThunk<
  Diamond[],
  void,
  { state: RootState }
>(
  "inventory/fetchSupplierInventory",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.get<{ diamonds: Diamond[] }>(
        `/inventory/my-inventory`,
        { headers }
      );
      return data.diamonds;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory"
      );
    }
  }
);

export const updateDiamondStatus = createAsyncThunk<
  Diamond,
  { diamondId: string; availability: string },
  { state: RootState }
>(
  "inventory/updateDiamondStatus",
  async ({ diamondId, availability }, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const { data } = await apiClient.put<{ diamond: Diamond }>(
        `/inventory/${diamondId}/status`,
        { availability },
        { headers }
      );
      return data.diamond;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    resetActionStatus: (state) => {
      state.actionStatus = "idle";
      state.error = null;
      state.summary = null;
    },
    resetSingleDiamond: (state) => {
      state.singleDiamond = null;
      state.singleStatus = "idle";
      state.singleError = null;
    },
  },
  extraReducers: (builder) => {
    const mainActionThunks = [
      addManualDiamond,
      updateDiamondDetails,
      deleteDiamond,
      syncFromApi,
      uploadCsv,
      syncFromFtp,
    ];
    mainActionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionStatus = "loading";
          state.error = null;
          state.summary = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionStatus = "succeeded";
          state.summary = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionStatus = "failed";
          state.error = action.payload as string;
        });
    });

    builder
      .addCase(fetchDiamonds.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchDiamonds.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.diamonds = action.payload.diamonds;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.count;
      })
      .addCase(fetchDiamonds.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload as string;
      });

    const singleFetchThunks = [fetchDiamondById, fetchDiamondByStockId];
    singleFetchThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.singleStatus = "loading";
        })
        .addCase(thunk.fulfilled, (state, action: PayloadAction<Diamond>) => {
          state.singleStatus = "succeeded";
          state.singleDiamond = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.singleStatus = "failed";
          state.singleError = action.payload as string;
        });
    });

    builder
      .addCase(fetchSupplierInventory.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(
        fetchSupplierInventory.fulfilled,
        (state, action: PayloadAction<Diamond[]>) => {
          state.listStatus = "succeeded";
          state.list = action.payload;
        }
      )
      .addCase(fetchSupplierInventory.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateDiamondStatus.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(
        updateDiamondStatus.fulfilled,
        (state, action: PayloadAction<Diamond>) => {
          state.actionStatus = "succeeded";
          const index = state.list.findIndex(
            (d) => d._id === action.payload._id
          );
          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
      )
      .addCase(updateDiamondStatus.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetActionStatus, resetSingleDiamond } = inventorySlice.actions;
export default inventorySlice.reducer;
