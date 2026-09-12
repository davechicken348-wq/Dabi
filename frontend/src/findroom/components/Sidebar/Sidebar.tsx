import { NavLink } from 'react-router-dom';
import { Logo } from '../../../shared/Logo/Logo';
import './Sidebar.css';

const navGroups = [
  {
    label: 'Discover',
    items: [
      { to: '/findroom', label: 'Home', icon: 'home' as const, end: true },
      { to: '/findroom/explore', label: 'Explore', icon: 'search' as const, end: false },
      { to: '/findroom/locations', label: 'Locations', icon: 'location' as const, end: false },
      { to: '/findroom/map', label: 'Map', icon: 'map' as const, end: false },
      { to: '/findroom/rooms', label: 'Rooms', icon: 'rooms' as const, end: false },
    ],
  },
  {
    label: 'Your activity',
    items: [
      { to: '/findroom/saved', label: 'Saved rooms', icon: 'saved' as const, end: false },
      { to: '/findroom/enquiries', label: 'My enquiries', icon: 'enquiries' as const, end: false },
    ],
  },
];

const bottomNavItems = [
  { to: '/findroom/help', label: 'Help' },
  { to: '/findroom/request', label: 'Request a room' },
];

type SidebarIconName = 'home' | 'search' | 'location' | 'map' | 'rooms' | 'saved' | 'enquiries' | 'help';

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const paths: Record<SidebarIconName, string> = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5',
    search: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
    location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    map: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z M9 4v13.5M15 6.5V20',
    rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
    saved: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    enquiries: 'M4 5.5h16v11H8l-4 3v-14Z M8 9h8M8 12h5',
    help: 'M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1.9-1.8 1.3-1.8 2.7M12 17h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  };

  return (
    <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/findroom" className="sidebar-brand">
          <Logo size="md" />
        </NavLink>
        <nav className="sidebar-nav" aria-label="FindRoom navigation">
          {navGroups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <SidebarIcon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link sidebar-link-ghost ${isActive ? 'sidebar-link-active' : ''}`}
          >
            <SidebarIcon name="help" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
