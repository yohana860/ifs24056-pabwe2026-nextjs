import { makeStore, store } from '@/store';
import { dismiss, notify } from '@/store/notice';
import {
  createPost, editPost, fetchPost, fetchPosts, leaveList, leavePost, removeAllMine,
  removeComment, removePost, sendComment, setCover, toggleLike,
} from '@/store/posts';
import {
  changePassword, fetchProfile, login, logout, register, tokenFound, updateProfile, uploadPhoto,
} from '@/store/session';
import { fetchUsers, leaveUsers } from '@/store/users';
import { detail, fail, mockFetch, ok, post, user } from '@/testUtils';
import { getToken, saveToken } from '@/lib/api';

describe('store', () => {
  it('singleton store tersedia', () => {
    expect(store.getState().session.hasToken).toBe(false);
  });
});

describe('notice', () => {
  it('notify dan dismiss', () => {
    const s = makeStore();
    s.dispatch(notify({ kind: 'success', text: 'ok' }));
    expect(s.getState().notice).toMatchObject({ kind: 'success', text: 'ok' });
    s.dispatch(dismiss());
    expect(s.getState().notice).toBeNull();
  });

  it('thunk gagal menghasilkan notice galat, kecuali pengecekan profil', async () => {
    mockFetch(() => fail('Gagal total'));
    const s = makeStore();
    await s.dispatch(fetchPosts('all'));
    expect(s.getState().notice).toMatchObject({ kind: 'error', text: 'Gagal total' });
    s.dispatch(dismiss());
    await s.dispatch(fetchProfile());
    expect(s.getState().notice).toBeNull();
  });
});

describe('session', () => {
  it('login menyimpan token dan user', async () => {
    mockFetch(() => ok({ token: 'T', user }));
    const s = makeStore();
    await s.dispatch(login({ email: 'a@b.co', password: 'x' }));
    expect(getToken()).toBe('T');
    expect(s.getState().session).toEqual({ user, hasToken: true });
  });

  it('register menampilkan notice sukses', async () => {
    mockFetch(() => ok(null, 'Akun dibuat'));
    const s = makeStore();
    await s.dispatch(register({ name: 'a', email: 'a@b.co', password: '123456' }));
    expect(s.getState().notice).toMatchObject({ kind: 'success', text: 'Akun dibuat' });
  });

  it('tokenFound dan fetchProfile', async () => {
    mockFetch(() => ok({ user }));
    const s = makeStore();
    s.dispatch(tokenFound());
    await s.dispatch(fetchProfile());
    expect(s.getState().session).toEqual({ user, hasToken: true });
  });

  it('logout menghapus sesi, juga saat API gagal', async () => {
    saveToken('T');
    mockFetch(() => fail('x'));
    const s = makeStore({ session: { user, hasToken: true } });
    await s.dispatch(logout());
    expect(getToken()).toBeNull();
    expect(s.getState().session).toEqual({ user: null, hasToken: false });
    mockFetch(() => ok());
    await s.dispatch(logout());
  });

  it('updateProfile, uploadPhoto, changePassword', async () => {
    const calls: string[] = [];
    mockFetch((url) => {
      calls.push(url.pathname);
      return url.pathname.endsWith('/users/me') ? ok({ user: { ...user, name: 'Baru' } }) : ok();
    });
    const s = makeStore();
    await s.dispatch(updateProfile({ name: 'Baru', email: user.email }));
    expect(s.getState().session.user?.name).toBe('Baru');
    await s.dispatch(uploadPhoto(new File(['x'], 'a.png', { type: 'image/png' })));
    await s.dispatch(changePassword({ current: 'a', next: 'b' }));
    expect(calls).toEqual(expect.arrayContaining(['/api/v1/users/me/photo', '/api/v1/users/password']));
  });
});

describe('users', () => {
  it('fetchUsers sukses, leave, dan gagal', async () => {
    mockFetch(() => ok({ users: [user] }));
    const s = makeStore();
    await s.dispatch(fetchUsers());
    expect(s.getState().users).toEqual({ items: [user], loaded: true });
    s.dispatch(leaveUsers());
    expect(s.getState().users.loaded).toBe(false);
    mockFetch(() => fail('x'));
    await s.dispatch(fetchUsers());
    expect(s.getState().users.loaded).toBe(true);
  });
});

describe('posts', () => {
  it('fetchPosts semua/mine, leaveList, dan gagal', async () => {
    const f = mockFetch(() => ok({ posts: [post] }));
    const s = makeStore();
    await s.dispatch(fetchPosts('all'));
    await s.dispatch(fetchPosts('mine'));
    expect(String(f.mock.calls[0][0])).not.toContain('is_me');
    expect(String(f.mock.calls[1][0])).toContain('is_me=1');
    expect(s.getState().posts.items).toEqual([post]);
    s.dispatch(leaveList());
    expect(s.getState().posts.loaded).toBe(false);
    mockFetch(() => fail('x'));
    await s.dispatch(fetchPosts('all'));
    expect(s.getState().posts.loaded).toBe(true);
  });

  it('fetchPost sukses, gagal, dan leavePost', async () => {
    mockFetch(() => ok({ post: detail }));
    const s = makeStore();
    await s.dispatch(fetchPost(10));
    expect(s.getState().posts.detail).toEqual(detail);
    s.dispatch(leavePost());
    expect(s.getState().posts.detail).toBeNull();
    mockFetch(() => fail('x'));
    await s.dispatch(fetchPost(10));
    expect(s.getState().posts.missing).toBe(true);
  });

  it('createPost mengembalikan id', async () => {
    mockFetch(() => ok({ post_id: 99 }, 'Dibuat'));
    const s = makeStore();
    const result = await s.dispatch(createPost('halo'));
    expect(result.payload).toBe(99);
  });

  it('edit, cover, comment, uncomment memuat ulang detail', async () => {
    const paths: string[] = [];
    mockFetch((url, init) => {
      paths.push(`${init.method} ${url.pathname.replace('/api/v1', '')}`);
      return url.pathname.endsWith('/10') && init.method === 'GET' ? ok({ post: detail }) : ok();
    });
    const s = makeStore();
    await s.dispatch(editPost({ id: 10, description: 'x' }));
    await s.dispatch(setCover({ id: 10, file: new File(['x'], 'a.png') }));
    await s.dispatch(sendComment({ id: 10, comment: 'x' }));
    await s.dispatch(removeComment(10));
    expect(paths.filter((p) => p === 'GET /posts/10')).toHaveLength(4);
    expect(s.getState().posts.detail).toEqual(detail);
  });

  it('removePost dan removeAllMine', async () => {
    mockFetch(() => ok());
    const s = makeStore({ posts: { items: [post], loaded: true, detail: null, missing: false } });
    await s.dispatch(removePost(10));
    await s.dispatch(removeAllMine());
    expect(s.getState().posts.items).toEqual([]);
  });

  it('toggleLike memperbarui daftar dan detail', async () => {
    mockFetch(() => ok());
    const other = { ...post, id: 11 };
    const s = makeStore({ posts: { items: [post, other], loaded: true, detail: { ...detail }, missing: false } });
    await s.dispatch(toggleLike({ postId: 10, userId: 1, like: true }));
    expect(s.getState().posts.items[0].likes).toEqual([1]);
    expect(s.getState().posts.items[1].likes).toEqual([]);
    expect(s.getState().posts.detail?.likes).toEqual([1]);
    await s.dispatch(toggleLike({ postId: 10, userId: 1, like: false }));
    expect(s.getState().posts.items[0].likes).toEqual([]);
    const bare = makeStore({ posts: { items: [post], loaded: true, detail: null, missing: false } });
    await bare.dispatch(toggleLike({ postId: 10, userId: 1, like: true }));
    expect(bare.getState().posts.items[0].likes).toEqual([1]);
  });
});
