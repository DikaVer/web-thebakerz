import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () => {
    return configureStore({
        reducer: {},
        devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools extension
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the id itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']