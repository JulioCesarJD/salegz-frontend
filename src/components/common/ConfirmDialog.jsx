// components/common/ConfirmDialog.jsx
import React from 'react';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', cancelText = 'Cancelar' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className="btn-danger flex-1" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}