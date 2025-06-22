"use client";
import React, { useState } from "react";

interface ReviewIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ReviewIcon: React.FC<ReviewIconProps> = ({
  title = "Review",
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
        <rect width="32" height="32" rx="8" fill="#4F46E5" />
        <path
          d="M16 19C19.866 19 23 15.866 23 12C23 8.13401 19.866 5 16 5C12.134 5 9 8.13401 9 12C9 15.866 12.134 19 16 19Z"
          stroke="#fff"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M16 19V27" stroke="#fff" strokeWidth="1.5" />
        <path d="M12 23L20 23" stroke="#fff" strokeWidth="1.5" />
        <circle cx="16" cy="12" r="1.5" fill="#fff" />
        <circle cx="20" cy="12" r="1.5" fill="#fff" />
        <circle cx="12" cy="12" r="1.5" fill="#fff" />
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

export default ReviewIcon;
