import React from 'react';
import Svg, { Circle, Rect, Path } from 'react-native-svg';

/**
 * Colors (match your requirement)
 */
export const ICON_GREEN = '#34C759';
export const ICON_GRAY = '#888888';

/**
 * Base wrapper so all icons scale consistently
 */
function IconBase({ size = 42, color = ICON_GRAY, children }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Apply default stroke color to all children by passing `color` down */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { stroke: color }) : child
      )}
    </Svg>
  );
}

/**
 * MIC ON (green)
 */
export function MicOnIcon({ size = 42, color = ICON_GREEN }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Rect x="26" y="17" width="12" height="20" rx="6" strokeWidth="2.5" />
      <Path
        d="M22 31c0 6 4.9 11 10 11s10-5 10-11"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path d="M32 42v6" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M27 48h10" strokeWidth="2.5" strokeLinecap="round" />
    </IconBase>
  );
}

/**
 * MIC OFF (gray with slash)
 */
export function MicOffIcon({ size = 42, color = ICON_GRAY }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Rect x="26" y="17" width="12" height="20" rx="6" strokeWidth="2.5" />
      <Path
        d="M22 31c0 6 4.9 11 10 11s10-5 10-11"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path d="M32 42v6" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M27 48h10" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M20 44L44 20" strokeWidth="2.8" strokeLinecap="round" />
    </IconBase>
  );
}

/**
 * VIDEO ON (green)
 */
export function VideoOnIcon({ size = 42, color = ICON_GREEN }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Rect x="20" y="26" width="22" height="14" rx="4" strokeWidth="2.5" />
      <Path
        d="M42 30l6-4v12l-6-4v-4Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/**
 * VIDEO OFF (gray with slash)
 */
export function VideoOffIcon({ size = 42, color = ICON_GRAY }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Rect x="20" y="26" width="22" height="14" rx="4" strokeWidth="2.5" />
      <Path
        d="M42 30l6-4v12l-6-4v-4Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path d="M20 44L44 20" strokeWidth="2.8" strokeLinecap="round" />
    </IconBase>
  );
}

/**
 * SPEAKER ON (green)
 */
export function SpeakerOnIcon({ size = 42, color = ICON_GREEN }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Path
        d="M22 28h6l8-6v20l-8-6h-6z"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path
        d="M40 28c2.5 2.5 2.5 6.5 0 9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M44 25c4.5 4.5 4.5 12.5 0 17"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/**
 * SPEAKER OFF (gray with slash)
 */
export function SpeakerOffIcon({ size = 42, color = ICON_GRAY }) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="32" cy="32" r="26" strokeWidth="2.5" />
      <Path
        d="M22 28h6l8-6v20l-8-6h-6z"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path d="M20 44L44 20" strokeWidth="2.8" strokeLinecap="round" />
    </IconBase>
  );
}
