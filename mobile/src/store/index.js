import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './authSlice';
import leaderboardReducer from './leaderboardSlice';
import { configureApi } from '../api/client';

export const store = configureStore({
  reducer: { auth: authReducer, leaderboard: leaderboardReducer },
});

// Wire the API client to the store without a circular import.
configureApi({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => { if (store.getState().auth.token) store.dispatch(logout()); },
});
