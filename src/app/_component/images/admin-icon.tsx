"use client";
import React, { useState } from "react";

interface AdminIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const AdminIcon: React.FC<AdminIconProps> = ({
  title = "Admin",
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
        <rect width="32" height="32" rx="8" fill="#6B7280" />
        <path
          d="M16 10C19.3137 10 22 12.6863 22 16V22H10V16C10 12.6863 12.6863 10 16 10Z"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M16 10V8M16 8V6M16 8H14M16 8H18"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="12" y="20" width="8" height="4" rx="1" fill="#fff" />
        <rect x="12" y="14" width="2" height="2" rx="1" fill="#fff" />
        <rect x="18" y="14" width="2" height="2" rx="1" fill="#fff" />
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
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};

export default AdminIcon;