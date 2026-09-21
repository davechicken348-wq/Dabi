import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DABI_AREA_OPTIONS, DABI_FACILITY_OPTIONS, DABI_ROOM_TYPE_OPTIONS } from '../../lib/constants';
import { DABI_COMMUNITY_LINK, DABI_WHATSAPP_URL, buildDabiRoomRequestMessage, openDabiWhatsApp } from '../../lib/dabiContact';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import './RequestHelp.css';

export default function RequestHelp() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    school: '',
    location: '',
    roomType: '',
    budget: '',
    moveInDate: '',
    preferences: [] as string[],
    notes: '',
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePreference = (preference: string) => {
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((item) => item !== preference)
        : [...prev.preferences, preference],
    }));
  };

  const addPreference = () => {
    const preference = facilityInput.trim();
    if (!preference) return;
    setForm((prev) => prev.preferences.includes(preference)
      ? prev
      : { ...prev, preferences: [...prev.preferences, preference] });
    setFacilityInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your full name and phone number so Dabi can contact you.');
      return;
    }

    const message = buildDabiRoomRequestMessage({
      name: form.name.trim(),
      phone: form.phone.trim(),
      school: form.school.trim() || undefined,
      location: form.location || undefined,
      roomType: form.roomType || undefined,
      budget: form.budget ? `GH₵${form.budget}` : undefined,
      moveInDate: form.moveInDate || undefined,
      preferences: form.preferences,
      notes: form.notes.trim() || undefined,
    });

    setSubmitting(true);
    const opened = openDabiWhatsApp(message);
    if (!opened) {
      window.location.href = `${DABI_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <FindRoomShell>
        <div className="request-help">
          <div className="request-success">
            <div className="request-success-icon" aria-hidden="true">🎉</div>
            <h1 className="request-success-title">Request received!</h1>
            <p className="request-success-text">
              We’ve got your room requirements. Dabi will check what is available and get back to you on WhatsApp.
            </p>
            <div className="request-success-summary">
              <div>
                <span>Name</span>
                <strong>{form.name}</strong>
              </div>
              <div>
                <span>WhatsApp</span>
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
              <a href={DABI_WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn btn-primary">💬 Chat with Dabi on WhatsApp</a>
              <Link to="/findroom/explore" className="btn btn-ghost">Browse Available Rooms</Link>
              <a href={DABI_COMMUNITY_LINK} target="_blank" rel="noreferrer" className="btn btn-ghost">💚 Join the Dabi Community</a>
            </div>
          </div>
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="request-help">
        <div className="request-welcome">
          <div className="request-header">
            <p className="request-eyebrow">Your room search, with backup</p>
            <h1 className="request-title">Tell Dabi what you need. We’ll help you find your place.</h1>
            <p className="request-subtitle">
              Give us a few clues about your ideal room and we’ll turn them into a shortlist worth seeing.
            </p>
            <div className="request-trust-row">
              <span><b>01</b> You share the details</span>
              <span><b>02</b> Dabi checks the options</span>
            </div>
          </div>
          <aside className="request-guide" aria-label="How Dabi helps">
            <span className="request-guide-sticker">Dabi is on it</span>
            <p className="request-guide-kicker">A little help goes a long way</p>
            <h2>Less scrolling. More “this could work.”</h2>
            <div className="request-guide-steps">
              <div><span>1</span><p><strong>Tell us your vibe</strong><small>Area, budget, room type and must-haves.</small></p></div>
              <div><span>2</span><p><strong>We look around</strong><small>Dabi checks the places that fit your brief.</small></p></div>
              <div><span>3</span><p><strong>You make the move</strong><small>We connect you with the next best step.</small></p></div>
            </div>
          </aside>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          <div className="request-form-heading">
            <div>
              <p className="request-form-kicker">Build your room brief</p>
              <h2>What would make a room feel right?</h2>
            </div>
            <span className="request-time">About 2 minutes</span>
          </div>
          {error && (
            <div className="request-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="request-form-row">
            <label className="request-field">
              <span>Name</span>
              <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="What should we call you?" required />
            </label>

            <label className="request-field">
              <span>WhatsApp number</span>
              <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="0500000000" required />
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>School / institution</span>
              <input type="text" value={form.school} onChange={(e) => updateField('school', e.target.value)} placeholder="Sunyani Technical University" />
            </label>

            <label className="request-field">
              <span>Preferred area</span>
              <input list="dabi-area-options" value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Type or choose an area" />
              <datalist id="dabi-area-options">
                {DABI_AREA_OPTIONS.map((area) => (
                  <option key={area} value={area} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>Budget</span>
              <input type="text" value={form.budget} onChange={(e) => updateField('budget', e.target.value)} placeholder="GH₵4,000" />
            </label>

            <label className="request-field">
              <span>When they need the room</span>
              <input type="text" value={form.moveInDate} onChange={(e) => updateField('moveInDate', e.target.value)} placeholder="October, next semester, etc." />
            </label>
          </div>

          <div className="request-form-row">
            <label className="request-field">
              <span>Room type</span>
              <input list="dabi-room-type-options" value={form.roomType} onChange={(e) => updateField('roomType', e.target.value)} placeholder="Type or choose a room type" />
              <datalist id="dabi-room-type-options">
                {DABI_ROOM_TYPE_OPTIONS.map((roomType) => (
                  <option key={roomType} value={roomType} />
                ))}
              </datalist>
            </label>

            <div className="request-field request-field-choices">
              <span>Facilities / preferences</span>
              <div className="request-choice-input">
                <input
                  type="text"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPreference();
                    }
                  }}
                  placeholder="Type a facility, then add it"
                />
                <button type="button" onClick={addPreference}>Add</button>
              </div>
              <small className="request-choice-hint">Choose a suggestion or add your own.</small>
              <div className="request-choice-list">
                {DABI_FACILITY_OPTIONS.map((option) => (
                  <label key={option} className={`request-choice-item ${form.preferences.includes(option) ? 'request-choice-item-selected' : ''}`}>
                    <input type="checkbox" checked={form.preferences.includes(option)} onChange={() => togglePreference(option)} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="request-field request-field-full">
            <span>Additional notes</span>
            <textarea rows={4} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Tell Dabi what kind of room or environment would make you feel at home..." />
          </label>

          <div className="request-actions-row">
            <button type="submit" className="btn btn-primary btn-lg request-submit" disabled={submitting}>
              {submitting && <span className="request-spinner" aria-hidden="true" />}
              <span>{submitting ? 'Opening WhatsApp…' : 'Start Your Request ↓'}</span>
            </button>
            <a href={DABI_WHATSAPP_URL} target="_blank" rel="noreferrer" className="request-chat-link">Prefer a chat? Talk to Dabi 💬</a>
          </div>

          <p className="request-reassurance">
            This is not a booking. You are simply letting Dabi know what you need, and we’ll help with the next step.
          </p>
        </form>
      </div>
    </FindRoomShell>
  );
}
