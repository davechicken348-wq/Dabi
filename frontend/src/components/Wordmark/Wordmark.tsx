import DabiSymbol from "../DabiSymbol/DabiSymbol";

interface WordmarkProps {
  invert?: boolean;
  size?: number;
}

export default function Wordmark({ invert = false, size = 26 }: WordmarkProps) {
  return (
    <>
      <DabiSymbol
        size={size}
        pinColor={invert ? "#ffffff" : "#176B4D"}
        houseColor={invert ? "#176B4D" : "#ffffff"}
      />
      <span className={`dabi-wordmark ${invert ? "dabi-wordmark--invert" : ""}`}>
        <span className="dabi-wordmark__a">Da</span>
        <span className="dabi-wordmark__b">bi</span>
      </span>
    </>
  );
}
