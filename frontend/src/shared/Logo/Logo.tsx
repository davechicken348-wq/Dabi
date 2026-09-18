import './Logo.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'mark';
}

export function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={`logo-mark logo-${size}`}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#176b4d" />
          <path d="M16 24s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="#f8f6ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="14" r="2" stroke="#f8f6ef" strokeWidth="2" />
        </svg>
      </span>
    );
  }

  return (
    <span className={`logo logo-${size}`}>
      <span className="logo-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#176b4d" />
          <path d="M16 24s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="#f8f6ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="14" r="2" stroke="#f8f6ef" strokeWidth="2" />
        </svg>
      </span>
      <span className="logo-text" aria-label="Dabi">
        <span className="logo-dab">Dab</span>
        <span className="logo-i">i</span>
      </span>
    </span>
  );
}
