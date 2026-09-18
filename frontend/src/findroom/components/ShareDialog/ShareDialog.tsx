import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { canCopyRoomLink, canUseNativeShare, copyRoomLink, openWhatsAppShare } from '../../../lib/sharing';
import './ShareDialog.css';

interface ShareDialogProps {
  open: boolean;
  title: string;
  shareText: string;
  shareUrl: string;
  onClose: () => void;
}

export function ShareDialog({ open, title, shareText, shareUrl, onClose }: ShareDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const handleNativeShare = async () => {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share({ title: `${title} | Dabi`, text: shareText, url: shareUrl });
      onClose();
    } catch {
      // aborted
    }
  };

  const handleWhatsApp = () => {
    const opened = openWhatsAppShare(shareText);
    if (opened) onClose();
  };

  const handleCopy = async () => {
    const copied = await copyRoomLink(shareUrl);
    if (copied) onClose();
  };

  return createPortal(
    <div className="share-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Share this room"
        onClick={(event) => event.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="share-dialog-header">
          <div>
            <h3 className="share-dialog-title">Share</h3>
          </div>
          <button type="button" className="share-dialog-close" onClick={onClose} aria-label="Close share dialog">×</button>
        </div>

        <div className="share-dialog-tabs" role="group" aria-label="Share options">
          {canUseNativeShare() && (
            <button type="button" className="share-dialog-tab" onClick={handleNativeShare}>More ways</button>
          )}
          <button type="button" className="share-dialog-tab" onClick={handleWhatsApp}>WhatsApp</button>
          {canCopyRoomLink() && (
            <button type="button" className="share-dialog-tab" onClick={handleCopy}>Copy link</button>
          )}
        </div>

        <p className="share-dialog-description">Share this room with someone who is looking for a place to stay.</p>

        <div className="share-dialog-access">
          <div className="share-dialog-access-heading">
            <span className="share-dialog-access-icon" aria-hidden="true">↗</span>
            <span><strong>Room link</strong><small>Anyone with the link can view this room</small></span>
          </div>
          <div className="share-dialog-link-row">
            <input value={shareUrl} readOnly aria-label="Room share link" />
            {canCopyRoomLink() && <button type="button" onClick={handleCopy}>Copy link</button>}
          </div>
        </div>

        <div className="share-dialog-actions">
          <button type="button" className="share-dialog-done" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
