import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '@/lib/api';
import type { User } from '@/lib/types';

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const { data } = await request<{ users: User[] }>('/users');
  return data.users;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [] as User[], loaded: false },
  reducers: {
    leaveUsers: () => ({ items: [], loaded: false }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (_state, action) => ({ items: action.payload, loaded: true }))
      .addCase(fetchUsers.rejected, (state) => {
        state.loaded = true;
      });
  },
});

export const { leaveUsers } = usersSlice.actions;
export default usersSlice.reducer;
