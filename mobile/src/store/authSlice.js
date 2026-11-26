import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ApiError } from '../api/client';
import { saveSession, loadSession, clearSession } from '../api/storage';

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const stored = await loadSession();
  if (!stored?.token) return null;
  try {
    // Validate the token and refresh the profile from the server.
    const user = await api.me(stored.token);
    await saveSession({ token: stored.token, user });
    return { token: stored.token, user };
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      await clearSession();
      return null;
    }
    return stored; // offline / server down: keep the persisted session
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { token, user } = await api.login(email, password);
    await saveSession({ token, user });
    return { token, user };
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { token, user } = await api.register(payload);
    await saveSession({ token, user });
    return { token, user };
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearSession();
});

const initialState = { token: null, user: null, status: 'idle', error: null, bootstrapped: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.bootstrapped = true;
        if (payload) { state.token = payload.token; state.user = payload.user; }
      })
      .addCase(restoreSession.rejected, (state) => { state.bootstrapped = true; })
      .addCase(logout.fulfilled, (state) => { Object.assign(state, initialState, { bootstrapped: true }); });
    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.status = 'loading'; state.error = null; })
        .addCase(thunk.fulfilled, (state, { payload }) => {
          state.status = 'idle'; state.token = payload.token; state.user = payload.user;
        })
        .addCase(thunk.rejected, (state, { payload, error }) => {
          state.status = 'failed'; state.error = payload || error.message;
        });
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
