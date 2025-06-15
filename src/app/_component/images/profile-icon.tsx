"use client";
import React, { useState } from "react";

interface ProfileIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  title = "Your Profile",
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
        viewBox="0 0 48 48"
        fill="none"
        style={{
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          transform: hovered ? "translateX(20px)" : "translateX(0)",
          display: "block",
        }}
        {...props}
      >
        <circle cx="24" cy="24" r="24" fill="#1976D2" />
        <circle cx="24" cy="18" r="8" fill="#fff" />
        <path d="M24 30c-7 0-12 3.5-12 7v3h24v-3c0-3.5-5-7-12-7z" fill="#fff" />
        <circle cx="24" cy="18" r="6" fill="#1976D2" />
        <ellipse cx="24" cy="36" rx="8" ry="4" fill="#1976D2" opacity={0.2} />
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

export default ProfileIcon;
