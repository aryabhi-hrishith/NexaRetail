import React from 'react';

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  dot = false,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const dotColors = {
    default: 'bg-slate-500',
    primary: 'bg-indigo-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    blue: 'bg-sky-500',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
}

export function StockStatusBadge({ status }) {
  switch (status) {
    case 'healthy':
      return <Badge variant="success" dot>Healthy Stock</Badge>;
    case 'low':
      return <Badge variant="warning" dot>Low Stock</Badge>;
    case 'critical':
      return <Badge variant="danger" dot>Critical Risk</Badge>;
    case 'out_of_stock':
      return <Badge variant="neutral" dot>Out of Stock</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function CampaignStatusBadge({ status }) {
  switch (status) {
    case 'active':
      return <Badge variant="success" dot>Active</Badge>;
    case 'scheduled':
      return <Badge variant="primary" dot>Scheduled</Badge>;
    case 'completed':
      return <Badge variant="default">Completed</Badge>;
    case 'draft':
      return <Badge variant="warning" dot>Draft</Badge>;
    case 'paused':
      return <Badge variant="neutral">Paused</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}
