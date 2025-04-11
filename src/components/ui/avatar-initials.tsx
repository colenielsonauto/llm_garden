'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarWithInitialsProps {
  name: string;
  className?: string;
}

// Simple function to get initials (up to 2)
const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean); // Split by space and remove empty strings
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || '?';
  }
  return (
    (parts[0][0]?.toUpperCase() || '') + (parts[parts.length - 1][0]?.toUpperCase() || '')
  );
};

// Consistent pastel colors
const pastelColors = [
  '#FFB3BA', // Light Pink
  '#FFDFBA', // Light Peach
  '#FFFFBA', // Light Yellow
  '#Baffc9', // Light Mint Green
  '#BAE1FF', // Light Blue
  '#E0BBE4', // Light Lavender
  '#FFDAC1', // Light Apricot
  '#B5EAD7', // Light Aqua
  '#C7CEEA', // Light Periwinkle
];

// Function to get a deterministic color based on name
const getColorFromName = (name: string): string => {
  if (!name) return pastelColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
};

export const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  name,
  className,
}) => {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  // Basic contrast check - very simple, might need refinement
  // Using a simple brightness check (sum of RGB) - threshold might need adjustment
  const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
  };
  const rgb = hexToRgb(backgroundColor);
  const brightness = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : 255;
  const textColor = brightness > 150 ? 'text-gray-700' : 'text-white'; // Dark text on light bg, light text on dark bg

  return (
    <div
      className={cn(
        'h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center font-medium',
        className
      )}
      style={{ backgroundColor }}
    >
      <span className={cn('text-xs', textColor)}>{initials}</span>
    </div>
  );
}; 