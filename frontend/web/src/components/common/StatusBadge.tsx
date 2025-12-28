
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ScanStatus } from '@/api-service/scan.service';

interface StatusBadgeProps {
  status: ScanStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'completed':
        return 'bg-status-success text-white';
      case 'pending':
        return 'bg-status-pending text-white';
      case 'failed':
        return 'bg-status-danger text-white';
      case 'in-progress':
        return 'bg-status-info text-white';
      default:
        return 'bg-status-info text-white';
    }
  };

  return (
    <Badge className={cn(getVariant(), className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
