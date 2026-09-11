import { Link } from 'react-router-dom';
import './WelcomePage.css';

export default function WelcomePage() {
  return (
    <div className="welcome-page-shell">
      <div className="welcome-page-card">
        <div className="welcome-brand">
          <div className="welcome-logo">D</div>
          <span className="welcome-brand-name">Dabi</span>
        </div>

        <p className="welcome-kicker">Welcome</p>
        <h1>Finding your next room should feel easy.</h1>
        <p className="welcome-copy">
          We’re preparing your student housing journey and getting you to the best places to live.
        </p>

        <Link to="/marketing" className="welcome-cta">
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
