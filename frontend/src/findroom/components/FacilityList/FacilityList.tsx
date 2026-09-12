import { FACILITY_EMOJIS } from '../../../lib/constants';
import './FacilityList.css';

interface FacilityListProps {
  facilities: string[];
}

export function FacilityList({ facilities }: FacilityListProps) {
  if (!facilities.length) return null;
  return (
    <ul className="facility-list">
      {facilities.map((facility) => (
        <li key={facility} className="facility-item">
          <span className="facility-check" aria-hidden="true">✓</span>
          <span aria-hidden="true">{FACILITY_EMOJIS[facility] ? `${FACILITY_EMOJIS[facility]} ` : ''}</span>
          {facility}
        </li>
      ))}
    </ul>
  );
}
