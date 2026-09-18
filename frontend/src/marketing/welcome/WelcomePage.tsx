import { Link } from 'react-router-dom';
import './WelcomePage.css';

export default function WelcomePage() {
  return (
    <main className="welcome-page-shell">
      <section className="welcome-page-hero" aria-label="Welcome to Dabi">
        <div className="welcome-brand-row">
          <span className="welcome-brand-mark">✦</span>
          <span className="welcome-brand-name" aria-label="Dabi">
            <span className="welcome-brand-dab">Dab</span>
            <span className="welcome-brand-i">i</span>
          </span>
        </div>

        <p className="welcome-kicker">Welcome home</p>
        <h1>
          <span className="welcome-hash">#</span>
          Your next great room starts here.
        </h1>
        <p className="welcome-copy">
          Discover cosy, verified places to stay near campus — with real options,
          easy comparisons, and a little more peace of mind.
        </p>

        <div className="welcome-actions">
          <Link className="welcome-primary-cta" to="/marketing">Explore the homepage</Link>
        </div>
      </section>
    </main>
  );
}
