'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Field from '@/components/Field';
import { isEmail } from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { login, register } from '@/store/session';

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      email: isEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password ? undefined : 'Kata sandi wajib diisi.',
    };
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    const result = await dispatch(login({ email: email.trim(), password }));
    setBusy(false);
    if (login.fulfilled.match(result)) router.replace('/');
  }

  return (
    <>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Masuk</h1>
      <p className="mt-2 text-muted">Lanjutkan ke linimasa Rumpi.</p>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Field
          id="login-email-input"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Field
          id="login-password-input"
          label="Kata sandi"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <button id="login-submit-button" type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-semibold text-brand underline">
          Daftar sekarang
        </Link>
      </p>
    </>
  );
}

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : 'Nama wajib diisi.',
      email: isEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
      password: password.length >= 6 ? undefined : 'Kata sandi minimal 6 karakter.',
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;

    setBusy(true);
    const result = await dispatch(register({ name: name.trim(), email: email.trim(), password }));
    setBusy(false);
    if (register.fulfilled.match(result)) router.replace('/auth/login');
  }

  return (
    <>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Buat akun</h1>
      <p className="mt-2 text-muted">Gabung dan mulai bagikan ceritamu.</p>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Field
          id="register-name-input"
          label="Nama lengkap"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <Field
          id="register-email-input"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Field
          id="register-password-input"
          label="Kata sandi (minimal 6 karakter)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <button id="register-submit-button" type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-semibold text-brand underline">
          Masuk
        </Link>
      </p>
    </>
  );
}
