import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ReceiptIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 2V22L7 20L10 22L13 20L16 22L19 20L22 22V2L19 4L16 2L13 4L10 2L7 4L4 2Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 8H16M8 12H16M8 16H12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MotorbikeIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={6} cy={17} r={3} stroke={color} strokeWidth={1.8} />
    <Circle cx={18} cy={17} r={3} stroke={color} strokeWidth={1.8} />
    <Path
      d="M6 17H11L14 10H17M14 10L12 6H16M14 10L10 17"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CoffeeIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8H19C20.1046 8 21 8.89543 21 10C21 11.1046 20.1046 12 19 12H18M3 8H18V14C18 16.7614 15.7614 19 13 19H8C5.23858 19 3 16.7614 3 14V8ZM6 2V5M10 2V5M14 2V5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={4} width={18} height={18} rx={3} stroke={color} strokeWidth={1.8} />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M16 7V4C16 3.44772 15.5523 3 15 3H5C4.44772 3 4 3.44772 4 4V7"
      stroke={color}
      strokeWidth={1.8}
    />
    <Circle cx={17} cy={14} r={1.5} fill={color} />
  </Svg>
);

export const PinIcon: React.FC<IconProps> = ({ size = 16, color = '#0D9488' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 17 20 13.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 13.4183 8 17 12 21Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const ShareIcon: React.FC<IconProps> = ({ size = 15, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={1.8} />
    <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={1.8} />
    <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={1.8} />
    <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={4} stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.8} />
    <Circle cx={8.5} cy={8.5} r={1.5} fill={color} />
    <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size = 16, color = '#2DD4BF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18H15M10 22H14M12 2C7.58172 2 4 5.58172 4 10C4 12.822 5.463 15.304 7.697 16.666C8.243 17.001 8.583 17.588 8.621 18.232L8.626 18.314H15.374L15.379 18.232C15.417 17.588 15.757 17.001 16.303 16.666C18.537 15.304 20 12.822 20 10C20 5.58172 16.4183 2 12 2Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = '#0F766E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 15, color = '#FF6B6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </Svg>
);

export const CommentIcon: React.FC<IconProps> = ({ size = 15, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TicketIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 9C3.65685 9 5 7.65685 5 6H19C19 7.65685 20.3431 9 22 9V15C20.3431 15 19 16.3431 19 18H5C5 16.3431 3.65685 15 2 15V9Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 6V18" stroke={color} strokeWidth={1.8} strokeDasharray="3 3" />
  </Svg>
);
