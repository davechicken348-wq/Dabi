import { Link } from 'react-router-dom';
import motelBg from '../../../assets/images/graffiti2.avif';
import isometricIllustration from '../../../assets/hostel-bedroom-isometric-illustration/23206.avif';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero-section" style={{ backgroundImage: `url(${motelBg})` }}>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-inner">

        {/* Left: content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Find your room.<br />
            Skip the guesswork.
          </h1>
          <p className="hero-subtitle">
            Dabi brings verified rooms, real prices, and up-to-date availability into one place — so you can find the right student accommodation without asking around.
          </p>

          <div className="hero-actions">
            <Link to="/findroom" className="hero-btn-primary">
              Find a Room
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/></svg>
            </Link>
            <Link to="/about" className="hero-btn-outline">
              How Dabi works
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M15.789 8C12.256 8 9.398 11.13 9.398 15M15.724 8C12.191 8 9.333 4.87 9.333 1M16 8H0" stroke="currentColor" strokeWidth="2"/></svg>
            </Link>
          </div>

          <span className="hero-reassurance">Free to use. No sign-up needed to browse.</span>

          <div className="hero-reviews">
            <div className="hero-review-badge">
              <span className="hero-review-dot" aria-hidden="true" />
              <span className="hero-review-score">Rooms verified</span>
              <svg fill="none" height="14" viewBox="0 0 16 16" width="14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7.127 1.105C7.579-.139 8.421-.139 8.855.417l2.867 3.673c.055.07.118.133.188.188l3.673 2.867c.556.434.556 1.276 0 1.71l-3.673 2.867a1 1 0 0 0-.188.188L8.855 15.583c-.434.556-1.276.556-1.71 0L4.278 11.91a1 1 0 0 0-.188-.188L.417 8.855C-.139 8.421-.139 7.579.417 7.127L4.09 4.278a1 1 0 0 0 .188-.188L7.127 1.105Z" fill="currentColor"/></svg>
              <span className="hero-review-label">Today</span>
            </div>
          </div>
        </div>

        {/* Right: visual */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-illustration-wrap">
            <img
              src={isometricIllustration}
              alt=""
              className="hero-illustration"
              width={480}
              height={384}
              loading="eager"
              decoding="async"
            />

            {/* Floating listing card */}
            <div className="hero-listing-card">
              <div className="hero-listing-header">
                <div>
                  <p className="hero-listing-name">Sunrise Lodge</p>
                  <p className="hero-listing-location">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>
                    New Dormaa · KNUST
                  </p>
                </div>
                <span className="hero-listing-badge">
                  <span className="hero-listing-dot" />
                  Verified
                </span>
              </div>
              <div className="hero-listing-rooms">
                <div className="hero-listing-room">
                  <span>2 in 1</span>
                  <span className="hero-listing-price">GH₵2,400</span>
                </div>
                <div className="hero-listing-room">
                  <span>1 in 1</span>
                  <span className="hero-listing-price">GH₵3,000</span>
                </div>
              </div>
            </div>

            {/* Float badge */}
            <div className="hero-float-badge">
              <span className="hero-float-dot" />
              <span>Rooms verified today</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
