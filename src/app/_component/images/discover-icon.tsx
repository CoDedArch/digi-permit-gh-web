"use client";
import React, { useState } from "react";

interface DiscoverIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const DiscoverIcon: React.FC<DiscoverIconProps> = ({
  title = "Discover",
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        style={{
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          transform: hovered ? "translateX(20px)" : "translateX(0)",
          display: "block",
        }}
        {...props}
      >
        <circle
          cx="16"
          cy="16"
          r="15"
          stroke="#1A73E8"
          strokeWidth="2"
          fill="#E3F2FD"
        />
        <g>
          <polygon
            points="21,11 14,13 11,21 18,19"
            fill="#1A73E8"
            stroke="#1565C0"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="16"
            r="2"
            fill="#fff"
            stroke="#1A73E8"
            strokeWidth="1"
          />
        </g>
      </svg>
      {hovered && (
        <span
          className="bg-gray-900 text-white"
          style={{
            position: "absolute",
            left: "110%",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "4px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontSize: 14,
            whiteSpace: "nowrap",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};

export default DiscoverIcon;
