import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { request } from '@/lib/api';
import type { Post, PostDetail } from '@/lib/types';
import { notify } from '@/store/notice';

export const fetchPosts = createAsyncThunk('posts/fetch', async (scope: 'all' | 'mine') => {
  const { data } = await request<{ posts: Post[] }>('/posts', {
    query: scope === 'mine' ? { is_me: 1 } : {},
  });
  return data.posts;
});

export const fetchPost = createAsyncThunk('posts/fetchOne', async (id: number) => {
  const { data } = await request<{ post: PostDetail }>(`/posts/${id}`);
  return data.post;
});

export const createPost = createAsyncThunk(
  'posts/create',
  async (description: string, { dispatch }) => {
    const { message, data } = await request<{ post_id: number }>('/posts', {
      method: 'POST',
      json: { description },
    });
    dispatch(notify({ kind: 'success', text: message }));
    return data.post_id;
  },
);

export const editPost = createAsyncThunk(
  'posts/edit',
  async (arg: { id: number; description: string }, { dispatch }) => {
    const { message } = await request(`/posts/${arg.id}`, {
      method: 'PUT',
      json: { description: arg.description },
    });
    await dispatch(fetchPost(arg.id));
    dispatch(notify({ kind: 'success', text: message }));
  },
);

export const setCover = createAsyncThunk(
  'posts/cover',
  async (arg: { id: number; file: File }, { dispatch }) => {
    const form = new FormData();
    form.append('cover', arg.file);
    const { message } = await request(`/posts/${arg.id}/cover`, { method: 'POST', form });
    await dispatch(fetchPost(arg.id));
    dispatch(notify({ kind: 'success', text: message }));
  },
);

export const removePost = createAsyncThunk('posts/remove', async (id: number, { dispatch }) => {
  const { message } = await request(`/posts/${id}`, { method: 'DELETE' });
  dispatch(notify({ kind: 'success', text: message }));
});

export const removeAllMine = createAsyncThunk('posts/removeAll', async (_: void, { dispatch }) => {
  const { message } = await request('/posts', { method: 'DELETE' });
  dispatch(notify({ kind: 'success', text: message }));
});

export const toggleLike = createAsyncThunk(
  'posts/like',
  async (arg: { postId: number; userId: number; like: boolean }) => {
    await request(`/posts/${arg.postId}/likes`, {
      method: 'POST',
      json: { like: arg.like ? 1 : 0 },
    });
    return arg;
  },
);

export const sendComment = createAsyncThunk(
  'posts/comment',
  async (arg: { id: number; comment: string }, { dispatch }) => {
    await request(`/posts/${arg.id}/comments`, { method: 'POST', json: { comment: arg.comment } });
    await dispatch(fetchPost(arg.id));
  },
);

export const removeComment = createAsyncThunk('posts/uncomment', async (id: number, { dispatch }) => {
  await request(`/posts/${id}/comments`, { method: 'DELETE' });
  await dispatch(fetchPost(id));
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [] as Post[],
    loaded: false,
    detail: null as PostDetail | null,
    missing: false,
  },
  reducers: {
    leaveList: (state) => {
      state.items = [];
      state.loaded = false;
    },
    leavePost: (state) => {
      state.detail = null;
      state.missing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loaded = true;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.detail = action.payload;
      })
      .addCase(fetchPost.rejected, (state) => {
        state.missing = true;
      })
      .addCase(removeAllMine.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, userId, like } = action.payload;
        const apply = (post: { id: number; likes: number[] }) => {
          if (post.id !== postId) return;
          const others = post.likes.filter((id) => id !== userId);
          post.likes = like ? [...others, userId] : others;
        };
        state.items.forEach(apply);
        if (state.detail) apply(state.detail);
      });
  },
});

export const { leaveList, leavePost } = postsSlice.actions;
export default postsSlice.reducer;
