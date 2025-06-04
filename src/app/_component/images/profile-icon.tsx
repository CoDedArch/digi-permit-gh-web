import React from "react";

const ProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        fill="none"
        {...props}
    >
        <circle cx="24" cy="24" r="24" fill="#1976D2" />
        <circle cx="24" cy="18" r="8" fill="#fff" />
        <path
            d="M24 30c-7 0-12 3.5-12 7v3h24v-3c0-3.5-5-7-12-7z"
            fill="#fff"
        />
        <circle cx="24" cy="18" r="6" fill="#1976D2" />
        <ellipse
            cx="24"
            cy="36"
            rx="8"
            ry="4"
            fill="#1976D2"
            opacity={0.2}
        />
    </svg>
);

export default ProfileIcon;