'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Field from '@/components/Field';
import Modal from '@/components/Modal';
import { useAppDispatch } from '@/lib/hooks';
import { createPost, editPost, setCover } from '@/store/posts';

function Actions({ busy, label, onClose }: { busy: boolean; label: string; onClose: () => void }) {
  return (
    <div className="mt-5 flex justify-end gap-3">
      <button type="button" onClick={onClose} className="btn btn-outline">
        Batal
      </button>
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? 'Menyimpan...' : label}
      </button>
    </div>
  );
}

interface TextModalProps {
  title: string;
  label: string;
  initial: string;
  onClose: () => void;
  onSave: (text: string) => Promise<boolean>;
}

function TextModal({ title, label, initial, onClose, onSave }: TextModalProps) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError('Isi postingan tidak boleh kosong.');
      return;
    }
    setError(undefined);
    setBusy(true);
    const ok = await onSave(text.trim());
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <Field
          id="post-text-input"
          label={label}
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
          error={error}
        />
        <Actions busy={busy} label="Simpan" onClose={onClose} />
      </form>
    </Modal>
  );
}

export function ComposeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (postId: number) => void;
}) {
  const dispatch = useAppDispatch();
  return (
    <TextModal
      title="Tulis postingan"
      label="Apa yang ingin kamu bagikan?"
      initial=""
      onClose={onClose}
      onSave={async (text) => {
        const result = await dispatch(createPost(text));
        if (!createPost.fulfilled.match(result)) return false;
        onCreated(result.payload);
        return true;
      }}
    />
  );
}

export function EditModal({
  postId,
  description,
  onClose,
}: {
  postId: number;
  description: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  return (
    <TextModal
      title="Ubah postingan"
      label="Isi postingan"
      initial={description}
      onClose={onClose}
      onSave={async (text) =>
        editPost.fulfilled.match(await dispatch(editPost({ id: postId, description: text })))
      }
    />
  );
}

export function CoverModal({ postId, onClose }: { postId: number; onClose: () => void }) {
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
    const result = await dispatch(setCover({ id: postId, file }));
    setBusy(false);
    if (setCover.fulfilled.match(result)) onClose();
  }

  return (
    <Modal title="Ubah cover" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <Field
          id="cover-input"
          label="Pilih gambar"
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files![0])}
          error={error}
        />
        <Actions busy={busy} label="Unggah" onClose={onClose} />
      </form>
    </Modal>
  );
}
