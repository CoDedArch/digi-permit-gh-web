// components/LoadingScreen.tsx
"use client";

import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  text?: string;
}

export default function LoadingScreen({ text }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
        <p className="text-lg text-white">{text || "Loading your dashboard..."}</p>
      </div>
    </div>
  );
}