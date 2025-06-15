"use client";
import React, { useState } from "react";

interface HomeLogoProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const HomeLogo: React.FC<HomeLogoProps> = ({ title = "Home", ...props }) => {
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
        viewBox="0 0 48 48"
        fill="none"
        style={{
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          transform: hovered ? "translateX(20px)" : "translateX(0)",
          display: "block",
        }}
        {...props}
      >
        <rect width="48" height="48" rx="12" fill="#2563EB" />
        <path
          d="M12 22L24 12L36 22"
          stroke="#fff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M16 22V34H32V22"
          stroke="#fff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <rect x={21} y={28} width={6} height={6} rx={1} fill="#fff" />
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

export default HomeLogo;
