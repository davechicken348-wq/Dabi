import type { ContactDetails } from '../../services/contactUnlockService';
import './UnlockSuccess.css';

interface Props {
  contact: ContactDetails;
  onClose: () => void;
}

export function UnlockSuccess({ contact, onClose }: Props) {
  const phoneClean = contact.ownerPhone.replace(/\s+/g, '');
  const waUrl = `https://wa.me/${phoneClean.startsWith('+') ? phoneClean.slice(1) : phoneClean}`;
  const telUrl = `tel:${phoneClean.startsWith('+') ? phoneClean : `+${phoneClean}`}`;

  const copyPhone = () => {
    navigator.clipboard.writeText(contact.ownerPhone).catch(() => undefined);
  };

  return (
    <div className="unlock-success-overlay" role="dialog" aria-modal="true" aria-labelledby="unlock-success-title">
      <div className="unlock-success-panel">
        <button className="unlock-success-close" type="button" onClick={onClose} aria-label="Close">✕</button>

        <div className="unlock-success-hero">
          <span className="unlock-success-emoji" aria-hidden="true">🎉</span>
          <h2 id="unlock-success-title">You're all set!</h2>
          <p>The contact &amp; viewing details are now unlocked.</p>
        </div>

        <div className="unlock-success-card">
          <div className="unlock-success-field">
            <span className="unlock-success-label">Owner</span>
            <span className="unlock-success-value">{contact.ownerName}</span>
          </div>
          <div className="unlock-success-field">
            <span className="unlock-success-label">Phone</span>
            <span className="unlock-success-value">{contact.ownerPhone}</span>
          </div>
          {contact.viewingHours && (
            <div className="unlock-success-field">
              <span className="unlock-success-label">Viewing hours</span>
              <span className="unlock-success-value">🕐 {contact.viewingHours}</span>
            </div>
          )}
          {contact.landmark && (
            <div className="unlock-success-field">
              <span className="unlock-success-label">Landmark</span>
              <span className="unlock-success-value">📍 {contact.landmark}</span>
            </div>
          )}
          {contact.notes && (
            <div className="unlock-success-field">
              <span className="unlock-success-label">Notes</span>
              <span className="unlock-success-value">{contact.notes}</span>
            </div>
          )}
        </div>

        <div className="unlock-success-actions">
          <a className="unlock-success-btn unlock-success-btn-call" href={telUrl}>
            <span aria-hidden="true">📞</span> Call Owner
          </a>
          <a className="unlock-success-btn unlock-success-btn-wa" href={waUrl} target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">💬</span> WhatsApp
          </a>
          <button className="unlock-success-btn unlock-success-btn-copy" type="button" onClick={copyPhone}>
            <span aria-hidden="true">📋</span> Copy Number
          </button>
        </div>

        <p className="unlock-success-note">
          You can return to this room anytime to view these details again — no need to pay again.
        </p>
      </div>
    </div>
  );
}
