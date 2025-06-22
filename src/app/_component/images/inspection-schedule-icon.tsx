"use client";
import React, { useState } from "react";

interface InspectionsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const InspectionsIcon: React.FC<InspectionsIconProps> = ({
  title = "Inspections",
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
        {/* Orange background */}
        <rect width="32" height="32" rx="8" fill="#F97316" />
        
        {/* Clipboard with checklist */}
        <rect x="10" y="8" width="12" height="16" rx="2" fill="white" />
        <path d="M10 12H22" stroke="#F97316" strokeWidth="1.5" />
        <path d="M10 15H22" stroke="#F97316" strokeWidth="1.5" />
        <path d="M10 18H22" stroke="#F97316" strokeWidth="1.5" />
        <path d="M10 21H22" stroke="#F97316" strokeWidth="1.5" />
        
        {/* Checkmark symbols */}
        <path d="M12 15L14 17L18 13" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 18L14 20L18 16" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Officer badge */}
        <circle cx="24" cy="12" r="3" fill="white" />
        <path d="M24 15V20M22 18H26" stroke="#F97316" strokeWidth="1.5" />
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

export default InspectionsIcon;