import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface BeehiveIconProps {
  size?: number;
  color?: string;
}

export function BeehiveIcon({ size = 24, color = 'currentColor' }: BeehiveIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Roof */}
      <Path
        d="M2 8L12 2L22 8V9H2V8Z"
        fill={color}
      />
      {/* Main body */}
      <Path
        d="M3 9H21V20H3V9Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Entrance hole */}
      <Path
        d="M10 6C10 5.44772 10.4477 5 11 5H13C13.5523 5 14 5.44772 14 6C14 6.55228 13.5523 7 13 7H11C10.4477 7 10 6.55228 10 6Z"
        fill={color}
      />
      {/* Horizontal frames */}
      <Path
        d="M5 12H19"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M5 15H19"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Support legs */}
      <Path
        d="M6 20V22M18 20V22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}