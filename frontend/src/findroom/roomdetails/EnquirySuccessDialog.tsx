import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './EnquirySuccessDialog.css';

interface EnquirySuccessDialogProps {
  open: boolean;
  roomName: string;
  hostelName: string;
  onClose: () => void;
}

export function EnquirySuccessDialog({ open, roomName, hostelName, onClose }: EnquirySuccessDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="enquiry-success-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="enquiry-success-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-success-title"
        tabIndex={-1}
      >
        <button type="button" className="enquiry-success-close" onClick={onClose} aria-label="Close enquiry confirmation">×</button>
        <div className="enquiry-success-icon" aria-hidden="true">✓</div>
        <div>
          <p className="enquiry-success-kicker">Request received</p>
          <h2 id="enquiry-success-title">Your enquiry was sent.</h2>
          <p>Dabi has received your interest in the {roomName} at {hostelName}. We will be in touch with the next steps.</p>
        </div>
        <button type="button" className="enquiry-success-action" onClick={onClose}>Continue browsing</button>
      </div>
    </div>,
    document.body,
  );
}