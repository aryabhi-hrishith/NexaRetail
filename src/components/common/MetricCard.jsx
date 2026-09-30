import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last month',
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'primary'
  badge,
  onClick,
  className = '',
}) {
  const iconVariantStyles = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border border-rose-100',
  };

  const cardBorderStyles = {
    default: 'border-slate-200/80',
    primary: 'border-indigo-200/80',
    success: 'border-emerald-200/80',
    warning: 'border-amber-200/80',
    danger: 'border-rose-300 ring-1 ring-rose-200/60',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        cardBorderStyles[variant] || cardBorderStyles.default
      } ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </span>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              iconVariantStyles[variant] || iconVariantStyles.default
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trendDirection === 'up'
                    ? 'text-emerald-600'
                    : trendDirection === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {trend}
              </span>
              <span className="text-slate-400">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-slate-500">{subtitle}</span>
          )}
          {subtitle && trend !== undefined && (
            <span className="text-slate-400 truncate max-w-[140px]" title={subtitle}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
