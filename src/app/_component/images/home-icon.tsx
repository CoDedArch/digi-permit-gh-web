import React from "react";

const HomeLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        fill="none"
        {...props}
    >
        <rect width="48" height="48" rx="12" fill="#2563EB" />
        <path
            d="M12 22L24 12L36 22"
            stroke="#fff"
            strokeWidth={2}
            strokeLinejoin="round"
        />
        <path
            d="M16 22V34H32V22"
            stroke="#fff"
            strokeWidth={2}
            strokeLinejoin="round"
        />
        <rect
            x={21}
            y={28}
            width={6}
            height={6}
            rx={1}
            fill="#fff"
        />
    </svg>
);

export default HomeLogo;