import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForms from '@/components/ProfileForms';
import UsersList from '@/components/UsersList';
import { fail, mockFetch, ok, renderWithStore, signedIn, user } from '@/testUtils';

describe('UsersList', () => {
  it('memuat, mencari, dan menampilkan kosong', async () => {
    mockFetch(() => ok({ users: [user, { ...user, id: 2, name: 'Budi', email: 'budi@del.ac.id' }] }));
    renderWithStore(<UsersList />, signedIn);
    expect(screen.getByText('Memuat pengguna...')).toBeInTheDocument();
    expect(await screen.findByText('Budi')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'budi');
    expect(screen.queryByText('Yobez')).toBeNull();
    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'zzz');
    expect(screen.getByText('Pengguna tidak ditemukan.')).toBeInTheDocument();
  });

  it('tidak memuat sebelum token ada', () => {
    const f = mockFetch(() => ok({ users: [] }));
    renderWithStore(<UsersList />);
    expect(f).not.toHaveBeenCalled();
  });
});

describe('ProfileForms', () => {
  it('menampilkan pesan memuat tanpa user', () => {
    renderWithStore(<ProfileForms />);
    expect(screen.getByText('Memuat profil...')).toBeInTheDocument();
  });

  it('memperbarui informasi akun', async () => {
    mockFetch(() => ok({ user: { ...user, name: 'Baru' } }));
    const { store } = renderWithStore(<ProfileForms />, signedIn);
    const name = screen.getByLabelText('Nama lengkap');
    expect(name).toHaveValue('Yobez');
    await userEvent.clear(name);
    await userEvent.clear(screen.getByLabelText('Email'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(screen.getByText('Nama wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Masukkan alamat email yang valid.')).toBeInTheDocument();
    await userEvent.type(name, 'Baru');
    await userEvent.type(screen.getByLabelText('Email'), 'baru@del.ac.id');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(store.getState().session.user?.name).toBe('Baru'));
  });

  it('mengunggah foto', async () => {
    mockFetch((url) => (url.pathname.endsWith('/users/me') ? ok({ user }) : ok()));
    renderWithStore(<ProfileForms />, signedIn);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    expect(screen.getByText(/Pilih berkas gambar/)).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText('Pilih foto baru'), new File(['x'], 'a.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unggah foto' })).toBeEnabled());
    expect(screen.queryByText(/Pilih berkas gambar/)).toBeNull();
  });

  it('mengubah kata sandi (validasi, gagal, sukses)', async () => {
    renderWithStore(<ProfileForms />, signedIn);
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    expect(screen.getByText('Kata sandi saat ini wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi baru minimal 6 karakter.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Kata sandi saat ini'), 'lama123');
    await userEvent.type(screen.getByLabelText('Kata sandi baru'), 'baru1234');
    mockFetch(() => fail('Salah'));
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ubah kata sandi' })).toBeEnabled());
    expect(screen.getByLabelText('Kata sandi baru')).toHaveValue('baru1234');

    mockFetch(() => ok());
    await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    await waitFor(() => expect(screen.getByLabelText('Kata sandi baru')).toHaveValue(''));
  });
});
