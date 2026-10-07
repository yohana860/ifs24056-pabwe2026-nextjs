'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Avatar from '@/components/Avatar';
import Field from '@/components/Field';
import { isEmail } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { changePassword, updateProfile, uploadPhoto } from '@/store/session';

function InfoForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : 'Nama wajib diisi.',
      email: isEmail(email) ? undefined : 'Masukkan alamat email yang valid.',
    };
    setErrors(next);
    if (next.name || next.email) return;
    setBusy(true);
    await dispatch(updateProfile({ name: name.trim(), email: email.trim() }));
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
      <Field id="profile-name-input" label="Nama lengkap" autoComplete="name" value={name}
        onChange={(event) => setName(event.target.value)} error={errors.name} />
      <Field id="profile-email-input" label="Email" type="email" autoComplete="email" value={email}
        onChange={(event) => setEmail(event.target.value)} error={errors.email} />
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? 'Menyimpan...' : 'Simpan perubahan'}
      </button>
    </form>
  );
}

function PhotoForm() {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file || !file.type.startsWith('image/')) {
      setError('Pilih berkas gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setError(undefined);
    setBusy(true);
    await dispatch(uploadPhoto(file));
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="min-w-60 flex-1 space-y-4">
      <Field id="profile-photo-input" label="Pilih foto baru" type="file" accept="image/*"
        onChange={(event) => setFile(event.target.files![0])} error={error} />
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? 'Mengunggah...' : 'Unggah foto'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = {
      current: current ? undefined : 'Kata sandi saat ini wajib diisi.',
      next: next.length >= 6 ? undefined : 'Kata sandi baru minimal 6 karakter.',
    };
    setErrors(found);
    if (found.current || found.next) return;
    setBusy(true);
    const result = await dispatch(changePassword({ current, next }));
    setBusy(false);
    if (changePassword.fulfilled.match(result)) {
      setCurrent('');
      setNext('');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
      <Field id="profile-current-password-input" label="Kata sandi saat ini" type="password"
        autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)}
        error={errors.current} />
      <Field id="profile-new-password-input" label="Kata sandi baru" type="password"
        autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)}
        error={errors.next} />
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? 'Menyimpan...' : 'Ubah kata sandi'}
      </button>
    </form>
  );
}

export default function ProfileForms() {
  const user = useAppSelector((state) => state.session.user);

  return (
    <div className="space-y-6">
      <section aria-labelledby="info-heading" className="card p-6">
        <h2 id="info-heading" className="text-xl font-bold">Informasi akun</h2>
        {user ? (
          <InfoForm key={user.id} name={user.name} email={user.email} />
        ) : (
          <p role="status" className="mt-4 text-muted">Memuat profil...</p>
        )}
      </section>
      <section aria-labelledby="photo-heading" className="card p-6">
        <h2 id="photo-heading" className="text-xl font-bold">Foto profil</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {user && <Avatar name={user.name} photo={user.photo} size={72} />}
          <PhotoForm />
        </div>
      </section>
      <section aria-labelledby="password-heading" className="card p-6">
        <h2 id="password-heading" className="text-xl font-bold">Ubah kata sandi</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
