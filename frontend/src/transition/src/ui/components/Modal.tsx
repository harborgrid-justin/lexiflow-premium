/**
 * Modal - Modal dialog component
 */

import { type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal__header">
            <h2>{title}</h2>
            <button onClick={onClose}>&times;</button>
          </div>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
