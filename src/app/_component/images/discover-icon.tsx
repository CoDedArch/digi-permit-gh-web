import React from "react";

const DiscoverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        {...props}
    >
        <circle cx="16" cy="16" r="15" stroke="#1A73E8" strokeWidth="2" fill="#E3F2FD" />
        <g>
            <polygon
                points="21,11 14,13 11,21 18,19"
                fill="#1A73E8"
                stroke="#1565C0"
                strokeWidth="1"
                strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2" fill="#fff" stroke="#1A73E8" strokeWidth="1" />
        </g>
    </svg>
);

export default DiscoverIcon;