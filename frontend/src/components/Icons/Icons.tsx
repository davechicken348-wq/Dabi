import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function iconProps({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function IconLock(props: IconProps) {
  return <svg {...iconProps(props)}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

function makeIcon(path: string) {
  return function GenericIcon(props: IconProps) {
    return <svg {...iconProps(props)}><path d={path} /></svg>;
  };
}

const genericPath = 'M4 12h16M12 4v16';
export const IconShield = makeIcon('M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z');
export const IconChat = makeIcon('M4 5h16v11H9l-5 4V5Z');
export const IconBed = makeIcon('M4 18V7h16v11M4 13h16M8 10h3');
export const IconLogout = makeIcon('M10 5H5v14h5M14 8l4 4-4 4M18 12H9');
export const IconMenu = makeIcon('M4 7h16M4 12h16M4 17h16');
export const IconBell = makeIcon('M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4');
export const IconHelp = makeIcon('M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.1.9-1.7 1.3-1.7 2.7M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z');
export const IconSearch = makeIcon('m20 20-4.4-4.4M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z');
export const IconPin = makeIcon('M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z');
export const IconBook = makeIcon('M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z');
export const IconArrow = makeIcon('M5 12h14M13 6l6 6-6 6');
export const IconArrowUpRight = makeIcon('M7 17 17 7M8 7h9v9');
export const IconPlus = makeIcon(genericPath);
export const IconRefresh = makeIcon('M20 11a8 8 0 1 0 1 4M20 5v6h-6');
export const IconClose = makeIcon('M6 6l12 12M18 6 6 18');
export const IconUsers = makeIcon('M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a3 3 0 1 0 0-6');
export const IconBolt = makeIcon('m13 2-9 12h7l-1 8 9-12h-7l1-8Z');
export const IconCheck = makeIcon('m5 12 4 4L19 6');
export const IconCalendar = makeIcon('M5 4h14v16H5V4ZM8 2v4M16 2v4M5 9h14');
export const IconTag = makeIcon('M4 5h8l7 7-7 7-8-8V5Z');
export const IconInfo = makeIcon('M12 11v6M12 7h.01M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0Z');
export const IconWarning = makeIcon('m12 3 9 17H3L12 3ZM12 9v4M12 16h.01');
export const IconDanger = IconWarning;
export const IconError = IconWarning;
export const IconGold = makeIcon('M12 3 14.8 9l6.5.6-4.9 4.2 1.5 6.3L12 16.8 6.1 20l1.5-6.3-4.9-4.2L9.2 9 12 3Z');
export const IconEdit = makeIcon('M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4');
export const IconEye = makeIcon('M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z');
export const IconGrid = makeIcon('M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h6v6h-6v-6Z');
export const IconImages = makeIcon('M4 5h16v14H4V5ZM4 16l4-4 3 3 3-4 6 6');
export const IconKey = makeIcon('M14 10a4 4 0 1 0-1 3l7 7M17 17l2-2');
export const IconLayers = makeIcon('m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5');
export const IconList = makeIcon('M5 6h14M5 12h14M5 18h14');
export const IconMail = makeIcon('M4 6h16v12H4V6ZM4 7l8 6 8-6');
export const IconMap = makeIcon('M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z');
export const IconMessageSquareMore = IconChat;
export const IconMore = makeIcon('M5 12h.01M12 12h.01M19 12h.01');
export const IconOk = IconCheck;
export const IconPhone = makeIcon('M7 4h3l1 4-2 1a13 13 0 0 0 6 6l1-2 4 1v3a2 2 0 0 1-2 2C11 19 5 13 5 6a2 2 0 0 1 2-2Z');
export const IconSliders = makeIcon('M4 6h16M4 12h16M4 18h16M8 4v4M15 10v4M10 16v4');
export const IconSparkles = makeIcon('m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z');
export const IconSquarePlus = makeIcon('M5 3h14v18H5V3ZM12 8v8M8 12h8');
export const IconStar = IconGold;
export const IconTextSearch = IconSearch;
export const IconTrash = makeIcon('M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3v13H8V7Z');
export const IconType = makeIcon('M5 5h14M12 5v14M8 19h8');
export const IconUpload = makeIcon('M12 16V4M7 9l5-5 5 5M5 20h14');
export const IconUser = makeIcon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0');
export const IconWrap = makeIcon('M4 7h12a4 4 0 0 1 0 8H8M8 11l-4 4 4 4');
export const IconChevronDown = makeIcon('m6 9 6 6 6-6');
export const IconChevronLeft = makeIcon('m15 6-6 6 6 6');
export const IconBookOpen = makeIcon('M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2V5ZM20 5a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2V5Z');
