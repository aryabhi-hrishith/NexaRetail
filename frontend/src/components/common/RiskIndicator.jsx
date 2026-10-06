import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, ShieldAlert } from 'lucide-react';

export function StockRiskMeter({ level, message, remainingStock, reorderThreshold }) {
  const levelConfigs = {
    safe: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Inventory Safe',
    },
    warning: {
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Buffer Low Warning',
    },
    critical: {
      color: 'text-rose-800 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
      icon: XCircle,
      label: 'Critical Stockout Hazard',
    },
  };

  const config = levelConfigs[level] || levelConfigs.safe;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.color} transition-all`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{config.label}</span>
            {remainingStock !== undefined && (
              <span className="text-xs font-mono font-medium opacity-90">
                {remainingStock >= 0 ? `${remainingStock} left` : `${Math.abs(remainingStock)} deficit`}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function MarginHealthMeter({ level, message, marginPercent, minThreshold }) {
  const levelConfigs = {
    safe: {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
      label: 'Margin Healthy',
    },
    warning: {
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: AlertTriangle,
      label: 'Margin Tight',
    },
    critical: {
      color: 'text-rose-800 bg-rose-50 border-rose-200',
      icon: ShieldAlert,
      label: 'Margin Floor Breached',
    },
  };

  const config = levelConfigs[level] || levelConfigs.safe;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.color} transition-all`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{config.label}</span>
            <span className="text-xs font-mono font-bold">
              {marginPercent}% <span className="font-normal opacity-75">(Min: {minThreshold}%)</span>
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}
