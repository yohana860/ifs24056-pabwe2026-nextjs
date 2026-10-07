/* eslint-disable @next/next/no-img-element */
import { assetUrl } from '@/lib/api';

interface AvatarProps {
  name: string;
  photo: string | null;
  size: number;
}

/** Foto profil bila ada, jika tidak inisial nama. Selalu dekoratif (nama tampil di sebelahnya). */
export default function Avatar({ name, photo, size }: AvatarProps) {
  const src = assetUrl(photo);
  return src ? (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-full bg-brand-soft object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark"
      style={{ width: size, height: size }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
