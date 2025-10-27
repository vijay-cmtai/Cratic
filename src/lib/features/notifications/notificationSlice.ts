"use client";

import {
  createSlice,
  createAsyncThunk,
  createAction,
  PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/lib/store";

export interface Notification {
  _id: string;
  user: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  status: "idle",
  error: null,
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/notifications`;

const getAuthHeaders = (getState: () => RootState) => {
  const token = getState().user.userInfo?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; unreadCount: number },
  void,
  { state: RootState }
>(
  "notifications/fetchNotifications",
  async (_, { getState, rejectWithValue }) => {
    try {
      console.log("🔍 [Frontend] Fetching notifications...");

      const state = getState();
      const token = state.user.userInfo?.token;
      const userId = state.user.userInfo?._id;

      console.log("🔑 Token exists:", !!token);
      console.log("👤 User ID:", userId);
      console.log("📡 API URL:", API_URL);

      const headers = getAuthHeaders(getState);

      if (!headers.Authorization) {
        console.error("❌ No authorization token found!");
        throw new Error("Not authorized, no token found.");
      }

      const { data } = await axios.get(API_URL, { headers });

      console.log("✅ Notifications received:", data.notifications?.length);
      console.log("📬 Unread count:", data.unreadCount);
      console.log("📋 Full response:", data);

      return data;
    } catch (error: any) {
      console.error("❌ Error fetching notifications:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markAsRead = createAsyncThunk<
  Notification,
  string,
  { state: RootState }
>(
  "notifications/markAsRead",
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);

      if (!headers.Authorization) {
        throw new Error("Not authorized, no token found.");
      }

      const { data } = await axios.put(
        `${API_URL}/${notificationId}/read`,
        {},
        { headers }
      );

      return data.notification;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as read"
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk<void, void, { state: RootState }>(
  "notifications/markAllAsRead",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);

      if (!headers.Authorization) {
        throw new Error("Not authorized, no token found.");
      }

      await axios.put(`${API_URL}/read-all`, {}, { headers });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark all as read"
      );
    }
  }
);

export const newNotificationReceived = createAction<Notification>(
  "notifications/newNotificationReceived"
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload._id
        );
        if (index !== -1) {
          if (!state.notifications[index].isRead && action.payload.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications[index] = action.payload;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })
      .addCase(newNotificationReceived, (state, action) => {
        const exists = state.notifications.some(
          (n) => n._id === action.payload._id
        );
        if (!exists) {
          state.notifications.unshift(action.payload);
          state.unreadCount += 1;
        }
      });
  },
});

export default notificationSlice.reducer;
