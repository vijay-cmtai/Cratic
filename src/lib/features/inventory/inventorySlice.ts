import axios from "axios";
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  AnyAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

// --- API DETAILS ---
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/inventory`;

// --- INTERFACES ---
export interface Diamond {
  _id: string;
  stockId: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  price: number;
  imageLink?: string;
  user?: { name: string; email: string };
  [key: string]: any;
}

export type CsvMapping = Record<string, string>;
interface IUploadError {
  rowNumber: number;
  message: string;
  rowData: Record<string, any>;
}
interface IUploadSummary {
  totalRowsInFile: number;
  successfullyUpserted: number;
  failedRows: number;
  errors: IUploadError[];
}
interface ApiResponse {
  message: string;
  summary: IUploadSummary;
}
interface ICsvUploadPayload {
  csvFile: File;
  mapping: CsvMapping;
}
interface IHttpUploadPayload {
  url: string;
  mapping: CsvMapping;
}
interface IFtpUploadPayload {
  host: string;
  user: string;
  password: string;
  path: string;
  mapping: CsvMapping;
}
interface IManualAddPayload {
  [key: string]: any;
}
interface IManualApiResponse {
  message: string;
  diamond: any;
}

interface InventoryState {
  summary: IUploadSummary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  diamonds: Diamond[];
  currentDiamond: Diamond | null;
  page: number;
  pages: number;
  count: number;
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  singleStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: InventoryState = {
  summary: null,
  status: "idle",
  error: null,
  diamonds: [],
  currentDiamond: null,
  page: 1,
  pages: 1,
  count: 0,
  listStatus: "idle",
  actionStatus: "idle",
  singleStatus: "idle",
};

const getToken = (state: RootState) => state.user.userInfo?.token;

// --- ASYNC THUNKS ---

export const uploadCsv = createAsyncThunk<
  ApiResponse,
  ICsvUploadPayload,
  { state: RootState }
>("inventory/uploadCsv", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) return rejectWithValue("User not authenticated.");
    const formData = new FormData();
    formData.append("csvFile", payload.csvFile);
    formData.append("mapping", JSON.stringify(payload.mapping));
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.post<ApiResponse>(
      `${API_URL}/upload-csv`,
      formData,
      config
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const uploadHttp = createAsyncThunk<
  ApiResponse,
  IHttpUploadPayload,
  { state: RootState }
>("inventory/uploadHttp", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) return rejectWithValue("User not authenticated.");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.post<ApiResponse>(
      `${API_URL}/upload-http`,
      payload,
      config
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const uploadFtp = createAsyncThunk<
  ApiResponse,
  IFtpUploadPayload,
  { state: RootState }
>("inventory/uploadFtp", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) return rejectWithValue("User not authenticated.");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.post<ApiResponse>(
      `${API_URL}/upload-ftp`,
      payload,
      config
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addManualDiamond = createAsyncThunk<
  IManualApiResponse,
  IManualAddPayload,
  { state: RootState }
>("inventory/addManual", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) return rejectWithValue("User not authenticated.");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const numericPayload = { ...payload };
    const numericFields = [
      "carat",
      "price",
      "pricePerCarat",
      "length",
      "width",
      "height",
      "depthPercent",
      "tablePercent",
    ];
    numericFields.forEach((field) => {
      if (
        numericPayload[field] &&
        typeof numericPayload[field] === "string" &&
        numericPayload[field].trim() !== ""
      ) {
        const num = parseFloat(numericPayload[field]);
        if (!isNaN(num)) {
          numericPayload[field] = num;
        } else {
          delete numericPayload[field];
        }
      } else if (!numericPayload[field]) {
        delete numericPayload[field];
      }
    });
    const { data } = await axios.post<IManualApiResponse>(
      `${API_URL}/add-manual`,
      numericPayload,
      config
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Manual add failed"
    );
  }
});

export const fetchDiamonds = createAsyncThunk(
  "inventory/fetchDiamonds",
  async (
    { page = 1, search = "" }: { page?: number; search?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getToken(getState() as RootState);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(
        `${API_URL}?page=${page}&search=${search}`,
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchDiamondById = createAsyncThunk(
  "inventory/fetchDiamondById",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/${id}`, config);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteDiamond = createAsyncThunk(
  "inventory/deleteDiamond",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState() as RootState);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateDiamondDetails = createAsyncThunk(
  "inventory/updateDiamond",
  async (
    { id, data }: { id: string; data: Partial<Diamond> },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getToken(getState() as RootState);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data: updatedDiamond } = await axios.put(
        `${API_URL}/${id}`,
        data,
        config
      );
      return updatedDiamond;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    resetInventoryStatus: (state) => {
      state.status = "idle";
      state.actionStatus = "idle";
      state.error = null;
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    const actionPending = (state: InventoryState) => {
      state.actionStatus = "loading";
      state.error = null;
    };
    const actionRejected = (state: InventoryState, action: AnyAction) => {
      state.actionStatus = "failed";
      state.error = action.payload as string;
    };

    // --- Saare .addCase calls pehle ---
    builder
      .addCase(addManualDiamond.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.summary = null;
      })
      .addCase(addManualDiamond.fulfilled, (state) => {
        state.status = "succeeded";
        state.summary = {
          totalRowsInFile: 1,
          successfullyUpserted: 1,
          failedRows: 0,
          errors: [],
        };
      })
      .addCase(fetchDiamonds.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchDiamonds.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.diamonds = action.payload.diamonds;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.count = action.payload.count;
      })
      .addCase(fetchDiamonds.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchDiamondById.pending, (state) => {
        state.singleStatus = "loading";
      })
      .addCase(
        fetchDiamondById.fulfilled,
        (state, action: PayloadAction<Diamond>) => {
          state.singleStatus = "succeeded";
          state.currentDiamond = action.payload;
        }
      )
      .addCase(fetchDiamondById.rejected, (state, action) => {
        state.singleStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteDiamond.pending, actionPending)
      .addCase(
        deleteDiamond.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.actionStatus = "succeeded";
          state.diamonds = state.diamonds.filter(
            (d) => d._id !== action.payload
          );
        }
      )
      .addCase(deleteDiamond.rejected, actionRejected)
      .addCase(updateDiamondDetails.pending, actionPending)
      .addCase(
        updateDiamondDetails.fulfilled,
        (state, action: PayloadAction<Diamond>) => {
          state.actionStatus = "succeeded";
          const index = state.diamonds.findIndex(
            (d) => d._id === action.payload._id
          );
          if (index !== -1) {
            state.diamonds[index] = action.payload;
          }
        }
      )
      .addCase(updateDiamondDetails.rejected, actionRejected)

      // --- Ab saare .addMatcher calls ---
      .addMatcher(
        (action) =>
          action.type.startsWith("inventory/upload") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
          state.summary = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("inventory/upload") &&
          action.type.endsWith("/fulfilled"),
        (state, action: PayloadAction<ApiResponse>) => {
          state.status = "succeeded";
          state.summary = action.payload.summary;
        }
      )
      .addMatcher(
        (action) =>
          (action.type.startsWith("inventory/upload") ||
            action.type.startsWith("inventory/addManual")) &&
          action.type.endsWith("/rejected"),
        (state, action: AnyAction) => {
          state.status = "failed";
          state.error = action.payload as string;
          state.summary = null;
        }
      );
  },
});

export const { resetInventoryStatus } = inventorySlice.actions;
export default inventorySlice.reducer;
