'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

/** Kerangka halaman login/registrasi; pengguna yang sudah masuk dialihkan ke beranda. */
export default function AuthShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) router.replace('/');
  }, [router]);

  return (
    <main id="konten" className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <p className="text-2xl font-extrabold text-brand">Rumpi</p>
        {children}
      </div>
    </main>
  );
}
