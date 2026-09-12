import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconShare } from '../../../components/Icons/Icons';
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
            <p className="share-dialog-kicker">Share this room</p>
            <h3 className="share-dialog-title">Choose how you want to share</h3>
          </div>
          <button type="button" className="share-dialog-close" onClick={onClose} aria-label="Close share dialog">
            <IconShare size={18} />
          </button>
        </div>

        <div className="share-dialog-actions">
          {canUseNativeShare() && (
            <button type="button" className="share-dialog-option" onClick={handleNativeShare}>
              More ways to share
            </button>
          )}
          <button type="button" className="share-dialog-option" onClick={handleWhatsApp}>
            WhatsApp
          </button>
          {canCopyRoomLink() && (
            <button type="button" className="share-dialog-option" onClick={handleCopy}>
              Copy link
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
