import React from 'react';

interface FlourishCareLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
}

export const FlourishCareLogo: React.FC<FlourishCareLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'color'
}) => {
  // Brand Colors
  const orangeColor = '#F29935';
  const whiteColor = '#FFFFFF';
  const brownColor = '#7A4C3D';

  // Determine colors based on variant
  const sunrayColor = variant === 'light' ? whiteColor : orangeColor;
  const crescentColor = variant === 'light' ? whiteColor : orangeColor;
  const faceBgColor = variant === 'light' ? 'transparent' : whiteColor;
  const outerEyeColor = variant === 'light' ? orangeColor : whiteColor;
  const innerEyeColor = variant === 'light' ? whiteColor : orangeColor;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. Sunrays (Pill shapes radiating outwards) */}
      {/* Top (12 o'clock) */}
      <rect x="47" y="6" width="6" height="11" rx="3" fill={sunrayColor} />
      {/* Top-Right (2 o'clock) */}
      <rect x="74" y="17" width="6" height="11" rx="3" transform="rotate(45 77 22.5)" fill={sunrayColor} />
      {/* Right (3 o'clock) */}
      <rect x="83" y="47" width="11" height="6" rx="3" fill={sunrayColor} />
      {/* Bottom-Right (4:30 o'clock) */}
      <rect x="74" y="72" width="6" height="11" rx="3" transform="rotate(-45 77 77.5)" fill={sunrayColor} />
      {/* Bottom-Left (7:30 o'clock) */}
      <rect x="20" y="72" width="6" height="11" rx="3" transform="rotate(45 23 77.5)" fill={sunrayColor} />
      {/* Left (9 o'clock) */}
      <rect x="6" y="47" width="11" height="6" rx="3" fill={sunrayColor} />
      {/* Top-Left (10 o'clock) */}
      <rect x="20" y="17" width="6" height="11" rx="3" transform="rotate(-45 23 22.5)" fill={sunrayColor} />

      {/* 2. Outer Sun Crescent (Big Orange Arch with rounded ends) */}
      <path
        d="M 28 60 A 25 25 0 1 1 72 60"
        stroke={crescentColor}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* 3. Inner Smiling Moon Face (Rising inside the arch) */}
      <circle cx="50" cy="60" r="19" fill={faceBgColor} />

      {/* 4. Outer Sun Eyes (Smiling white curves on the orange crescent) */}
      <path
        d="M 33 44 Q 36 41 39 44"
        stroke={outerEyeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 61 44 Q 64 41 67 44"
        stroke={outerEyeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 5. Inner Moon Face Features (Smiling orange curves on the white face) */}
      <path
        d="M 41 55 Q 44 52 47 55"
        stroke={innerEyeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 53 55 Q 56 52 59 55"
        stroke={innerEyeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 46 63 Q 50 67 54 63"
        stroke={innerEyeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default FlourishCareLogo;
