import { Link } from 'react-router-dom';
import { Logo } from '../../shared/Logo/Logo';
import bg from '../../assets/images/pexels-250d-11310849.jpg';
import bgDesktop from '../../assets/images/graffiti1.avif';
import './WelcomePage.css';

export default function WelcomePage() {
  return (
    <main
      className="welcome-shell"
      style={{
        backgroundImage: `url(${bg})`,
        ['--bg-desktop' as string]: `url(${bgDesktop})`,
      }}
    >
      <div className="welcome-overlay" aria-hidden="true" />

      <section className="welcome-body" aria-label="Welcome to Dabi">

        <div className="welcome-logo">
          <Logo size="lg" />
        </div>

        <div className="welcome-text">
          <p className="welcome-kicker">Welcome home</p>
          <h1 className="welcome-headline">
            Find a room that<br />feels right.
          </h1>
          <p className="welcome-sub">
            Verified student accommodation near your campus —
            real prices, honest photos, and someone to help you every step of the way.
          </p>
        </div>

        <div className="welcome-actions">
          <Link className="welcome-cta-primary" to="/marketing">
            Explore Dabi
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
          <Link className="welcome-cta-ghost" to="/findroom">
            Browse rooms
          </Link>
        </div>

        <p className="welcome-reassurance">Free to use · No sign-up needed to browse</p>

      </section>
    </main>
  );
}
