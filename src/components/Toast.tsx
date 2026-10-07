'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { dismiss } from '@/store/notice';

export default function Toast() {
  const dispatch = useAppDispatch();
  const notice = useAppSelector((state) => state.notice);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => dispatch(dismiss()), 6000);
    return () => clearTimeout(timer);
  }, [notice, dispatch]);

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md">
      {notice && (
        <div
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`flex items-start justify-between gap-3 rounded-xl p-4 text-sm font-semibold text-white shadow-lg ${
            notice.kind === 'error' ? 'bg-danger' : 'bg-emerald-800'
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => dispatch(dismiss())}
            className="min-h-6 shrink-0 cursor-pointer rounded px-2 underline"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
