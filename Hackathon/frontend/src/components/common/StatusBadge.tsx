import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'DELIVERED':
      case 'RESOLVED':
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
      case 'UNDER_REVIEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
      case 'OPEN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DISPUTED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

