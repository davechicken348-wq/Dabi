import { NavLink } from 'react-router-dom';
import './MobileNavigation.css';

const navItems = [
  { to: '/findroom', label: 'Home', end: true },
  { to: '/findroom/explore', label: 'Explore' },
  { to: '/findroom/locations', label: 'Locations' },
  { to: '/findroom/map', label: 'Map' },
  { to: '/findroom/rooms', label: 'Rooms' },
  { to: '/findroom/saved', label: 'Saved' },
  { to: '/findroom/enquiries', label: 'Enquiries' },
];

const iconPaths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5',
  explore: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  locations: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  map: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z M9 4v13.5M15 6.5V20',
  rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
  saved: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  enquiries: 'M4 5.5h16v11H8l-4 3v-14Z M8 9h8M8 12h5',
};

function MobileNavIcon({ name }: { name: string }) {
  return (
    <svg className="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function MobileNavigation() {
  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
        >
          <MobileNavIcon name={item.label.toLowerCase()} />
        </NavLink>
      ))}
    </nav>
  );
}
