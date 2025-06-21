'use client';

import React from 'react';
import { Link } from '@heroui/react';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CustomOrderButtonProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  highlight?: boolean;
}

export const CustomOrderButton: React.FC<CustomOrderButtonProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'solid',
  className = '',
  children,
  showIcon = true,
  highlight = false,
}) => {
  const t = useTranslations("filter");

  if (!children) {
    children = t("customOrder");
  }

  return (
    <Link
      href="https://form.typeform.com/to/B6ShMyC8"
      isExternal
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${size === 'sm' ? 'text-sm px-3 py-1.5' : ''}
        ${size === 'md' ? 'text-base px-4 py-2' : ''}
        ${size === 'lg' ? 'text-lg px-6 py-3' : ''}
        ${variant === 'solid' && color === 'primary' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        ${variant === 'solid' && color === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : ''}
        ${variant === 'solid' && color === 'success' ? 'bg-success text-success-foreground hover:bg-success/90' : ''}
        ${variant === 'solid' && color === 'warning' ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''}
        ${variant === 'solid' && color === 'danger' ? 'bg-danger text-danger-foreground hover:bg-danger/90' : ''}
        ${variant === 'bordered' ? 'border-2 bg-transparent hover:bg-default/10' : ''}
        ${variant === 'bordered' && color === 'primary' ? 'border-primary text-primary' : ''}
        ${variant === 'bordered' && color === 'secondary' ? 'border-secondary text-secondary' : ''}
        ${variant === 'bordered' && color === 'success' ? 'border-success text-success' : ''}
        ${variant === 'bordered' && color === 'warning' ? 'border-warning text-warning' : ''}
        ${variant === 'bordered' && color === 'danger' ? 'border-danger text-danger' : ''}
        ${variant === 'light' ? 'bg-transparent' : ''}
        ${variant === 'light' && color === 'primary' ? 'text-primary hover:bg-primary/10' : ''}
        ${variant === 'light' && color === 'secondary' ? 'text-secondary hover:bg-secondary/10' : ''}
        ${variant === 'light' && color === 'success' ? 'text-success hover:bg-success/10' : ''}
        ${variant === 'light' && color === 'warning' ? 'text-warning hover:bg-warning/10' : ''}
        ${variant === 'light' && color === 'danger' ? 'text-danger hover:bg-danger/10' : ''}
        ${variant === 'flat' ? 'bg-default-100 hover:bg-default-200' : ''}
        ${variant === 'flat' && color === 'primary' ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}
        ${variant === 'flat' && color === 'secondary' ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : ''}
        ${variant === 'flat' && color === 'success' ? 'bg-success/20 text-success hover:bg-success/30' : ''}
        ${variant === 'flat' && color === 'warning' ? 'bg-warning/20 text-warning hover:bg-warning/30' : ''}
        ${variant === 'flat' && color === 'danger' ? 'bg-danger/20 text-danger hover:bg-danger/30' : ''}
        ${variant === 'ghost' ? 'bg-transparent hover:bg-default/10' : ''}
        ${variant === 'shadow' ? 'shadow-lg' : ''}
        hover:scale-105 active:scale-95 bg-gradient-primary
        ${className}
      `}
    >
      <span>{children}</span>
      {showIcon && (
        <div className={`${highlight ? 'bg-gradient-primary rounded-full text-white p-2' : ''}`}>
          <ExternalLinkIcon size={size === 'sm' ? 18 : size === 'lg' ? 24 : 20}/>
        </div>
      )}
    </Link>
  );
}; 