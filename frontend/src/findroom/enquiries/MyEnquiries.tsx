import { useState, useEffect } from 'react';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { fetchEnquiries } from '../../services/enquiryService';
import type { Enquiry } from '../../types';
import './MyEnquiries.css';

const statusLabels: Record<Enquiry['status'], string> = {
  new: 'New',
  reviewing: 'Dabi reviewing',
  contacted: 'Owner contacted',
  resolved: 'Resolved',
};

const statusSteps: Enquiry['status'][] = ['new', 'reviewing', 'contacted', 'resolved'];

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEnquiries()
      .then((data) => {
        if (cancelled) return;
        setEnquiries(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <FindRoomShell>
        <div className="enquiries-page">
          <div className="enquiries-header">
            <div>
              <p className="enquiries-eyebrow">Your room search</p>
              <h1 className="enquiries-title">My enquiries</h1>
              <p className="enquiries-subtitle">Track how Dabi is helping you connect with accommodation.</p>
            </div>
          </div>
          <div className="enquiries-loading-panel"><span className="enquiries-loading-dot" /> Loading your enquiries…</div>
        </div>
      </FindRoomShell>
    );
  }

  if (enquiries.length === 0) {
    return (
      <FindRoomShell>
        <div className="enquiries-page">
          <div className="enquiries-header">
            <div>
              <p className="enquiries-eyebrow">Your room search</p>
              <h1 className="enquiries-title">My enquiries</h1>
              <p className="enquiries-subtitle">Track how Dabi is helping you connect with accommodation.</p>
            </div>
          </div>
          <EmptyState
            title="No enquiries yet."
            description="When you enquire about a room, it will appear here."
            actionLabel="Explore Rooms"
            actionTo="/findroom/explore"
            icon="📨"
          />
        </div>
      </FindRoomShell>
    );
  }

  return (
    <FindRoomShell>
      <div className="enquiries-page">
        <div className="enquiries-header">
          <div>
            <p className="enquiries-eyebrow">Your room search</p>
            <h1 className="enquiries-title">My enquiries</h1>
            <p className="enquiries-subtitle">Track how Dabi is helping you connect with accommodation.</p>
          </div>
          <span className="enquiries-note">Dabi connects you with the provider</span>
        </div>
        <div className="enquiries-summary" aria-label="Enquiry status summary">
          {statusSteps.map((status) => (
            <div className={`enquiry-summary-item enquiry-summary-${status}`} key={status}>
              <strong>{enquiries.filter((enquiry) => enquiry.status === status).length}</strong>
              <span>{statusLabels[status]}</span>
            </div>
          ))}
        </div>
        <div className="enquiries-list-heading">
          <h2>Recent enquiries</h2>
          <span>{enquiries.length} total</span>
        </div>
        <div className="enquiries-list">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="enquiry-card">
              <div className="enquiry-header">
                <div>
                  <h3 className="enquiry-room">{enquiry.roomName}</h3>
                  <p className="enquiry-hostel">{enquiry.hostelName}</p>
                </div>
                <span className={`enquiry-status enquiry-status-${enquiry.status}`}>{statusLabels[enquiry.status]}</span>
              </div>
              <p className="enquiry-date">
                Submitted {new Date(enquiry.submittedAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {enquiry.message && <p className="enquiry-message"><strong>Your note</strong> “{enquiry.message}”</p>}
              <div className="enquiry-progress">
                {statusSteps.map((step, index) => (
                  <div className="enquiry-progress-item" key={step}>
                    <div className={`enquiry-step ${statusSteps.indexOf(enquiry.status) >= index ? 'enquiry-step-active' : ''}`}>
                      <span>{index + 1}</span>{statusLabels[step]}
                    </div>
                    {index < statusSteps.length - 1 && <div className={`enquiry-step-line ${statusSteps.indexOf(enquiry.status) > index ? 'enquiry-step-line-active' : ''}`} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FindRoomShell>
  );
}
