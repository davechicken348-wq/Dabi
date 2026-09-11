import { Link } from 'react-router-dom';
import { Button } from '../../../shared/Button/Button';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-content animate-fade-in-up">
          <span className="hero-eyebrow">Student Accommodation, Reimagined</span>
          <h1 className="hero-title">
            Your next room is<br />
            closer than you think.
          </h1>
          <p className="hero-subtitle">
            Finding student accommodation shouldn't mean walking around town asking who has a room available.
            Dabi helps you discover rooms, explore hostels, understand prices and availability, and connect with the people behind them.
          </p>
          <div className="hero-actions">
            <Link to="/findroom">
              <Button size="lg" variant="primary">Find a Room →</Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">How Dabi Works</Button>
            </Link>
          </div>
        </div>
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-stack">
            <div className="hero-image-card hero-image-card-1" />
            <div className="hero-image-card hero-image-card-2" />
            <div className="hero-image-card hero-image-card-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
