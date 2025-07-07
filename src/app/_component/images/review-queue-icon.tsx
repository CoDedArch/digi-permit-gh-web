"use client";
import React, { useState } from "react";

interface ReviewQueueIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ReviewQueueIcon: React.FC<ReviewQueueIconProps> = ({
  title = "Review Queue",
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
        {/* Teal background */}
        <rect width="32" height="32" rx="8" fill="#0D9488" />
        
        {/* Stacked documents */}
        <rect x="10" y="10" width="12" height="14" rx="1" fill="white" />
        <rect x="12" y="8" width="12" height="14" rx="1" fill="white" fillOpacity="0.8" />
        <rect x="14" y="6" width="12" height="14" rx="1" fill="white" fillOpacity="0.6" />
        
        {/* Progress indicator lines */}
        <path d="M13 13H19" stroke="#0D9488" strokeWidth="1.5" />
        <path d="M13 16H21" stroke="#0D9488" strokeWidth="1.5" />
        <path d="M13 19H17" stroke="#0D9488" strokeWidth="1.5" />
        
        {/* Clock icon for queue status */}
        <circle cx="24" cy="20" r="4" fill="white" />
        <path d="M24 18V20H22" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
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

export default ReviewQueueIcon;