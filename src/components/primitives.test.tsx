import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import Field from '@/components/Field';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import PageHeading from '@/components/PageHeading';
import Providers from '@/components/Providers';
import Toast from '@/components/Toast';
import { notify } from '@/store/notice';
import { renderWithStore } from '@/testUtils';

describe('Avatar', () => {
  it('menampilkan foto atau inisial', () => {
    const { container, rerender } = render(<Avatar name="yobez" photo="/p.png" size={40} />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://open-api.delcom.org/p.png');
    rerender(<Avatar name=" yobez" photo={null} size={40} />);
    expect(container).toHaveTextContent('Y');
  });
});

describe('Icon & PageHeading', () => {
  it('merender svg terisi/kosong dan judul', () => {
    const { container, rerender } = render(<Icon name="heart" filled />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
    rerender(<Icon name="heart" />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
    render(<PageHeading title="Judul" subtitle="Sub" />);
    expect(screen.getByRole('heading', { name: 'Judul' })).toBeInTheDocument();
  });
});

describe('Field', () => {
  it('input, textarea, dan pesan galat', () => {
    const { rerender } = render(<Field id="a" label="Nama" defaultValue="x" />);
    expect(screen.getByLabelText('Nama').tagName).toBe('INPUT');
    expect(screen.getByLabelText('Nama')).not.toHaveAttribute('aria-invalid');
    rerender(<Field id="a" label="Nama" rows={3} error="Salah" />);
    expect(screen.getByLabelText('Nama').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Nama')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Salah');
  });
});

describe('Modal', () => {
  it('fokus, Escape, klik latar, dan kembalikan fokus', async () => {
    const onClose = vi.fn();
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { unmount } = render(<Modal title="Judul" onClose={onClose}><p>isi</p></Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Judul' });
    expect(dialog).toHaveFocus();
    fireEvent.mouseDown(screen.getByText('isi'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.mouseDown(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(2);
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});

describe('ConfirmDialog', () => {
  it('memanggil konfirmasi dan batal', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="T" message="M" confirmLabel="Ya" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ya' }));
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('Toast', () => {
  it('menampilkan, menutup manual, dan menutup otomatis', () => {
    vi.useFakeTimers();
    const { store } = renderWithStore(<Toast />);
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => { store.dispatch(notify({ kind: 'error', text: 'Gagal' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal');
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => { store.dispatch(notify({ kind: 'success', text: 'Sukses' })); });
    expect(screen.getByRole('status')).toHaveTextContent('Sukses');
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('Providers', () => {
  it('membungkus anak dengan store dan toast', () => {
    render(<Providers><p>anak</p></Providers>);
    expect(screen.getByText('anak')).toBeInTheDocument();
  });
});
