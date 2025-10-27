"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import {
  fetchNotifications,
  markAllAsRead,
  Notification,
} from "@/lib/features/notifications/notificationSlice";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const BellIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const CheckDoubleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  return (
    <div
      className={`p-4 border-l-4 flex items-start space-x-4 ${
        notification.isRead
          ? "border-gray-300 bg-gray-50"
          : "border-blue-500 bg-white"
      }`}
    >
      <div className="flex-shrink-0">
        <BellIcon
          className={`mt-1 h-6 w-6 ${
            notification.isRead ? "text-gray-400" : "text-blue-500"
          }`}
        />
      </div>
      <div className="flex-1">
        <p
          className={`text-sm ${
            notification.isRead ? "text-gray-600" : "text-gray-900 font-medium"
          }`}
        >
          {notification.message}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </span>
        {notification.link && (
          <Link
            href={notification.link}
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, status, error, unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );
  const { userInfo } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log("👤 Current User Info:", userInfo);
    console.log("📬 Notifications State:", {
      notifications,
      status,
      error,
      unreadCount,
    });
  }, [userInfo, notifications, status, error, unreadCount]);

  useEffect(() => {
    if (userInfo) {
      console.log("🚀 Dispatching fetchNotifications for user:", userInfo._id);
      dispatch(fetchNotifications());
    } else {
      console.warn("⚠️ No user info - user might not be logged in");
    }
  }, [dispatch, userInfo]);

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };

  if (!userInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Please log in to view notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <CheckDoubleIcon className="mr-2 h-5 w-5" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {status === "loading" && (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="mt-4">Loading notifications...</p>
          </div>
        )}

        {status === "failed" && (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">
                Error loading notifications
              </p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <button
                onClick={() => dispatch(fetchNotifications())}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {status === "succeeded" && (
          <>
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  You have no notifications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
