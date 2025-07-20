"use client";
import React, { useState } from "react";

interface ExceptionsIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ExceptionsIcon: React.FC<ExceptionsIconProps> = ({
  title = "Exceptions",
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
        {/* Red background for alert/exception */}
        <rect width="32" height="32" rx="8" fill="#DC2626" />

        {/* Warning triangle */}
        <path
          d="M16 9L22 21H10L16 9Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Exclamation mark */}
        <rect x="15" y="14" width="2" height="6" rx="1" fill="#DC2626" />
        <circle cx="16" cy="22" r="1" fill="#DC2626" />

        {/* Document with X symbol */}
        <rect x="20" y="12" width="8" height="10" rx="1" fill="white" />
        <path
          d="M22 14L26 18M26 14L22 18"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <p
        className="whitespace-nowrap font-semibold text-sm text-gray-700 tracking-wide"
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
          className="bg-gray-900 text-white font-medium text-sm"
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            letterSpacing: "0.025em",
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
};

export default ExceptionsIcon;
