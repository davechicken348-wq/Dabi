import { NavLink } from 'react-router-dom';
import './MobileNavigation.css';

const navItems = [
  { to: '/findroom', label: 'Home', end: true, icon: 'home' },
  { to: '/findroom/explore', label: 'Explore', icon: 'explore' },
  { to: '/findroom/locations', label: 'Locations', icon: 'locations' },
  { to: '/findroom/rooms', label: 'Rooms', icon: 'rooms' },
  { to: '/findroom/saved', label: 'Saved', icon: 'saved' },
];

const iconPaths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5',
  explore: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  locations: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
  saved: 'M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z',
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
          <MobileNavIcon name={item.icon} />
        </NavLink>
      ))}
    </nav>
  );
}
