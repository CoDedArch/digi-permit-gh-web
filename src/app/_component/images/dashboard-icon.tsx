"use client";
import React, { useState } from "react";

interface DashboardIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const DashboardIcon: React.FC<DashboardIconProps> = ({
  title = "Your Dashboard",
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
        <rect x="3" y="3" width="10" height="12" rx="2" fill="#1976D2" />
        <rect x="19" y="3" width="10" height="7" rx="2" fill="#42A5F5" />
        <rect x="19" y="14" width="10" height="15" rx="2" fill="#90CAF9" />
        <rect x="3" y="19" width="10" height="10" rx="2" fill="#64B5F6" />
        <rect
          x="3"
          y="3"
          width="26"
          height="26"
          rx="4"
          stroke="#1565C0"
          strokeWidth="2"
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

export default DashboardIcon;
