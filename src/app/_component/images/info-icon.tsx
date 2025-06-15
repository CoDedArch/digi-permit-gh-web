import React from "react";

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mb-2"
    {...props}
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={16} x2={12} y2={12} />
    <circle cx={12} cy={8} r={1} />
  </svg>
);

export default InfoIcon;
