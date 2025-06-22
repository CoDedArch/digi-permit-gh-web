"use client";
import React, { useState } from "react";

interface InspectIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const InspectIcon: React.FC<InspectIconProps> = ({
  title = "Inspect",
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
        <rect width="32" height="32" rx="8" fill="#3B82F6" />
        <path
          d="M21 21L26 26"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="14"
          cy="14"
          r="7"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M14 11V14H17"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
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

export default InspectIcon;