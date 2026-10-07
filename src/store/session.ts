import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { clearToken, request, saveToken } from '@/lib/api';
import type { User } from '@/lib/types';
import { notify } from '@/store/notice';

export const login = createAsyncThunk(
  'session/login',
  async (credentials: { email: string; password: string }) => {
    const { data } = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      json: credentials,
    });
    saveToken(data.token);
    return data.user;
  },
);

export const register = createAsyncThunk(
  'session/register',
  async (form: { name: string; email: string; password: string }, { dispatch }) => {
    const { message } = await request('/auth/register', { method: 'POST', json: form });
    dispatch(notify({ kind: 'success', text: message }));
  },
);

export const fetchProfile = createAsyncThunk('session/profile', async () => {
  const { data } = await request<{ user: User }>('/users/me');
  return data.user;
});

export const logout = createAsyncThunk('session/logout', async () => {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // token mungkin sudah kedaluwarsa; sesi lokal tetap dihapus.
  }
  clearToken();
});

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (form: { name: string; email: string }, { dispatch }) => {
    const { message, data } = await request<{ user: User }>('/users/me', {
      method: 'PUT',
      json: form,
    });
    dispatch(notify({ kind: 'success', text: message }));
    return data.user;
  },
);

export const uploadPhoto = createAsyncThunk('users/uploadPhoto', async (photo: File, { dispatch }) => {
  const body = new FormData();
  body.append('photo', photo);
  const { message } = await request('/users/me/photo', { method: 'POST', form: body });
  await dispatch(fetchProfile());
  dispatch(notify({ kind: 'success', text: message }));
});

export const changePassword = createAsyncThunk(
  'users/changePassword',
  async (form: { current: string; next: string }, { dispatch }) => {
    const { message } = await request('/users/password', {
      method: 'PUT',
      json: {
        password: form.current,
        new_password: form.next,
        new_password_confirmation: form.next,
      },
    });
    dispatch(notify({ kind: 'success', text: message }));
  },
);

const sessionSlice = createSlice({
  name: 'session',
  initialState: { user: null as User | null, hasToken: false },
  reducers: {
    tokenFound: (state) => {
      state.hasToken = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.hasToken = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.hasToken = false;
      });
  },
});

export const { tokenFound } = sessionSlice.actions;
export default sessionSlice.reducer;
