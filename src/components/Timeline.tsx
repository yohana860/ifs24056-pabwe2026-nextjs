'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';
import Icon from '@/components/Icon';
import PostCard from '@/components/PostCard';
import { ComposeModal } from '@/components/PostModals';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import type { Post } from '@/lib/types';
import { fetchPosts, leaveList, removeAllMine, toggleLike } from '@/store/posts';

export function ListSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      {[0, 1, 2].map((key) => (
        <div key={key} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

export default function Timeline({ scope }: { scope: 'all' | 'mine' }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authed = useAppSelector((state) => state.session.hasToken);
  const user = useAppSelector((state) => state.session.user);
  const { items, loaded } = useAppSelector((state) => state.posts);
  const [query, setQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!authed) return;
    dispatch(fetchPosts(scope));
    return () => {
      dispatch(leaveList());
    };
  }, [authed, scope, dispatch]);

  const keyword = query.trim().toLowerCase();
  const visible = items.filter((post) =>
    `${post.description} ${post.author.name}`.toLowerCase().includes(keyword),
  );

  const handleLike = (post: Post) =>
    dispatch(
      toggleLike({ postId: post.id, userId: user!.id, like: !post.likes.includes(user!.id) }),
    );

  function renderList() {
    if (!loaded) {
      return (
        <>
          <p role="status" className="sr-only">
            Memuat postingan...
          </p>
          <ListSkeleton />
        </>
      );
    }
    if (visible.length === 0) {
      return (
        <p className="card p-8 text-center text-muted">
          {items.length === 0 ? 'Belum ada postingan.' : 'Tidak ada postingan yang cocok.'}
        </p>
      );
    }
    return (
      <ul className="space-y-4">
        {visible.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              canLike={!!user}
              liked={!!user && post.likes.includes(user.id)}
              onLike={handleLike}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <label htmlFor="search-input" className="sr-only">
            Cari postingan
          </label>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" />
          </span>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari isi atau nama penulis"
            className="field pl-10"
          />
        </div>
        <button type="button" onClick={() => setComposing(true)} className="btn btn-primary">
          <Icon name="plus" />
          Tulis postingan
        </button>
        {scope === 'mine' && items.length > 0 && (
          <button type="button" onClick={() => setConfirming(true)} className="btn btn-outline text-danger">
            <Icon name="trash" />
            Hapus semua
          </button>
        )}
      </div>

      <div className="mt-6">{renderList()}</div>

      {composing && (
        <ComposeModal
          onClose={() => setComposing(false)}
          onCreated={(postId) => router.push(`/posts/${postId}`)}
        />
      )}
      {confirming && (
        <ConfirmDialog
          title="Hapus semua postingan saya?"
          message="Seluruh postingan milikmu akan dihapus permanen."
          confirmLabel="Ya, hapus semua"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            dispatch(removeAllMine());
          }}
        />
      )}
    </>
  );
}
