"use client";
import React, { useState } from "react";

interface HomeLogoProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const MyApplicationsIcon: React.FC<HomeLogoProps> = ({ title = "My Applications", ...props }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2 relative"
      style={{
        display: "inline-flex",
        cursor: "pointer",
        zIndex: 1000,
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
          flexShrink: 0,
        }}
        {...props}
      >
        <rect width="48" height="48" rx="12" fill="#2563EB" />
        <path
          d="M14 16H34V36H14V16Z"
          stroke="#fff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M18 16V12H30V16"
          stroke="#fff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <rect x="20" y="22" width="8" height="4" rx="1" fill="#fff" />
        <rect x="20" y="30" width="8" height="4" rx="1" fill="#fff" />
      </svg>
      <p 
        className="whitespace-nowrap font-semibold text-sm text-gray-700 tracking-wide"
        style={{
          transition: "opacity 0.2s ease",
          opacity: hovered ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        {title}
      </p>
      {hovered && (
        <span
          className="bg-gray-900 text-white font-medium text-sm"
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            letterSpacing: "0.025em",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};

export default MyApplicationsIcon;