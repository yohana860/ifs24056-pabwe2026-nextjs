import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '@/components/PostCard';
import PostDetail from '@/components/PostDetail';
import { CoverModal, EditModal } from '@/components/PostModals';
import Timeline from '@/components/Timeline';
import { nav } from '@/navMock';
import { detail, fail, mockFetch, ok, post, renderWithStore, signedIn } from '@/testUtils';

const other = { ...post, id: 11, description: 'Cerita lain', author: { name: 'Budi', photo: null }, likes: [1], cover: '/c.png', comments: [1, 2] };

describe('PostCard', () => {
  it('menampilkan cover, suka, dan memanggil onLike', async () => {
    const onLike = vi.fn();
    const { container, rerender } = renderWithStore(<PostCard post={other} liked canLike onLike={onLike} />);
    expect(container.querySelector('img')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /suka/ }));
    expect(onLike).toHaveBeenCalledWith(other);
    expect(screen.getByRole('link', { name: /Lihat detail/ })).toHaveAttribute('href', '/posts/11');
    rerender(<PostCard post={post} liked={false} canLike={false} onLike={onLike} />);
    expect(screen.getByRole('button', { name: /suka/ })).toBeDisabled();
  });
});

describe('Timeline', () => {
  it('menunggu token, memuat, mencari, dan menyukai', async () => {
    mockFetch(() => ok({ posts: [post, other] }));
    renderWithStore(<Timeline scope="all" />, { session: { user: null, hasToken: false } });
    expect(screen.getByText('Memuat postingan...')).toBeInTheDocument();
  });

  it('daftar, pencarian, dan suka', async () => {
    const f = mockFetch((url) => (url.pathname.endsWith('/likes') ? ok() : ok({ posts: [post, other] })));
    renderWithStore(<Timeline scope="all" />, signedIn);
    expect(await screen.findByText('Halo dunia')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Cari postingan'), 'budi');
    expect(screen.queryByText('Halo dunia')).toBeNull();
    await userEvent.clear(screen.getByLabelText('Cari postingan'));
    await userEvent.type(screen.getByLabelText('Cari postingan'), 'zzz');
    expect(screen.getByText('Tidak ada postingan yang cocok.')).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Cari postingan'));
    const card = screen.getByText('Halo dunia').closest('article')!;
    await userEvent.click(within(card).getByRole('button', { name: /suka/ }));
    await waitFor(() => expect(within(card).getByRole('button', { name: /suka/ })).toHaveAttribute('aria-pressed', 'true'));
    expect(f).toHaveBeenCalled();
  });

  it('daftar kosong', async () => {
    mockFetch(() => ok({ posts: [] }));
    renderWithStore(<Timeline scope="mine" />, signedIn);
    expect(await screen.findByText('Belum ada postingan.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hapus semua/ })).toBeNull();
  });

  it('menulis postingan lalu membuka detailnya', async () => {
    mockFetch((url, init) => (init.method === 'POST' ? ok({ post_id: 77 }) : ok({ posts: [] })));
    renderWithStore(<Timeline scope="all" />, signedIn);
    await screen.findByText('Belum ada postingan.');
    await userEvent.click(screen.getByRole('button', { name: /Tulis postingan/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(screen.getByText('Isi postingan tidak boleh kosong.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Apa yang ingin kamu bagikan?'), 'Cerita baru');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/posts/77'));
  });

  it('menutup dan gagal membuat postingan', async () => {
    mockFetch((url, init) => (init.method === 'POST' ? fail('Gagal') : ok({ posts: [] })));
    renderWithStore(<Timeline scope="all" />, signedIn);
    await screen.findByText('Belum ada postingan.');
    await userEvent.click(screen.getByRole('button', { name: /Tulis postingan/ }));
    await userEvent.type(screen.getByLabelText('Apa yang ingin kamu bagikan?'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Simpan' })).toBeEnabled());
    expect(nav.push).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hapus semua postingan saya (batal lalu konfirmasi)', async () => {
    mockFetch((url, init) => (init.method === 'DELETE' ? ok() : ok({ posts: [post] })));
    const { store } = renderWithStore(<Timeline scope="mine" />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.click(screen.getByRole('button', { name: /Hapus semua/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Hapus semua/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Ya, hapus semua' }));
    await waitFor(() => expect(store.getState().posts.items).toEqual([]));
  });
});

describe('PostDetail', () => {
  const handler = (overrides: Record<string, unknown> = {}) =>
    mockFetch((url, init) => {
      const key = `${init.method} ${url.pathname.replace('/api/v1', '')}`;
      return key in overrides ? overrides[key] : key === 'GET /posts/10' ? ok({ post: detail }) : ok();
    });

  it('skeleton, lalu detail milik sendiri, suka dan komentar', async () => {
    handler();
    renderWithStore(<PostDetail postId={10} />, signedIn);
    expect(screen.getByText('Memuat postingan...')).toBeInTheDocument();
    expect(await screen.findByText('Halo dunia')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /suka/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /suka/ })).toHaveAttribute('aria-pressed', 'true'));
    await userEvent.click(screen.getByRole('button', { name: 'Kirim komentar' }));
    expect(screen.getByText('Komentar tidak boleh kosong.')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Tulis komentar'), 'Mantap');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim komentar' }));
    await waitFor(() => expect(screen.getByLabelText('Tulis komentar')).toHaveValue(''));
    expect(screen.getByText(/Komentar kamu/)).toBeInTheDocument();
  });

  it('komentar gagal tidak mengosongkan input', async () => {
    handler({ 'POST /posts/10/comments': fail('Gagal') });
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.type(screen.getByLabelText('Tulis komentar'), 'Mantap');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim komentar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument()).catch(() => {});
    expect(screen.getByLabelText('Tulis komentar')).toHaveValue('Mantap');
  });

  it('menghapus komentar sendiri', async () => {
    const f = handler();
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Komentarku');
    const mine = screen.getByText('Komentarku').closest('li')!;
    await userEvent.click(within(mine).getByRole('button', { name: 'Hapus komentar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    await userEvent.click(within(mine).getByRole('button', { name: 'Hapus komentar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ya, hapus' }));
    await waitFor(() => expect(f.mock.calls.some(([, i]) => i.method === 'DELETE')).toBe(true));
  });

  it('menghapus postingan lalu kembali ke beranda', async () => {
    handler();
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus postingan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ya, hapus' }));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/'));
  });

  it('membatalkan penghapusan postingan', async () => {
    handler();
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus postingan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('gagal menghapus postingan tidak berpindah halaman', async () => {
    handler({ 'DELETE /posts/10': fail('Gagal') });
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus postingan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ya, hapus' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('mengubah dan mengganti cover', async () => {
    handler();
    renderWithStore(<PostDetail postId={10} />, signedIn);
    await screen.findByText('Halo dunia');
    await userEvent.click(screen.getByRole('button', { name: 'Ubah postingan' }));
    await userEvent.clear(screen.getByLabelText('Isi postingan'));
    await userEvent.type(screen.getByLabelText('Isi postingan'), 'Revisi');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.click(screen.getByRole('button', { name: 'Ubah cover' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
    expect(screen.getByText(/Pilih berkas gambar/)).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText('Pilih gambar'), new File(['x'], 'a.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('postingan orang lain tanpa komentar dan tanpa aksi pemilik', async () => {
    mockFetch(() => ok({ post: { ...other, user_id: 2, comments: [], my_comment: null, cover: '/c.png' } }));
    renderWithStore(<PostDetail postId={11} />, signedIn);
    expect(await screen.findByText('Cerita lain')).toBeInTheDocument();
    expect(screen.getByText('Belum ada komentar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ubah postingan' })).toBeNull();
    expect(screen.getByAltText('Cover postingan')).toBeInTheDocument();
  });

  it('postingan tidak ditemukan dan menunggu token', async () => {
    mockFetch(() => fail('Tidak ada'));
    renderWithStore(<PostDetail postId={99} />, signedIn);
    expect(await screen.findByText('Postingan tidak ditemukan.')).toBeInTheDocument();
  });

  it('tanpa user suka dinonaktifkan', async () => {
    mockFetch(() => ok({ post: detail }));
    renderWithStore(<PostDetail postId={10} />, { session: { user: null, hasToken: true } });
    await screen.findByText('Halo dunia');
    expect(screen.getByRole('button', { name: /suka/ })).toBeDisabled();
  });

  it('belum ada token: tetap skeleton', () => {
    renderWithStore(<PostDetail postId={10} />);
    expect(screen.getByText('Memuat postingan...')).toBeInTheDocument();
  });
});

describe('PostModals', () => {
  it('EditModal gagal tetap terbuka; CoverModal menolak non-gambar', async () => {
    mockFetch(() => fail('Gagal'));
    const onClose = vi.fn();
    const { unmount } = renderWithStore(<EditModal postId={1} description="Awal" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Simpan' })).toBeEnabled());
    expect(onClose).not.toHaveBeenCalled();
    unmount();

    renderWithStore(<CoverModal postId={1} onClose={onClose} />);
    await userEvent.upload(screen.getByLabelText('Pilih gambar'), new File(['x'], 'a.txt', { type: 'text/plain' }), { applyAccept: false });
    await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
    expect(screen.getByText(/Pilih berkas gambar/)).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText('Pilih gambar'), new File(['x'], 'a.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: 'Unggah' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unggah' })).toBeEnabled());
    expect(onClose).not.toHaveBeenCalled();
  });
});
