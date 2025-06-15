"use client";
import React from "react";
import { useRouter } from "next/navigation";

const DigiLogo: React.FC = () => {
  const router = useRouter();
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => router.push("/")}
      className="inline-block hover:scale-105 transition-transform duration-300 hover:cursor-pointer"
    >
      <rect
        x="6"
        y="8"
        width="36"
        height="32"
        rx="4"
        fill="#6366F1"
        style={{
          transformOrigin: "24px 24px",
          animation:
            "logo-bg-bounce 1.8s infinite cubic-bezier(.68,-0.55,.27,1.55)",
        }}
      />
      <rect
        x="12"
        y="14"
        width="24"
        height="20"
        rx="2"
        fill="#fff"
        style={{
          opacity: 0.95,
          animation:
            "logo-fade-in 1.2s 0.3s both, logo-float 4s ease-in-out infinite 1.5s",
        }}
      />
      <rect
        x="16"
        y="18"
        width="16"
        height="4"
        rx="1"
        fill="#A5B4FC"
        style={{
          animation:
            "logo-slide-in 1s 0.5s both, logo-color-shift 4s infinite 1.5s",
        }}
      />
      <rect
        x="16"
        y="24"
        width="10"
        height="2.5"
        rx="1"
        fill="#C7D2FE"
        style={{
          animation:
            "logo-slide-in 1s 0.7s both, logo-bar-grow 2s infinite alternate 1.7s",
        }}
      />
      <rect
        x="16"
        y="28"
        width="8"
        height="2.5"
        rx="1"
        fill="#C7D2FE"
        style={{
          animation:
            "logo-slide-in 1s 0.9s both, logo-bar-grow 2.2s infinite alternate 1.9s",
        }}
      />
      <circle
        cx="36"
        cy="32"
        r="3"
        fill="#22D3EE"
        stroke="#fff"
        strokeWidth="2"
        style={{
          animation:
            "logo-pulse 1.5s infinite, logo-orbital-rotate 6s linear infinite 2s",
        }}
      />
      <rect
        x="32"
        y="30"
        width="8"
        height="4"
        rx="2"
        fill="#22D3EE"
        opacity="0.3"
        style={{
          animation:
            "logo-fade-in 1.2s 1.1s both, logo-glow 3s infinite alternate 2s",
        }}
      />
      <rect
        x="8"
        y="8"
        width="32"
        height="6"
        rx="3"
        fill="#22D3EE"
        opacity="0.7"
        style={{
          animation:
            "logo-fade-in 1.2s 1.3s both, logo-wave 4s ease-in-out infinite 1.5s",
        }}
      />
      <rect
        x="20"
        y="34"
        width="8"
        height="2"
        rx="1"
        fill="#6366F1"
        opacity="0.5"
        style={{
          animation:
            "logo-fade-in 1.2s 1.5s both, logo-dash-move 3s linear infinite 2s",
        }}
      />
      <style>{`
                @keyframes logo-bg-bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.04); }
                }
                @keyframes logo-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes logo-slide-in {
                    from { opacity: 0; transform: translateX(-10px);}
                    to { opacity: 1; transform: translateX(0);}
                }
                @keyframes logo-pulse {
                    0%, 100% { r: 3; transform: scale(1); }
                    50% { r: 4; transform: scale(1.1); }
                }
                @keyframes logo-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes logo-color-shift {
                    0%, 100% { fill: #A5B4FC; }
                    50% { fill: #818CF8; }
                }
                @keyframes logo-bar-grow {
                    from { width: var(--start-width); }
                    to { width: calc(var(--start-width) * 1.3); }
                }
                @keyframes logo-orbital-rotate {
                    0% { transform: rotate(0deg) translateX(5px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(5px) rotate(-360deg); }
                }
                @keyframes logo-glow {
                    from { filter: drop-shadow(0 0 2px #22D3EE); }
                    to { filter: drop-shadow(0 0 6px #22D3EE); }
                }
                @keyframes logo-wave {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                @keyframes logo-dash-move {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 10; }
                }
            `}</style>
    </svg>
  );
};

export default DigiLogo;
