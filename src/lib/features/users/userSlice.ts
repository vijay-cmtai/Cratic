// lib/features/users/userSlice.ts

import axios from "axios";
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  AnyAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";

// User data ka structure
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Buyer" | "Supplier";
  status?: "Pending" | "Approved" | "Rejected";
  token: string;
  companyName?: string;
  companyAddress?: string;
  tradingName?: string;
  businessType?: string;
  companyCountry?: string;
  companyWebsite?: string;
  corporateIdentityNumber?: string;
  references?: string;
  createdAt?: string;
}

// Slice ki state ka structure
interface UserState {
  userInfo: UserInfo | null;
  users: UserInfo[];
  selectedUser: UserInfo | null;
  singleStatus: "idle" | "loading" | "succeeded" | "failed";
  singleError: string | null;
  pagination: any;
  actionStatus: "idle" | "loading" | "succeeded" | "failed";
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const getUserInfoFromStorage = (): UserInfo | null => {
  if (typeof window !== "undefined") {
    const userInfoJSON = localStorage.getItem("userInfo");
    try {
      if (userInfoJSON) {
        return JSON.parse(userInfoJSON) as UserInfo;
      }
    } catch (e) {
      console.error("Failed to parse userInfo from localStorage", e);
      localStorage.removeItem("userInfo"); 
      return null;
    }
  }
  return null;
};

const initialState: UserState = {
  userInfo: getUserInfoFromStorage(),
  users: [],
  selectedUser: null,
  singleStatus: "idle",
  singleError: null,
  pagination: null,
  actionStatus: "idle",
  listStatus: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;
const getToken = (state: RootState) => state.user.userInfo?.token;
// --- ASYNC THUNKS ---
export const registerUser = createAsyncThunk<UserInfo, FormData>(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);
export const loginUser = createAsyncThunk<
  UserInfo,
  { email: string; password: string }
>("user/login", async (loginData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<UserInfo>(`${API_URL}/login`, loginData);
    if (data) {
      localStorage.setItem("userInfo", JSON.stringify(data));
    }
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const updateProfile = createAsyncThunk<
  UserInfo,
  FormData,
  { state: RootState }
>("user/updateProfile", async (formData, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = getToken(state);
    const userId = state.user.userInfo?._id;
    if (!token || !userId) throw new Error("User not authenticated");

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.put<UserInfo>(
      `${API_URL}/${userId}`,
      formData,
      config
    );

    const updatedUserInfo = { ...state.user.userInfo, ...data, token };
    localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

    return updatedUserInfo;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Profile update failed"
    );
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("user/delete", async (userIdToDelete, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_URL}/${userIdToDelete}`, config);
    return userIdToDelete;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete user"
    );
  }
});

export const fetchAllUsers = createAsyncThunk<
  UserInfo[],
  void,
  { state: RootState }
>("user/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<UserInfo[]>(`${API_URL}/all`, config);
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch users"
    );
  }
});

export const fetchUserById = createAsyncThunk<
  UserInfo,
  string,
  { state: RootState }
>("user/fetchById", async (userId, { getState, rejectWithValue }) => {
  try {
    const token = getToken(getState());
    if (!token) throw new Error("Not authorized");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get<UserInfo>(
      `${API_URL}/admin/${userId}`,
      config
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user details"
    );
  }
});

export const updateUserStatus = createAsyncThunk<
  UserInfo,
  { userId: string; status: "Approved" | "Rejected" },
  { state: RootState }
>(
  "user/updateStatus",
  async ({ userId, status }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Not authorized");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put<UserInfo>(
        `${API_URL}/${userId}`,
        { status },
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

// --- USER SLICE ---
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userInfo"); 
      state.userInfo = null;
      state.users = [];
      state.selectedUser = null;
      state.actionStatus = "idle";
      state.listStatus = "idle";
      state.singleStatus = "idle";
      state.error = null;
      state.singleError = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const actionPending = (state: UserState) => {
      state.actionStatus = "loading";
      state.error = null;
    };
    const actionRejected = (state: UserState, action: AnyAction) => {
      state.actionStatus = "failed";
      state.error = action.payload;
    };
    const listPending = (state: UserState) => {
      state.listStatus = "loading";
      state.error = null;
    };
    const listRejected = (state: UserState, action: AnyAction) => {
      state.listStatus = "failed";
      state.error = action.payload;
    };

    builder
      .addCase(registerUser.pending, actionPending)
      .addCase(registerUser.fulfilled, (state) => {
        state.actionStatus = "succeeded";
      })
      .addCase(registerUser.rejected, actionRejected)

      .addCase(loginUser.pending, actionPending)
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.actionStatus = "succeeded";
          state.userInfo = action.payload;
        }
      )
      .addCase(loginUser.rejected, actionRejected)

      .addCase(updateProfile.pending, actionPending)
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.actionStatus = "succeeded";
          state.userInfo = action.payload;
        }
      )
      .addCase(updateProfile.rejected, actionRejected)

      .addCase(deleteUser.pending, actionPending)
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.actionStatus = "succeeded";
        state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.userInfo?._id === action.payload) {
          state.userInfo = null;
          localStorage.removeItem("userInfo");
        }
      })
      .addCase(deleteUser.rejected, actionRejected)

      .addCase(fetchAllUsers.pending, listPending)
      .addCase(
        fetchAllUsers.fulfilled,
        (state, action: PayloadAction<UserInfo[]>) => {
          state.listStatus = "succeeded";
          state.users = action.payload;
        }
      )
      .addCase(fetchAllUsers.rejected, listRejected)

      .addCase(fetchUserById.pending, (state) => {
        state.singleStatus = "loading";
        state.singleError = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.singleStatus = "succeeded";
          state.selectedUser = action.payload;
        }
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.singleStatus = "failed";
        state.singleError = action.payload as string;
      })

      .addCase(updateUserStatus.pending, actionPending)
      .addCase(
        updateUserStatus.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.actionStatus = "succeeded";
          const index = state.users.findIndex(
            (user) => user._id === action.payload._id
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
          if (state.selectedUser?._id === action.payload._id) {
            state.selectedUser = action.payload;
          }
        }
      )
      .addCase(updateUserStatus.rejected, actionRejected);
  },
});

export const { logout, resetActionStatus } = userSlice.actions;
export default userSlice.reducer;
