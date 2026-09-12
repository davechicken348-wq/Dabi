import { Link } from 'react-router-dom';
import { Button } from '../../../shared/Button/Button';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  secondaryActionLabel,
  secondaryActionTo,
  icon,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon || '🌱'}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      <div className="empty-state-actions">
        {actionLabel && actionTo && (
          <Link to={actionTo}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        )}
        {secondaryActionLabel && secondaryActionTo && (
          <Link to={secondaryActionTo}>
            <Button variant="ghost">{secondaryActionLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
