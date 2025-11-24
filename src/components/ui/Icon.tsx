import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 20,
  className,
}) => {
  return (
    <IconComponent
      size={size}
      strokeWidth={1.5}
      className={clsx('stroke-current', className)}
    />
  );
};
