import { configureStore } from '@reduxjs/toolkit';
import proposalReducer from '../features/proposal/proposalSlice';
import authReducer from '../features/auth/authSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    proposal: proposalReducer,
    auth: authReducer,
    theme: themeReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;