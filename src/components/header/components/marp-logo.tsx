import React from "react";

interface MarpLogoProps {
  className?: string;
  size?: number;
}

/**
 * Marp Web Editor custom logo component
 *
 * Features:
 * - Modern circular design with inner elements
 * - Clean, tech-inspired aesthetic
 * - Scalable and distinctive
 */
const MarpLogo: React.FC<MarpLogoProps> = ({
  className = "h-4 w-4",
  size = 16,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="12" cy="12" r="10" fill="url(#logoGradient)" />

      {/* Inner design - play button style */}
      <path d="M10 8 L10 16 L16 12 Z" fill="white" fillOpacity="0.9" />

      {/* Small accent dot */}
      <circle cx="17" cy="7" r="1.5" fill="white" fillOpacity="0.6" />
    </svg>
  );
};

export default MarpLogo;
