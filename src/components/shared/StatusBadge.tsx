import React from 'react';
import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'DA_FARE':
        return {
          label: 'Da Fare',
          colors: 'bg-[var(--color-saggin-bg)]lue-100 text-blue-700 border-blue-200',
          Icon: Clock
        };
      case 'IN_CORSO':
        return {
          label: 'In Corso',
          colors: 'bg-amber-100 text-amber-700 border-amber-200',
          Icon: Play
        };
      case 'COMPLETATO':
        return {
          label: 'Completato',
          colors: 'bg-green-100 text-green-700 border-green-200',
          Icon: CheckCircle
        };
      case 'ANNULLATO':
        return {
          label: 'Annullato',
          colors: 'bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)]',
          Icon: XCircle
        };
      default:
        return {
          label: status,
          colors: 'bg-[var(--color-saggin-bg)] text-[var(--color-saggin-text-secondary)] border-[var(--color-saggin-border)]',
          Icon: Clock
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.Icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn(
      "inline-flex items-center font-semibold rounded-full border",
      config.colors,
      sizeClasses[size],
      className
    )}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </div>
  );
}
