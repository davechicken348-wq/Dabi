import { useCallback, useEffect, useState } from 'react';
import { fetchContactUnlocks } from '../../services/api';
import styles from './ContactUnlocks.module.css';

interface UnlockRecord {
  id: string;
  studentRef: string;
  roomOfferingId: string;
  amount: number;
  currency: string;
  provider: string;
  reference: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  roomType?: string;
  hostelName?: string;
  hostelLocation?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Paid: 'statusPaid',
  Pending: 'statusPending',
  Failed: 'statusFailed',
  Refunded: 'statusRefunded',
};

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function fmt(iso?: string) {
  if (!iso) return '—';
  return dateFmt.format(new Date(iso));
}

type Filter = 'All' | 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export default function ContactUnlocks() {
  const [records, setRecords] = useState<UnlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchContactUnlocks()
      .then((data) => { setRecords(data); setLoading(false); })
      .catch(() => { setError('Failed to load contact unlocks.'); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.reference.toLowerCase().includes(q) ||
        r.hostelName?.toLowerCase().includes(q) ||
        r.roomType?.toLowerCase().includes(q) ||
        r.studentRef.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts: Record<Filter, number> = {
    All: records.length,
    Paid: records.filter((r) => r.status === 'Paid').length,
    Pending: records.filter((r) => r.status === 'Pending').length,
    Failed: records.filter((r) => r.status === 'Failed').length,
    Refunded: records.filter((r) => r.status === 'Refunded').length,
  };

  const totalRevenue = records
    .filter((r) => r.status === 'Paid')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Contact Unlocks</h1>
          <p className={styles.sub}>Students who paid to unlock owner contact &amp; viewing details.</p>
        </div>
        <div className={styles.revenueChip}>
          <span className={styles.revenueLabel}>Total revenue</span>
          <span className={styles.revenueValue}>GH₵{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(['All', 'Paid', 'Pending', 'Failed', 'Refunded'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.tab} ${filter === f ? styles.tabActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className={styles.tabCount}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          type="search"
          placeholder="Search by reference, hostel, room…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search unlocks"
        />
      </div>

      {loading && <div className={styles.loadBar} aria-label="Loading" />}

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student ref</th>
                <th>Room</th>
                <th>Hostel</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Created</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    {search || filter !== 'All' ? 'No records match your filter.' : 'No contact unlocks yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.monoCell} title={r.studentRef}>{r.studentRef.slice(0, 20)}…</td>
                    <td>{r.roomType ?? '—'}</td>
                    <td>
                      <span className={styles.hostelName}>{r.hostelName ?? '—'}</span>
                      {r.hostelLocation && <span className={styles.hostelLoc}>{r.hostelLocation}</span>}
                    </td>
                    <td className={styles.amountCell}>
                      {r.currency === 'GHS' ? 'GH₵' : r.currency}{r.amount}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[STATUS_COLORS[r.status] ?? 'statusPending']}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className={styles.monoCell} title={r.reference}>{r.reference.slice(0, 28)}…</td>
                    <td className={styles.dateCell}>{fmt(r.createdAt)}</td>
                    <td className={styles.dateCell}>{fmt(r.paidAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
