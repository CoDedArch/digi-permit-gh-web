import React from 'react';

const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
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
);

export default DashboardIcon;