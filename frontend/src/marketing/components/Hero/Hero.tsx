import { Link } from 'react-router-dom';
import { Button } from '../../../shared/Button/Button';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-content animate-fade-in-up">
          <h1 className="hero-title">
            Stop asking around.<br />
            Start finding rooms.
          </h1>
          <p className="hero-subtitle">
            Dabi brings verified rooms, real prices, and up-to-date availability into one place — so you can find the right student accommodation without the guesswork.
          </p>
          <div className="hero-actions">
            <Link to="/findroom">
              <Button size="lg" variant="primary">Find a Room →</Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">How Dabi works</Button>
            </Link>
          </div>
        </div>
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-stack">
            <div className="hero-image-card hero-image-card-1" />
            <div className="hero-image-card hero-image-card-2" />
            <div className="hero-image-card hero-image-card-3" />
            <div className="hero-badge" aria-hidden="true">
              <span className="hero-badge-dot" />
              <span>Rooms verified today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
