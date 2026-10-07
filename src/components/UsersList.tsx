'use client';

import { useEffect, useState } from 'react';
import Avatar from '@/components/Avatar';
import Icon from '@/components/Icon';
import { ListSkeleton } from '@/components/Timeline';
import { formatDate } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUsers, leaveUsers } from '@/store/users';

export default function UsersList() {
  const dispatch = useAppDispatch();
  const authed = useAppSelector((state) => state.session.hasToken);
  const { items, loaded } = useAppSelector((state) => state.users);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!authed) return;
    dispatch(fetchUsers());
    return () => {
      dispatch(leaveUsers());
    };
  }, [authed, dispatch]);

  const keyword = query.trim().toLowerCase();
  const visible = items.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(keyword));

  return (
    <>
      <div className="relative">
        <label htmlFor="user-search-input" className="sr-only">
          Cari pengguna
        </label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon name="search" />
        </span>
        <input
          id="user-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama atau email"
          className="field pl-10"
        />
      </div>
      <div className="mt-6">
        {!loaded ? (
          <>
            <p role="status" className="sr-only">
              Memuat pengguna...
            </p>
            <ListSkeleton />
          </>
        ) : visible.length === 0 ? (
          <p className="card p-8 text-center text-muted">Pengguna tidak ditemukan.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visible.map((user) => (
              <li key={user.id} className="card flex items-center gap-3 p-4">
                <Avatar name={user.name} photo={user.photo} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.name}</p>
                  <p className="truncate text-sm text-muted">{user.email}</p>
                  <p className="text-sm text-muted">Bergabung {formatDate(user.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
