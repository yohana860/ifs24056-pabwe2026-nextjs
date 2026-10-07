/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import Field from '@/components/Field';
import Icon from '@/components/Icon';
import { CoverModal, EditModal } from '@/components/PostModals';
import { ListSkeleton } from '@/components/Timeline';
import { assetUrl, formatDate } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchPost,
  leavePost,
  removeComment,
  removePost,
  sendComment,
  toggleLike,
} from '@/store/posts';

type Dialog = 'edit' | 'cover' | 'delete' | 'uncomment' | null;

export default function PostDetail({ postId }: { postId: number }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authed = useAppSelector((state) => state.session.hasToken);
  const user = useAppSelector((state) => state.session.user);
  const { detail, missing } = useAppSelector((state) => state.posts);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string>();
  const [dialog, setDialog] = useState<Dialog>(null);

  useEffect(() => {
    if (!authed) return;
    dispatch(fetchPost(postId));
    return () => {
      dispatch(leavePost());
    };
  }, [authed, postId, dispatch]);

  if (missing) return <p className="card p-8 text-center text-muted">Postingan tidak ditemukan.</p>;
  if (!detail) {
    return (
      <>
        <p role="status" className="sr-only">
          Memuat postingan...
        </p>
        <ListSkeleton />
      </>
    );
  }

  const cover = assetUrl(detail.cover);
  const liked = !!user && detail.likes.includes(user.id);
  const isOwner = !!user && detail.user_id === user.id;

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) {
      setCommentError('Komentar tidak boleh kosong.');
      return;
    }
    setCommentError(undefined);
    const result = await dispatch(sendComment({ id: postId, comment: comment.trim() }));
    if (sendComment.fulfilled.match(result)) setComment('');
  }

  return (
    <article>
      <Link href="/" className="btn btn-outline mb-4">
        <Icon name="back" />
        Kembali
      </Link>

      <div className="card overflow-hidden">
        {cover && (
          <img
            src={cover}
            alt="Cover postingan"
            width={768}
            height={192}
            decoding="async"
            className="h-48 w-full bg-brand-soft object-cover"
          />
        )}
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Avatar name={detail.author.name} photo={detail.author.photo} size={48} />
            <div className="min-w-0">
              <p className="truncate font-bold">{detail.author.name}</p>
              <p className="text-sm text-muted">{formatDate(detail.created_at)}</p>
            </div>
          </div>
          <p className="whitespace-pre-line break-words text-lg">{detail.description}</p>
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button
              type="button"
              aria-pressed={liked}
              disabled={!user}
              onClick={() =>
                dispatch(toggleLike({ postId, userId: user!.id, like: !liked }))
              }
              className={`btn btn-outline ${liked ? 'text-danger' : ''}`}
            >
              <Icon name="heart" filled={liked} />
              {detail.likes.length}
              <span className="sr-only"> suka</span>
            </button>
            {isOwner && (
              <>
                <button type="button" onClick={() => setDialog('cover')} className="btn btn-outline">
                  <Icon name="image" />
                  Ubah cover
                </button>
                <button type="button" onClick={() => setDialog('edit')} className="btn btn-outline">
                  <Icon name="edit" />
                  Ubah postingan
                </button>
                <button type="button" onClick={() => setDialog('delete')} className="btn btn-danger ml-auto">
                  <Icon name="trash" />
                  Hapus postingan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="comments-heading" className="mt-8">
        <h2 id="comments-heading" className="text-xl font-bold">
          Komentar ({detail.comments.length})
        </h2>
        <form onSubmit={handleComment} noValidate className="card mt-4 space-y-3 p-5">
          <Field
            id="comment-input"
            label="Tulis komentar"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            error={commentError}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              Kirim komentar
            </button>
          </div>
        </form>
        {detail.comments.length === 0 ? (
          <p className="mt-4 text-muted">Belum ada komentar.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {detail.comments.map((item) => {
              const mine = item.id === detail.my_comment?.id;
              return (
                <li key={item.id} className="card flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="whitespace-pre-line break-words">{item.comment}</p>
                    <p className="mt-1 text-sm text-muted">
                      {mine ? 'Komentar kamu · ' : ''}
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  {mine && (
                    <button type="button" onClick={() => setDialog('uncomment')} className="btn btn-outline text-danger">
                      Hapus komentar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {dialog === 'edit' && (
        <EditModal postId={postId} description={detail.description} onClose={() => setDialog(null)} />
      )}
      {dialog === 'cover' && <CoverModal postId={postId} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <ConfirmDialog
          title="Hapus postingan ini?"
          message="Postingan yang dihapus tidak dapat dikembalikan."
          confirmLabel="Ya, hapus"
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            setDialog(null);
            const result = await dispatch(removePost(postId));
            if (removePost.fulfilled.match(result)) router.replace('/');
          }}
        />
      )}
      {dialog === 'uncomment' && (
        <ConfirmDialog
          title="Hapus komentar kamu?"
          message="Komentar akan dihapus dari postingan ini."
          confirmLabel="Ya, hapus"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            dispatch(removeComment(postId));
          }}
        />
      )}
    </article>
  );
}
