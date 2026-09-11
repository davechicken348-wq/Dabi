import './Badge.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'neutral' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className || ''}`}>{children}</span>;
}
