import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import favoritesSlice from './slices/favoritesSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    favorites: favoritesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})
