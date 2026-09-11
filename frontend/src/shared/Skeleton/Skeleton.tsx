import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <span
          key={i}
          className={`skeleton ${className || ''}`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          }}
        />
      ))}
    </>
  );
}
