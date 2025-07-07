"use client";
import React, { useState } from "react";

interface InfoIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({
  title = "Information",
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
        {/* Blue background */}
        <rect width="32" height="32" rx="8" fill="#3B82F6" />
        
        {/* Info circle */}
        <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2" fill="none" />
        
        {/* Info i-dot */}
        <circle 
          cx="16" 
          cy="12" 
          r="1.5" 
          fill="white"
          style={{
            transformOrigin: "center",
            transform: hovered ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.2s ease"
          }}
        />
        
        {/* Info line with pulse effect */}
        <line 
          x1="16" 
          y1="16" 
          x2="16" 
          y2="22" 
          stroke="white" 
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            opacity: hovered ? 0.8 : 1,
            transform: hovered ? "scaleY(1.1)" : "scaleY(1)",
            transformOrigin: "center top",
            transition: "all 0.2s ease"
          }}
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

export default InfoIcon;