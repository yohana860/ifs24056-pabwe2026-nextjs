import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import type { RootState } from '@/store';
import type { Post, PostDetail, User } from '@/lib/types';

export const user: User = {
  id: 1,
  name: 'Yobez',
  email: 'yobez@del.ac.id',
  photo: null,
  created_at: '2026-01-02T00:00:00Z',
};

export const post: Post = {
  id: 10,
  user_id: 1,
  cover: null,
  description: 'Halo dunia',
  created_at: '2026-02-03T00:00:00Z',
  author: { name: 'Yobez', photo: null },
  likes: [],
  comments: [],
};

export const detail: PostDetail = {
  ...post,
  comments: [
    { id: 5, comment: 'Komentarku', created_at: '2026-02-04T00:00:00Z' },
    { id: 6, comment: 'Komentar lain', created_at: '2026-02-04T00:00:00Z' },
  ],
  my_comment: { id: 5, comment: 'Komentarku', created_at: '2026-02-04T00:00:00Z' },
};

export const ok = (data: unknown = null, message = 'Berhasil') => ({ status: 'success', message, data });
export const fail = (message: string, data: unknown = null) => ({ status: 'fail', message, data });

type Handler = (url: URL, init: RequestInit) => unknown;

/** Ganti fetch global dengan handler yang mengembalikan envelope API. */
export function mockFetch(handler: Handler) {
  const fn = vi.fn(async (url: URL | string, init: RequestInit = {}) => ({
    json: async () => handler(new URL(String(url)), init),
  }));
  vi.stubGlobal('fetch', fn);
  return fn as unknown as { mock: { calls: [URL | string, RequestInit][] } };
}

export function renderWithStore(ui: ReactElement, preloaded?: Partial<RootState>) {
  const store = makeStore(preloaded);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

export const signedIn = {
  session: { user, hasToken: true },
} as Partial<RootState>;
