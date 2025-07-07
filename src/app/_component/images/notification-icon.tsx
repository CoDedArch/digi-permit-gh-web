"use client";
import React, { useState } from "react";

interface NotificationIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  hasNotification?: boolean; // New prop for notification indicator
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  title = "Notifications",
  hasNotification = false,
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
        <rect width="32" height="32" rx="8" fill="#7C3AED" /> {/* Purple background */}
        
        {/* Bell body */}
        <path
          d="M22 16C22 12 20 10 16 10C12 10 10 12 10 16C10 20 9 21 9 21H23C23 21 22 20 22 16Z"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Bell clapper */}
        <path
          d="M16 21V23"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="16"
          cy="8"
          r="1.5"
          fill="#fff"
        />
        
        {/* Notification indicator */}
        {hasNotification && (
          <circle
            cx="22"
            cy="10"
            r="3"
            fill="#EF4444" /* Red dot for notifications */
          />
        )}
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

export default NotificationIcon;