import type { ImgHTMLAttributes } from 'react';
interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> { name?: string; }
export default function ResponsiveImage({ name: _name, ...props }: ResponsiveImageProps) { return <img {...props} />; }
