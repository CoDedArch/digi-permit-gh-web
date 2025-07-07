"use client";
import React, { useState } from "react";

interface SiteVisitsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const SiteVisitsIcon: React.FC<SiteVisitsIconProps> = ({
  title = "Site Visits",
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
        {/* Green background */}
        <rect width="32" height="32" rx="8" fill="#10B981" />
        
        {/* Building icon */}
        <rect x="12" y="14" width="8" height="10" fill="white" />
        <rect x="14" y="16" width="1" height="2" fill="#10B981" />
        <rect x="17" y="16" width="1" height="2" fill="#10B981" />
        <rect x="14" y="20" width="1" height="2" fill="#10B981" />
        <rect x="17" y="20" width="1" height="2" fill="#10B981" />
        
        {/* Map pin with pulse waves */}
        <circle cx="24" cy="12" r="3" fill="white" />
        <path d="M24 9V12H21" stroke="#10B981" strokeWidth="1.5" />
        
        {/* Pulse waves */}
        <circle 
          cx="24" 
          cy="12" 
          r="5" 
          stroke="white" 
          strokeWidth="1.5" 
          fill="none"
          strokeOpacity={hovered ? 0.6 : 0.3}
          style={{ transition: "all 0.3s ease" }}
        />
        <circle 
          cx="24" 
          cy="12" 
          r="7" 
          stroke="white" 
          strokeWidth="1.5" 
          fill="none"
          strokeOpacity={hovered ? 0.3 : 0.1}
          style={{ transition: "all 0.3s ease" }}
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
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};

export default SiteVisitsIcon;