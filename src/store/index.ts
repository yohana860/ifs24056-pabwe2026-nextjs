import { configureStore } from '@reduxjs/toolkit';
import notice from '@/store/notice';
import posts from '@/store/posts';
import session from '@/store/session';
import users from '@/store/users';

export const reducer = { session, posts, users, notice };

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer, preloadedState: preloadedState as RootState | undefined });

export const store = makeStore();

export type RootState = {
  [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]>;
};
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
