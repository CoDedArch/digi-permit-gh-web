import React from "react";

const NotificationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
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
        <circle cx="22" cy="10" r="2" fill="#F59E42" stroke="#fff" strokeWidth={1.2} />
    </svg>
);

export default NotificationIcon;