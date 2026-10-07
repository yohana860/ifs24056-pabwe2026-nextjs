/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { assetUrl, formatDate } from '@/lib/api';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  liked: boolean;
  canLike: boolean;
  onLike: (post: Post) => void;
}

export default function PostCard({ post, liked, canLike, onLike }: PostCardProps) {
  const cover = assetUrl(post.cover);
  return (
    <article className="card p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Avatar name={post.author.name} photo={post.author.photo} size={40} />
            <div className="min-w-0">
              <h2 className="truncate font-bold">{post.author.name}</h2>
              <p className="text-sm text-muted">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 whitespace-pre-line break-words">{post.description}</p>
        </div>
        {cover && (
          <img
            src={cover}
            alt=""
            width={88}
            height={88}
            loading="lazy"
            decoding="async"
            className="size-22 shrink-0 rounded-xl bg-brand-soft object-cover"
          />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <button
          type="button"
          aria-pressed={liked}
          disabled={!canLike}
          onClick={() => onLike(post)}
          className={`btn btn-outline ${liked ? 'text-danger' : ''}`}
        >
          <Icon name="heart" filled={liked} />
          {post.likes.length}
          <span className="sr-only"> suka</span>
        </button>
        <span className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-muted">
          <Icon name="comment" />
          {post.comments.length}
          <span className="sr-only"> komentar</span>
        </span>
        <Link
          href={`/posts/${post.id}`}
          aria-label={`Lihat detail postingan ${post.author.name}`}
          className="btn btn-primary ml-auto"
        >
          Lihat detail
        </Link>
      </div>
    </article>
  );
}
