import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/users/userSlice";
import inventoryReducer from "./features/inventory/inventorySlice";
import cartReducer from "./features/cart/cartSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import orderReducer from "./features/order/orderSlice";
import adminReducer from "./features/admin/adminSlice";
import addressReducer from "./features/address/addressSlice";
import notificationReducer from "./features/notifications/notificationSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    inventory: inventoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    admin: adminReducer,
    address: addressReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
