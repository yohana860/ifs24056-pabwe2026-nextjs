import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppShell from '@/components/AppShell';
import { LoginForm, RegisterForm } from '@/components/AuthForms';
import AuthShell from '@/components/AuthShell';
import { saveToken, getToken } from '@/lib/api';
import { nav } from '@/navMock';
import { fail, mockFetch, ok, renderWithStore, user } from '@/testUtils';

describe('AppShell', () => {
  it('mengalihkan ke login tanpa token', () => {
    renderWithStore(<AppShell><p>isi</p></AppShell>);
    expect(nav.replace).toHaveBeenCalledWith('/auth/login');
  });

  it('memuat profil, menandai halaman aktif, dan logout', async () => {
    saveToken('T');
    nav.pathname = '/users';
    mockFetch((url) => (url.pathname.endsWith('/users/me') ? ok({ user }) : ok()));
    const { store } = renderWithStore(<AppShell><p>isi</p></AppShell>);
    await waitFor(() => expect(store.getState().session.user).toEqual(user));
    expect(screen.getByRole('link', { name: 'Pengguna' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Linimasa' })).not.toHaveAttribute('aria-current');
    expect(nav.replace).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/auth/login'));
    expect(getToken()).toBeNull();
  });

  it('keluar otomatis bila token tidak valid', async () => {
    saveToken('basi');
    mockFetch(() => fail('Unauthenticated'));
    renderWithStore(<AppShell><p>isi</p></AppShell>);
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/auth/login'));
    expect(getToken()).toBeNull();
  });
});

describe('AuthShell', () => {
  it('mengalihkan ke beranda bila sudah login', () => {
    saveToken('T');
    renderWithStore(<AuthShell><p>form</p></AuthShell>);
    expect(nav.replace).toHaveBeenCalledWith('/');
  });

  it('tidak mengalihkan bila belum login', () => {
    renderWithStore(<AuthShell><p>form</p></AuthShell>);
    expect(screen.getByText('form')).toBeInTheDocument();
    expect(nav.replace).not.toHaveBeenCalled();
  });
});

describe('LoginForm', () => {
  it('validasi sisi klien', async () => {
    mockFetch(() => ok());
    renderWithStore(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.getByText('Masukkan alamat email yang valid.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.queryByText('Masukkan alamat email yang valid.')).toBeNull();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('login berhasil mengalihkan ke beranda', async () => {
    mockFetch(() => ok({ token: 'T', user }));
    renderWithStore(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'rahasia');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/'));
  });

  it('login gagal tetap di halaman', async () => {
    mockFetch(() => fail('Salah'));
    const { store } = renderWithStore(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('Kata sandi'), 'rahasia');
    await userEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    await waitFor(() => expect(store.getState().notice?.text).toBe('Salah'));
    expect(nav.replace).not.toHaveBeenCalled();
  });
});

describe('RegisterForm', () => {
  it('validasi, sukses, dan gagal', async () => {
    renderWithStore(<RegisterForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Nama wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi minimal 6 karakter.')).toBeInTheDocument();

    mockFetch(() => fail('Email dipakai'));
    await userEvent.type(screen.getByLabelText('Nama lengkap'), 'Yobez');
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText(/Kata sandi/), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Daftar' })).toBeEnabled());
    expect(nav.replace).not.toHaveBeenCalled();

    mockFetch(() => ok(null, 'Akun dibuat'));
    await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/auth/login'));
  });
});
