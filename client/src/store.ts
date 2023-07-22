import { configureStore } from '@reduxjs/toolkit'
import configSlice from './slices/configSlice'
import langSlice from './slices/langSlice'

export const store = configureStore({
  reducer: {
    config: configSlice,
    lang: langSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch