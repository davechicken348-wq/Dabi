import { NavLink } from 'react-router-dom';
import './MobileNavigation.css';

const navItems = [
  { to: '/findroom', label: 'Home', end: true, icon: 'home' },
  { to: '/findroom/explore', label: 'Explore', icon: 'explore' },
  { to: '/findroom/locations', label: 'Locations', icon: 'locations' },
  { to: '/findroom/map', label: 'Map', icon: 'map' },
  { to: '/findroom/rooms', label: 'Rooms', icon: 'rooms' },
  { to: '/findroom/saved', label: 'Saved', icon: 'saved' },
  { to: '/findroom/request', label: 'Request Room', icon: 'request' },
];

const iconPaths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5',
  explore: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  locations: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  map: 'M9 20 3 17V4l6-3 6 3 6-3v13l-6 3M3 17h18M9 4v6M15 4v6M9 13l6-3M15 13l-6-3',
  rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
  saved: 'M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z',
  request: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM7 8h10M7 12h7M7 16h4',
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
          aria-label={item.label}
          title={item.label}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
        >
          <MobileNavIcon name={item.icon} />
        </NavLink>
      ))}
    </nav>
  );
}
