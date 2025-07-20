"use client";
import React from "react";
import { useRouter } from "next/navigation";

const DigiLogo: React.FC = () => {
  const router = useRouter();
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      onClick={() => router.push("/")}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block hover:scale-[1.05] transition-transform duration-300 hover:cursor-pointer"
    >
      {/* Ghana Flag Colors Background Circle */}
      <circle cx="28" cy="28" r="26" fill="#DC2626" opacity="0.1" />

      {/* Modern Building Structure */}
      <rect
        x="12"
        y="18"
        width="32"
        height="26"
        rx="3"
        fill="url(#buildingGradient)"
      />

      {/* Building Details */}
      <rect x="18" y="24" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="23" y="24" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="28" y="24" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="33" y="24" width="3" height="3" rx="0.5" fill="#FEF3C7" />

      <rect x="18" y="30" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="23" y="30" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="28" y="30" width="3" height="3" rx="0.5" fill="#FEF3C7" />
      <rect x="33" y="30" width="3" height="3" rx="0.5" fill="#FEF3C7" />

      <rect x="18" y="36" width="3" height="6" rx="0.5" fill="#FBBF24" />
      <rect x="33" y="36" width="3" height="6" rx="0.5" fill="#FEF3C7" />

      {/* Door */}
      <rect x="25" y="36" width="6" height="8" rx="1" fill="#92400E" />
      <circle cx="29" cy="40" r="0.5" fill="#FBBF24" />

      {/* Digital Approval Badge with Ghana Star */}
      <circle cx="42" cy="18" r="8" fill="#059669" />
      <circle cx="42" cy="18" r="6" fill="#10B981" />

      {/* Ghana Black Star */}
      <path
        d="M42 14L43.2 17.2L46.5 17.2L43.9 19.3L45.1 22.5L42 20.4L38.9 22.5L40.1 19.3L37.5 17.2L40.8 17.2L42 14Z"
        fill="#000000"
      />

      {/* Checkmark over star */}
      <path
        d="M40 18L41.5 19.5L44.5 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Digital Elements */}
      <rect x="8" y="12" width="2" height="2" rx="1" fill="#3B82F6" />
      <rect x="46" y="34" width="2" height="2" rx="1" fill="#3B82F6" />
      <rect x="6" y="38" width="2" height="2" rx="1" fill="#10B981" />

      {/* Foundation */}
      <rect x="10" y="44" width="36" height="3" rx="1.5" fill="#1E40AF" />

      <defs>
        <linearGradient
          id="buildingGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};
export default DigiLogo;
