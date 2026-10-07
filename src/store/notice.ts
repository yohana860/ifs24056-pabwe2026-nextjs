import { createSlice, isRejected } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notice } from '@/lib/types';

let sequence = 0;

const noticeSlice = createSlice({
  name: 'notice',
  initialState: null as Notice | null,
  reducers: {
    notify: (_state, action: PayloadAction<Omit<Notice, 'id'>>): Notice => ({
      ...action.payload,
      id: ++sequence,
    }),
    dismiss: () => null,
  },
  extraReducers: (builder) => {
    // Semua thunk yang gagal otomatis menampilkan pesan galat (kecuali pengecekan sesi senyap).
    builder.addMatcher(
      (action) => isRejected(action) && !action.type.startsWith('session/profile'),
      (_state, action): Notice => ({
        kind: 'error',
        text: String((action as unknown as { error: { message?: string } }).error.message),
        id: ++sequence,
      }),
    );
  },
});

export const { notify, dismiss } = noticeSlice.actions;
export default noticeSlice.reducer;
