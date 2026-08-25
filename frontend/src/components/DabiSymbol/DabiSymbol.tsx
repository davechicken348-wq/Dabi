import type { SVGProps } from "react";

interface DabiSymbolProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number;
  pinColor?: string;
  houseColor?: string;
}

export default function DabiSymbol({
  size = 24,
  pinColor = "currentColor",
  houseColor = "#ffffff",
  ...props
}: DabiSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* Location pin */}
      <path
        d="M16 2.5c-5.8 0-10.5 4.5-10.5 10.2C5.5 19.6 16 29.5 16 29.5s10.5-9.9 10.5-16.8C26.5 7 21.8 2.5 16 2.5Z"
        fill={pinColor}
      />
      {/* House */}
      <path d="M16 7 10.5 12H21.5Z M12 12V18H20V12Z" fill={houseColor} />
    </svg>
  );
}
