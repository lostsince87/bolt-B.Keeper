import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BeehiveIconProps {
  size?: number;
  color?: string;
}

export function BeehiveIcon({ size = 24, color = '#000' }: BeehiveIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8 9H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M8 12H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M8 15H16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M10 6H14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}