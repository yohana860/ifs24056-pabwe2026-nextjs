'use client';

import Modal from '@/components/Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Batal
        </button>
        <button type="button" onClick={onConfirm} className="btn btn-danger">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
