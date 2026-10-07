'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { getToken } from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { fetchProfile, logout, tokenFound } from '@/store/session';

const LINKS = [
  { href: '/', label: 'Linimasa' },
  { href: '/mine', label: 'Postingan saya' },
  { href: '/users', label: 'Pengguna' },
  { href: '/profile', label: 'Profil' },
];

/** Kerangka halaman terproteksi: route guard + navigasi utama. */
export default function AppShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!getToken()) {
      router.replace('/auth/login');
      return;
    }
    dispatch(tokenFound());
    void dispatch(fetchProfile())
      .unwrap()
      .catch(async () => {
        await dispatch(logout());
        router.replace('/auth/login');
      });
  }, [dispatch, router]);

  async function handleLogout() {
    await dispatch(logout());
    router.replace('/auth/login');
  }

  return (
    <div className="min-h-dvh">
      <a href="#konten" className="skip-link">
        Lewati ke konten utama
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <p className="text-xl font-extrabold text-brand">Rumpi</p>
          <nav aria-label="Navigasi utama" className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={`btn ${pathname === link.href ? 'bg-brand-soft text-brand-dark' : 'text-ink hover:bg-brand-soft'}`}
              >
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={handleLogout} className="btn text-danger hover:bg-red-50">
              <Icon name="logout" />
              Keluar
            </button>
          </nav>
        </div>
      </header>
      <main id="konten" tabIndex={-1} className="mx-auto max-w-4xl px-4 py-8 outline-none">
        {children}
      </main>
    </div>
  );
}
