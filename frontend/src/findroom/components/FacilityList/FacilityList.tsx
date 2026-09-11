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
          {facility}
        </li>
      ))}
    </ul>
  );
}
