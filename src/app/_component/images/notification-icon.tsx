"use client";
import React, { useState } from "react";

interface NotificationIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  title = "Your Notifications",
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
        <circle cx="16" cy="16" r="16" fill="#2563EB" />
        <path
          d="M23 22H9m12-8v4c0 2.21-1.79 4-4 4s-4-1.79-4-4v-4a4 4 0 1 1 8 0Zm-4 8v2"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="22"
          cy="10"
          r="2"
          fill="#F59E42"
          stroke="#fff"
          strokeWidth={1.2}
        />
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

export default NotificationIcon;
