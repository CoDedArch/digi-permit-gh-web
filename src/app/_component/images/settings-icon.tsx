"use client";
import React, { useState } from "react";

interface SettingsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const SettingsIcon: React.FC<SettingsIconProps> = ({
  title = "Settings",
  ...props
}) => {
  const [hovered, setHovered] = useState(false);
  const [rotating, setRotating] = useState(false);

  return (
    <div
      className="flex items-center gap-2 relative "
      style={{
        display: "inline-flex",
        cursor: "pointer",
        zIndex: 1000000,
      }}
      onMouseEnter={() => {
        setHovered(true);
        setRotating(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setRotating(false);
      }}
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
        {/* Gray background */}
        <rect width="32" height="32" rx="8" fill="#6B7280" />

        {/* Gear icon with rotation animation */}
        <g
          style={{
            transformOrigin: "center",
            animation: rotating ? "spin 2s linear infinite" : "none",
          }}
        >
          <circle cx="16" cy="16" r="4" fill="white" />
          <path
            d="M16 8V5M16 27v-3M24 16h3M5 16h3M20.5 20.5l2.5 2.5M9 9l2.5 2.5M20.5 11.5l2.5-2.5M9 23l2.5-2.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
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
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          {title}
        </span>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsIcon;
