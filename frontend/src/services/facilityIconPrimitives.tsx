import type { SVGProps, ReactNode } from 'react';
type Props = SVGProps<SVGSVGElement> & { size?: number };
function Base({ size = 20, children, ...props }: Props & { children: ReactNode }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>; }
export const IconBed = (p: Props) => <Base {...p}><path d="M4 18V7h16v11M4 13h16M8 10h3" /></Base>;
export const IconCheck = (p: Props) => <Base {...p}><path d="m5 12 4 4L19 6" /></Base>;
export const IconWifi = (p: Props) => <Base {...p}><path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 20h.01" /></Base>;
export const IconShield = (p: Props) => <Base {...p}><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /></Base>;
