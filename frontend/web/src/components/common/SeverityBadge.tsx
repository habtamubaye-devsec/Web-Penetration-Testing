
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type SeverityLevel } from '@/api-service/scan.service';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const getVariant = () => {
    switch (severity) {
      case 'high':
        return 'bg-status-danger text-white';
      case 'medium':
        return 'bg-status-warning text-black';
      case 'low':
        return 'bg-status-success text-white';
      case 'info':
        return 'bg-status-info text-white';
      default:
        return 'bg-status-info text-white';
    }
  };

  return (
    <Badge className={cn(getVariant(), className)}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}
