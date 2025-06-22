"use client";
import React, { useState } from "react";

interface ViolationsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ViolationsIcon: React.FC<ViolationsIconProps> = ({
  title = "Violations",
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
        {/* Red background for urgency */}
        <rect width="32" height="32" rx="8" fill="#EF4444" />
        
        {/* Warning triangle */}
        <path
          d="M16 10L22 22H10L16 10Z"
          stroke="white"
          strokeWidth="1.5"
          fill="white"
        />
        
        {/* Exclamation mark */}
        <rect x="15" y="15" width="2" height="6" rx="1" fill="#EF4444" />
        <circle cx="16" cy="23" r="1" fill="#EF4444" />
        
        {/* Document with X symbol */}
        <rect x="20" y="12" width="8" height="10" rx="1" fill="white" />
        <path
          d="M22 14L26 18M26 14L22 18"
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
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

export default ViolationsIcon;