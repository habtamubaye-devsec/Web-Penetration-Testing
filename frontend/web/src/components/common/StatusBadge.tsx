
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ScanStatus } from '@/api-service/scan.service';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

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

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      case 'in-progress':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Badge className={cn(getVariant(), 'flex items-center gap-1', className)}>
      {getIcon()}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </Badge>
  );
}
