import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconAlert, IconCheck, IconClose, IconVerified } from './Icons';

export function Modal({ open, onClose, title, children, width = 480 }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" style={{ ['--w' as any]: `${width}px` }}>
        <div className="modal__head">
          <div className="h3">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose size={16} /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

type Toast = { id: number; message: string; kind: 'success' | 'error' };
const ToastCtx = createContext<(message: string, kind?: 'success' | 'error') => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-3), { id, message, kind }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), kind === 'error' ? 8000 : 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {createPortal(
        <div className="toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.kind === 'error' ? 'toast--error' : ''}`}>
              {t.kind === 'error' ? <IconAlert size={18} /> : <IconCheck size={18} />}<span>{t.message}</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export const Skeleton = ({ h = 16, r }: { h?: number; r?: number }) => <div className="skeleton" style={{ height: h, borderRadius: r }} />;
export const EmptyState = ({ title, action }: { title: string; action?: ReactNode }) => <div className="empty"><div>{title}</div>{action}</div>;
export function Badge({ official, verified, size = 16 }: { official?: boolean; verified?: boolean; size?: number }) {
  if (!official && !verified) return null;
  return <span title={official ? 'Official' : 'Verified'} style={{ display: 'inline-flex' }}><IconVerified size={size} official={official} /></span>;
}
