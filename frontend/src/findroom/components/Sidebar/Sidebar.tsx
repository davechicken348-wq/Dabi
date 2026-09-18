import { NavLink } from 'react-router-dom';
import { Logo } from '../../../shared/Logo/Logo';
import './Sidebar.css';

type SidebarIconName = 'home' | 'search' | 'location' | 'rooms' | 'saved' | 'help' | 'map';

type SidebarNavItem = { to: string; label: string; icon: SidebarIconName; end?: boolean };

const navGroups: SidebarNavItem[][] = [
  [
    { to: '/findroom', label: 'Home', icon: 'home', end: true },
    { to: '/findroom/explore', label: 'Explore', icon: 'search', end: false },
    { to: '/findroom/locations', label: 'Locations', icon: 'location', end: false },
  ],
  [
    { to: '/findroom/map', label: 'Map', icon: 'map', end: false },
    { to: '/findroom/rooms', label: 'Rooms', icon: 'rooms', end: false },
    { to: '/findroom/saved', label: 'Saved', icon: 'saved', end: false },
  ],
];

const bottomItems: SidebarNavItem[] = [
  { to: '/findroom/help', label: 'Help', icon: 'help' },
];

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const paths: Record<SidebarIconName, string> = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5',
    search: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
    location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
    saved: 'M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z',
    help: 'M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.1.9-1.8 1.3-1.8 2.7M12 17h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    map: 'M9 20 3 17V4l6-3 6 3 6-3v13l-6 3M3 17h18M9 4v6M15 4v6M9 13l6-3M15 13l-6-3',
  };

  return (
    <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function IconLink({ to, label, icon, end }: { to: string; label: string; icon: SidebarIconName; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar-icon-link ${isActive ? 'sidebar-icon-link-active' : ''}`}
      aria-label={label}
      title={label}
    >
      <SidebarIcon name={icon} />
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/findroom" className="sidebar-brand" aria-label="FindRoom Home">
          <Logo size="sm" variant="mark" />
        </NavLink>

        <div className="sidebar-nav-groups" aria-label="FindRoom navigation groups">
          {navGroups.map((group, index) => (
            <div className="sidebar-group" key={`group-${index}`}>
              {group.map((item) => (
                <IconLink key={item.to} {...item} />
              ))}
            </div>
          ))}
        </div>

      </div>

      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <IconLink key={item.to} {...item} />
        ))}
      </div>
    </aside>
  );
}
