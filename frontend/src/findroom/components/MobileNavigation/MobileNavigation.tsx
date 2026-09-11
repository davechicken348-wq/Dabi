import { NavLink } from 'react-router-dom';
import './MobileNavigation.css';

const navItems = [
  { to: '/findroom', label: 'Home', end: true },
  { to: '/findroom/explore', label: 'Explore' },
  { to: '/findroom/rooms', label: 'Rooms' },
  { to: '/findroom/enquiries', label: 'Enquiries' },
];

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
          <span className="mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
