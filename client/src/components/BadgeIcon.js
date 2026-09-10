import React from 'react';
import {
  Award,
  BadgeCheck,
  Crown,
  Flame,
  Gem,
  Gift,
  Heart,
  Leaf,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

export const BADGE_ICON_OPTIONS = [
  { value: 'Trophy', label: 'Kubok', Icon: Trophy },
  { value: 'Crown', label: 'Toj', Icon: Crown },
  { value: 'Gem', label: 'Qimmatbaho tosh', Icon: Gem },
  { value: 'Medal', label: 'Medal', Icon: Medal },
  { value: 'Award', label: 'Mukofot', Icon: Award },
  { value: 'BadgeCheck', label: 'Tasdiqlangan', Icon: BadgeCheck },
  { value: 'Star', label: 'Yulduz', Icon: Star },
  { value: 'Sparkles', label: 'Yaltiroq', Icon: Sparkles },
  { value: 'Flame', label: 'Olov', Icon: Flame },
  { value: 'Zap', label: 'Energiya', Icon: Zap },
  { value: 'Target', label: 'Maqsad', Icon: Target },
  { value: 'ShieldCheck', label: 'Himoya', Icon: ShieldCheck },
  { value: 'Gift', label: 'Sovg‘a', Icon: Gift },
  { value: 'Heart', label: 'Yurak', Icon: Heart },
  { value: 'Leaf', label: 'Tabiat', Icon: Leaf },
];

const BADGE_ICON_MAP = Object.fromEntries(
  BADGE_ICON_OPTIONS.map(({ value, Icon }) => [value, Icon]),
);

export const BadgeIcon = ({ icon, className = '', imageClassName = '', size, ...props }) => {
  if (typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'))) {
    return <img src={icon} alt="" className={imageClassName || className} {...props} />;
  }

  const Icon = BADGE_ICON_MAP[icon];
  if (Icon) return <Icon className={className} size={size} aria-hidden="true" {...props} />;

  // Keep legacy emoji badges readable while all newly created badges use Lucide icons.
  return <span className={className} aria-hidden="true">{icon || '🏅'}</span>;
};

export default BadgeIcon;
