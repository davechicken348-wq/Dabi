import { useState } from 'react';
import { formatGhanaCedi } from '../../lib/pricing';
import { formatPricePeriod } from '../../lib/utils';
import type { RoomOption } from '../../types';
import './UnlockCheckout.css';

interface Props {
  room: RoomOption;
  unlockFee: number;
  currency: string;
  onPay: (email: string) => Promise<void>;
  onCancel: () => void;
}

export function UnlockCheckout({ room, unlockFee, currency, onPay, onCancel }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await onPay(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="unlock-checkout-overlay" role="dialog" aria-modal="true" aria-labelledby="unlock-checkout-title">
      <div className="unlock-checkout-panel">
        <button className="unlock-checkout-close" type="button" onClick={onCancel} aria-label="Close">✕</button>

        <div className="unlock-checkout-header">
          <span className="unlock-checkout-icon" aria-hidden="true">🔓</span>
          <h2 id="unlock-checkout-title">Unlock Contact &amp; Viewing Details</h2>
          <p>You're one step away from getting the information you need to contact the owner and arrange a viewing.</p>
        </div>

        <div className="unlock-checkout-section">
          <h3>What you'll unlock</h3>
          <ul className="unlock-checkout-perks" aria-label="What you get">
            <li><span aria-hidden="true">✓</span> Owner contact</li>
            <li><span aria-hidden="true">✓</span> Viewing details</li>
            <li><span aria-hidden="true">✓</span> Contact instructions</li>
            <li><span aria-hidden="true">✓</span> Directions &amp; landmark info</li>
          </ul>
        </div>

        <div className="unlock-checkout-section">
          <h3>Room</h3>
          <div className="unlock-checkout-room">
            <div><span aria-hidden="true">🏡</span> {room.hostelName}</div>
            <div><span aria-hidden="true">🛏️</span> {room.name}</div>
            <div><span aria-hidden="true">💰</span> {formatGhanaCedi(room.pricePerYear)} / {formatPricePeriod(room.pricingPeriod)}</div>
            {room.hostelLocation && <div><span aria-hidden="true">📍</span> {room.hostelLocation}</div>}
          </div>
        </div>

        <div className="unlock-checkout-section unlock-checkout-fee-row">
          <h3>Unlock fee</h3>
          <span className="unlock-checkout-fee">{currency === 'GHS' ? 'GH₵' : currency}{unlockFee}</span>
        </div>

        <p className="unlock-checkout-disclaimer">
          <strong>This payment gives you access to the contact and viewing details. It does not reserve the room.</strong>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="unlock-checkout-email-label">
            <span>Your email <em>(for payment receipt &amp; unlock recovery)</em></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          {error && <p className="unlock-checkout-error" role="alert">{error}</p>}
          <button className="unlock-checkout-pay-btn" type="submit" disabled={submitting}>
            {submitting ? 'Redirecting to payment…' : `Pay GH₵${unlockFee} & Unlock`}
          </button>
        </form>

        <p className="unlock-checkout-secure">
          <span aria-hidden="true">🔒</span> Secure payment via Paystack
        </p>
      </div>
    </div>
  );
}
