import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import './FindRoomHome.css';

type DestinationIconName = 'search' | 'map' | 'rooms' | 'location' | 'enquiries';

const destinations: Array<{
  to: string;
  label: string;
  description: string;
  icon: DestinationIconName;
  featured?: boolean;
}> = [
  { to: '/findroom/explore', label: 'Explore rooms', description: 'Browse room options and compare what is available.', icon: 'search', featured: true },
  { to: '/findroom/map', label: 'Open the map', description: 'Discover hostels by area and see where they are located.', icon: 'map' },
  { to: '/findroom/rooms', label: 'View all rooms', description: 'See every listed room option in one place.', icon: 'rooms' },
  { to: '/findroom/locations', label: 'Browse locations', description: 'Start with a neighbourhood and find places nearby.', icon: 'location' },
  { to: '/findroom/enquiries', label: 'My enquiries', description: 'Keep track of rooms you have asked about.', icon: 'enquiries' },
];

function DestinationIcon({ name }: { name: DestinationIconName }) {
  const paths: Record<DestinationIconName, string> = {
    search: 'm20 20-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
    map: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z M9 4v13.5M15 6.5V20',
    rooms: 'M4 20V9l8-6 8 6v11M8 20v-5h8v5M9 10h.01M15 10h.01',
    location: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    enquiries: 'M4 5.5h16v11H8l-4 3v-14Z M8 9h8M8 12h5',
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

export default function FindRoomHome() {
  return (
    <FindRoomShell>
      <div className="findroom-home">
        <section className="findroom-welcome" aria-labelledby="findroom-welcome-title">
          <p className="findroom-welcome-eyebrow">FindRoom</p>
          <h1 id="findroom-welcome-title" className="findroom-home-title">Welcome to a clearer way to find a room.</h1>
          <p className="findroom-home-subtitle">Take your time, explore the areas that interest you, and find accommodation that fits your plans.</p>
        </section>

        <section className="findroom-destinations" aria-labelledby="findroom-destinations-title">
          <div className="findroom-destinations-heading">
            <div>
              <p className="findroom-welcome-eyebrow">Start here</p>
              <h2 id="findroom-destinations-title">Where would you like to go?</h2>
            </div>
            <p>Everything you need is one step away.</p>
          </div>
          <div className="findroom-destination-grid">
            {destinations.map((destination) => (
              <Link key={destination.to} to={destination.to} className={`findroom-destination ${destination.featured ? 'findroom-destination-featured' : ''}`}>
                <span className="findroom-destination-icon"><DestinationIcon name={destination.icon} /></span>
                <span className="findroom-destination-copy">
                  <strong>{destination.label}</strong>
                  <span>{destination.description}</span>
                </span>
                <span className="findroom-destination-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </FindRoomShell>
  );
}
