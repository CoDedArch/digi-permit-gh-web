"use client";
import React, { useState } from "react";

interface UserManagementIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const UserManagementIcon: React.FC<UserManagementIconProps> = ({
  title = "User Management",
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
        <rect width="32" height="32" rx="8" fill="#7C3AED" /> {/* Purple background */}
        
        {/* User group silhouette */}
        <path
          d="M11 20C11 17.7909 12.7909 16 15 16H17C19.2091 16 21 17.7909 21 20V21H11V20Z"
          fill="white"
        />
        <circle cx="16" cy="12" r="3" fill="white" />
        
        {/* Gear/settings icon */}
        <path
          d="M22 19L24 17M24 17L26 15M24 17L26 19M24 17L22 15"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="17" r="1" fill="white" />
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

export default UserManagementIcon;