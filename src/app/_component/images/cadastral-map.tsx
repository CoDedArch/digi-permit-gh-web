import React from "react";

interface CadastralMapProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const CadastralMap: React.FC<CadastralMapProps> = ({
  size = 320,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background */}
      <rect width="320" height="320" fill="#F5F7FA" rx="8" />

      {/* Grid Lines */}
      <path
        d="M0 40H320M0 80H320M0 120H320M0 160H320M0 200H320M0 240H320M0 280H320"
        stroke="#E5E9F0"
        strokeWidth="1"
      />
      <path
        d="M40 0V320M80 0V320M120 0V320M160 0V320M200 0V320M240 0V320M280 0V320"
        stroke="#E5E9F0"
        strokeWidth="1"
      />

      {/* Property Boundaries */}
      <path
        d="M60 60H140V140H60V60Z"
        stroke="#4C6FFF"
        strokeWidth="2"
        fill="#E0E7FF"
      />
      <path
        d="M160 60H240V140H160V60Z"
        stroke="#4C6FFF"
        strokeWidth="2"
        fill="#E0E7FF"
      />
      <path
        d="M60 160H140V240H60V160Z"
        stroke="#4C6FFF"
        strokeWidth="2"
        fill="#E0E7FF"
      />
      <path
        d="M180 180H260V260H180V180Z"
        stroke="#4C6FFF"
        strokeWidth="2"
        fill="#E0E7FF"
      />

      {/* Roads */}
      <path
        d="M140 60V240M160 60V240M60 140H240M60 160H240"
        stroke="#64748B"
        strokeWidth="4"
      />

      {/* Landmarks */}
      <circle cx="100" cy="100" r="8" fill="#10B981" />
      <circle cx="200" cy="200" r="8" fill="#10B981" />
      <rect x="200" y="100" width="16" height="16" rx="2" fill="#F59E0B" />
      <rect x="100" y="200" width="16" height="16" rx="2" fill="#F59E0B" />

      {/* Coordinates */}
      <text x="20" y="20" fill="#64748B" fontSize="10" fontFamily="monospace">
        N 32° 45&apos;
      </text>
      <text x="260" y="310" fill="#64748B" fontSize="10" fontFamily="monospace">
        W 117° 10&apos;
      </text>

      {/* Legend */}
      <rect
        x="220"
        y="20"
        width="80"
        height="80"
        rx="4"
        fill="white"
        stroke="#E5E9F0"
      />
      <circle cx="240" cy="50" r="4" fill="#10B981" />
      <text x="250" y="52" fill="#64748B" fontSize="10">
        Park
      </text>
      <rect x="235" cy="70" width="8" height="8" rx="1" fill="#F59E0B" />
      <text x="250" y="75" fill="#64748B" fontSize="10">
        Building
      </text>
    </svg>
  );
};

export default CadastralMap;
