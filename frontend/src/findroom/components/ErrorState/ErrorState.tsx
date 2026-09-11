import { Button } from '../../../shared/Button/Button';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "We couldn't load this right now.",
  description = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state-icon" aria-hidden="true">⚠️</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-desc">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
}
