import React from 'react';
import { Boxes, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { StockRiskMeter } from '../common/RiskIndicator';

export function InventoryImpactMeter({ simulation, settings }) {
  if (!simulation) return null;

  const {
    currentStock,
    safetyBufferUnits,
    estimatedUnits,
    remainingStock,
    daysToStockout,
    stockRiskLevel,
    stockRiskMessage,
  } = simulation;

  // Calculate percentage breakdown of current stock
  const consumedPercent = currentStock > 0 
    ? Math.min(100, Math.round((estimatedUnits / currentStock) * 100))
    : 100;
  
  const bufferPercent = Math.round(settings.defaultSafetyBufferPercent);
  const remainingPercent = Math.max(0, 100 - consumedPercent);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inventory Alignment & Feasibility</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              stockRiskLevel === 'safe'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : stockRiskLevel === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {stockRiskLevel === 'safe' ? 'Stock Aligned' : 'Constraint Detected'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates warehouse capacity, safety buffers, and risk of stockout
          </p>
        </div>
      </div>

      {/* Visual Stock Allocation Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Projected Warehouse Utilization</span>
          <span className="font-mono text-slate-900">{consumedPercent}% Allocated</span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/80">
          {/* Consumed by Promo */}
          <div
            className={`h-full rounded-l-full transition-all duration-300 ${
              remainingStock < 0 ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, consumedPercent)}%` }}
            title={`Promo Demand: ${estimatedUnits} units`}
          />
          {/* Remaining Stock */}
          {remainingStock > 0 && (
            <div
              className="h-full bg-emerald-400/80 rounded-r-full transition-all duration-300"
              style={{ width: `${remainingPercent}%` }}
              title={`Remaining Buffer: ${remainingStock} units`}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Promo Demand: <strong className="text-slate-800 font-mono">{estimatedUnits} units</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Remaining Post-Promo: <strong className="text-slate-800 font-mono">{remainingStock} units</strong>
          </span>
        </div>
      </div>

      {/* Stock Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Current Physical Stock
          </span>
          <span className="text-sm font-bold font-mono text-slate-800">
            {currentStock} units
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Safety Buffer ({bufferPercent}%)
          </span>
          <span className="text-sm font-bold font-mono text-slate-800">
            {safetyBufferUnits} units
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Days of Supply
          </span>
          <span className={`text-sm font-bold font-mono ${daysToStockout < 7 ? 'text-rose-600' : 'text-slate-800'}`}>
            {daysToStockout > 90 ? '90+ days' : `${daysToStockout} days`}
          </span>
        </div>
      </div>

      {/* Stock Risk Meter Warning Box */}
      <StockRiskMeter
        level={stockRiskLevel}
        message={stockRiskMessage}
        remainingStock={remainingStock}
      />
    </div>
  );
}
