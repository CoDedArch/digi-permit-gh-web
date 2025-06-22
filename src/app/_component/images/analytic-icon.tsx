"use client";
import React, { useState } from "react";

interface AnalyticsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const AnalyticsIcon: React.FC<AnalyticsIconProps> = ({
  title = "Analytics",
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2 relative"
      style={{
        display: "inline-flex",
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
          flexShrink: 0,
        }}
        {...props}
      >
        {/* Purple background for analytics */}
        <rect width="32" height="32" rx="8" fill="#7C3AED" />
        
        {/* Bar chart */}
        <rect x="10" y="16" width="3" height="10" rx="1" fill="white" />
        <rect x="15" y="12" width="3" height="14" rx="1" fill="white" />
        <rect x="20" y="8" width="3" height="18" rx="1" fill="white" />
        <rect x="25" y="14" width="3" height="12" rx="1" fill="white" />
        
        {/* Line graph */}
        <path
          d="M10 20L14 16L18 22L22 10L26 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Data points */}
        <circle cx="10" cy="20" r="1.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
        <circle cx="14" cy="16" r="1.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
        <circle cx="18" cy="22" r="1.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
        <circle cx="22" cy="10" r="1.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
        <circle cx="26" cy="18" r="1.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
      </svg>
      
      <p 
        className="whitespace-nowrap"
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
          className="bg-gray-900 text-white"
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
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

export default AnalyticsIcon;