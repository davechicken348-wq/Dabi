import { useState } from 'react';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { submitRoomRequest } from '../../services/enquiryService';
import { LOCATIONS, OCCUPANCY_OPTIONS } from '../../lib/constants';
import './RequestHelp.css';

export default function RequestHelp() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    school: '',
    location: '',
    roomType: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    message: '',
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your full name and phone number so Dabi can contact you.');
      return;
    }

    try {
      setSubmitting(true);
      await submitRoomRequest({
        studentName: form.name.trim(),
        phone: form.phone.trim(),
        school: form.school.trim() || undefined,
        location: form.location || undefined,
        roomType: form.roomType || undefined,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        moveInDate: form.moveInDate || undefined,
        message: form.message.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or contact Dabi directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FindRoomShell>
        <div className="request-help">
          <div className="request-success">
            <div className="request-success-icon" aria-hidden="true">😌</div>
            <h1 className="request-success-title">You can relax now.</h1>
            <p className="request-success-text">
              Dabi has received your request. We will look for rooms that match what you need and reach out when we find something.
            </p>
            <div className="request-success-summary">
              <div>
                <span>Name</span>
                <strong>{form.name}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{form.phone}</strong>
              </div>
              {form.location && (
                <div>
                  <span>Preferred area</span>
                  <strong>{form.location}</strong>
                </div>
              )}
              {form.roomType && (
                <div>
                  <span>Room type</span>
                  <strong>{form.roomType}</strong>
                </div>
              )}
            </div>
            <div className="request-success-actions">
              <a href="/findroom/explore" className="btn btn-primary">Keep exploring</a>
              <a href="/findroom" className="btn btn-ghost">Back to home</a>
            </div>
          </div>
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="request-help">
        <div className="request-header">
          <p className="request-eyebrow">Room request</p>
          <h1 className="request-title">Let Dabi help you find a room.</h1>
          <p className="request-subtitle">
            Tell us what you are looking for and we will keep an eye out for you. No exact match? No problem — we will know what to look for.
          </p>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          {error && (
            <div className="request-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="request-form-row">
            <label className="request-field">
              <span>Full name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="What should we call you?"
                required
              />
            </label>

            <label className="request-field">
              <span>Phone number</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="024 XXX XXXX"
                required
              />
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>School</span>
              <input
                type="text"
                value={form.school}
                onChange={(e) => update('school', e.target.value)}
                placeholder="e.g. Sunyani Technical University"
              />
            </label>

            <label className="request-field">
              <span>Preferred area</span>
              <select
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              >
                <option value="">Any area</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>Room type</span>
              <select
                value={form.roomType}
                onChange={(e) => update('roomType', e.target.value)}
              >
                <option value="">Any room type</option>
                {OCCUPANCY_OPTIONS.map((n) => (
                  <option key={n} value={`${n}-in-1`}>{n}-in-1</option>
                ))}
                <option value="Self-contained">Self-contained</option>
              </select>
            </label>

            <label className="request-field">
              <span>When do you need it?</span>
              <input
                type="date"
                value={form.moveInDate}
                onChange={(e) => update('moveInDate', e.target.value)}
              />
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>Minimum budget (GH₵)</span>
              <input
                type="number"
                min="0"
                value={form.budgetMin}
                onChange={(e) => update('budgetMin', e.target.value)}
                placeholder="e.g. 1500"
              />
            </label>

            <label className="request-field">
              <span>Maximum budget (GH₵)</span>
              <input
                type="number"
                min="0"
                value={form.budgetMax}
                onChange={(e) => update('budgetMax', e.target.value)}
                placeholder="e.g. 3000"
              />
            </label>
          </div>

          <label className="request-field request-field-full">
            <span>Anything else we should know?</span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="e.g. I need a room with a private washroom near campus..."
            />
          </label>

          <button type="submit" className="btn btn-primary btn-lg request-submit" disabled={submitting}>
            {submitting && <span className="request-spinner" aria-hidden="true" />}
            <span>{submitting ? 'Sending to Dabi…' : 'Help me find a room'}</span>
          </button>

          <p className="request-reassurance">
            This is not a booking. You are simply letting Dabi know what you need, and we will help with the next step.
          </p>
        </form>
      </div>
    </FindRoomShell>
  );
}
