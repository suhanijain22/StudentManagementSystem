import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import { api } from '../api/client';
import { PAGE_SIZE } from '../config';
import { logout } from './authSlice';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async (args = {}, { getState, rejectWithValue }) => {
    const s = getState().leaderboard;
    try {
      return await api.leaderboard({
        page: args.page ?? 0,
        size: args.size ?? s.size,
        sortBy: args.sortBy ?? s.sortBy,
        direction: args.direction ?? s.direction,
      });
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

/** Re-syncs everything loaded so far from the server (keeps pagination consistent). */
export const refreshLeaderboard = createAsyncThunk('leaderboard/refresh', async (_, { dispatch, getState }) => {
  const { leaderboard, auth } = getState();
  const size = Math.min(Math.max(leaderboard.items.length, PAGE_SIZE), 100);
  await dispatch(fetchLeaderboard({ page: 0, size }));
  if (auth.user?.role === 'STUDENT') await dispatch(fetchMyStanding());
});

export const fetchMyStanding = createAsyncThunk('leaderboard/me', async (_, { rejectWithValue }) => {
  try { return await api.myStanding(); } catch (e) { return rejectWithValue(e.message); }
});

export const awardPoints = createAsyncThunk('leaderboard/award', async ({ studentId, points }, { rejectWithValue }) => {
  try { return await api.awardPoints(studentId, points); } catch (e) { return rejectWithValue(e.message); }
});

const initialState = {
  items: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true,
  sortBy: 'points', direction: 'desc',
  status: 'idle', loadingMore: false, refreshing: false, error: null,
  myStanding: null,
  awardStatus: 'idle', awardError: null,
  snapshots: {}, // requestId -> items before an optimistic award (for rollback)
};

/** Re-orders loaded rows immediately: points DESC, studentId ASC (same tie-break as the server). */
function reorder(state) {
  if (state.sortBy !== 'points') return;
  const sign = state.direction === 'asc' ? 1 : -1;
  state.items.sort((a, b) => sign * (a.points - b.points) || a.studentId - b.studentId);
  if (state.direction === 'desc') state.items.forEach((it, i) => { it.rank = i + 1; });
}

const slice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state, { meta }) => {
        state.error = null;
        if ((meta.arg?.page ?? 0) > 0) state.loadingMore = true;
        else if (state.items.length === 0) state.status = 'loading';
        else state.refreshing = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, { payload, meta }) => {
        const page = meta.arg?.page ?? 0;
        if (page === 0) {
          state.items = payload.content;
        } else {
          const known = new Set(state.items.map((i) => i.studentId));
          state.items.push(...payload.content.filter((i) => !known.has(i.studentId)));
        }
        Object.assign(state, {
          page: payload.page, size: payload.size, totalElements: payload.totalElements,
          totalPages: payload.totalPages, last: payload.last, sortBy: payload.sortBy, direction: payload.direction,
          status: 'idle', loadingMore: false, refreshing: false,
        });
      })
      .addCase(fetchLeaderboard.rejected, (state, { payload, error }) => {
        state.status = 'failed'; state.loadingMore = false; state.refreshing = false;
        state.error = payload || error.message;
      })
      .addCase(fetchMyStanding.fulfilled, (state, { payload }) => { state.myStanding = payload; })
      // ---- optimistic award ----
      .addCase(awardPoints.pending, (state, { meta }) => {
        state.awardStatus = 'loading'; state.awardError = null;
        state.snapshots[meta.requestId] = current(state.items);
        const { studentId, points } = meta.arg;
        const item = state.items.find((i) => i.studentId === studentId);
        if (item) { item.points = Math.max(0, item.points + points); reorder(state); }
      })
      .addCase(awardPoints.fulfilled, (state, { payload, meta }) => {
        delete state.snapshots[meta.requestId];
        state.awardStatus = 'idle';
        const item = state.items.find((i) => i.studentId === payload.studentId);
        if (item) { item.points = payload.points; item.rank = payload.rank; reorder(state); }
      })
      .addCase(awardPoints.rejected, (state, { payload, error, meta }) => {
        if (state.snapshots[meta.requestId]) state.items = state.snapshots[meta.requestId];
        delete state.snapshots[meta.requestId];
        state.awardStatus = 'failed'; state.awardError = payload || error.message;
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default slice.reducer;
