import React from 'react';
import { LawStatus, LawStatusText, LawStatusColor } from '@/types';

interface LawStatusBadgeProps {
  status: LawStatus;
  className?: string;
}

const LawStatusBadge: React.FC<LawStatusBadgeProps> = ({ status, className = '' }) => {
  const text = LawStatusText[status];
  const colorClass = LawStatusColor[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {text}
    </span>
  );
};

export default LawStatusBadge;
