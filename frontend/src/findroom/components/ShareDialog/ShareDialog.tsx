import { useEffect, useRef, useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const handleNativeShare = async () => {
    if (!canUseNativeShare()) return;
    try {
      await navigator.share({ title: `${title} | Dabi`, text: shareText, url: shareUrl });
      onClose();
    } catch { /* aborted */ }
  };

  const handleWhatsApp = () => {
    openWhatsAppShare(shareText);
  };

  const handleCopy = async () => {
    const ok = await copyRoomLink(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return createPortal(
    <div className="sd-backdrop" onClick={onClose} role="presentation">
      <div
        className="sd"
        role="dialog"
        aria-modal="true"
        aria-label="Share this room"
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="sd-header">
          <h3 className="sd-title">Share this room</h3>
          <button type="button" className="sd-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Room preview */}
        <div className="sd-preview">
          <div className="sd-preview-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="sd-preview-text">
            <p className="sd-preview-title">{title}</p>
            <p className="sd-preview-url">{shareUrl}</p>
          </div>
        </div>

        {/* Share channels */}
        <div className="sd-channels">
          <button type="button" className="sd-channel" onClick={handleWhatsApp}>
            <span className="sd-channel-icon sd-channel-icon--whatsapp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </span>
            <span>WhatsApp</span>
          </button>

          {canUseNativeShare() && (
            <button type="button" className="sd-channel" onClick={handleNativeShare}>
              <span className="sd-channel-icon sd-channel-icon--more">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </span>
              <span>More</span>
            </button>
          )}
        </div>

        {/* Copy link row */}
        {canCopyRoomLink() && (
          <div className="sd-copy-row">
            <div className="sd-copy-url">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <span>{shareUrl}</span>
            </div>
            <button
              type="button"
              className={`sd-copy-btn${copied ? ' sd-copy-btn--copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied
                </>
              ) : 'Copy link'}
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body,
  );
}
