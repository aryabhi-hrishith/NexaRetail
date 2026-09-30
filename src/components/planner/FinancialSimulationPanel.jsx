import React from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { MarginHealthMeter } from '../common/RiskIndicator';

export function FinancialSimulationPanel({ simulation, settings }) {
  if (!simulation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        Select a product to view simulated financial projections.
      </div>
    );
  }

  const {
    originalPrice,
    promoPrice,
    costPrice,
    unitProfitOriginal,
    unitProfitPromo,
    originalMarginPercent,
    promoMarginPercent,
    baselineUnits,
    estimatedUnits,
    upliftMultiplier,
    promoRevenue,
    promoProfit,
    baselineRevenue,
    baselineProfit,
    incrementalRevenue,
    incrementalProfit,
    marginRiskLevel,
    marginRiskMessage,
  } = simulation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
      {/* Header with simulated disclaimer */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Financial & Margin Simulation</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Simulated
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time projection based on customer elasticity and unit economics
          </p>
        </div>
      </div>

      {/* Unit Economics Comparison Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Original MRP
          </span>
          <span className="text-base font-bold font-mono text-slate-800">
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Base margin: {originalMarginPercent}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80">
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">
            Promotional Price
          </span>
          <span className="text-base font-bold font-mono text-indigo-900">
            ₹{promoPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-indigo-600 block mt-0.5">
            Unit Profit: ₹{unitProfitPromo.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Baseline Run-rate
          </span>
          <span className="text-base font-bold font-mono text-slate-800">
            {baselineUnits} units
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Standard pace
          </span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80">
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">
            Projected Volume
          </span>
          <span className="text-base font-bold font-mono text-indigo-900">
            {estimatedUnits} units
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">
            +{((upliftMultiplier - 1) * 100).toFixed(0)}% Lift ({upliftMultiplier}x)
          </span>
        </div>
      </div>

      {/* Aggregate Financial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Estimated Revenue Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
            Estimated Promo Revenue
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-white">
              ₹{promoRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-indigo-800/80 flex items-center justify-between text-xs text-indigo-200">
            <span>Baseline: ₹{baselineRevenue.toLocaleString('en-IN')}</span>
            <span className={`font-bold font-mono ${incrementalRevenue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {incrementalRevenue >= 0 ? '+' : ''}₹{incrementalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Estimated Profit Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
            Estimated Gross Profit
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-emerald-400">
              ₹{promoProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {promoMarginPercent}% Margin
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Baseline: ₹{baselineProfit.toLocaleString('en-IN')}</span>
            <span className={`font-bold font-mono ${incrementalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {incrementalProfit >= 0 ? '+' : ''}₹{incrementalProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Margin Health Indicator Meter */}
      <MarginHealthMeter
        level={marginRiskLevel}
        message={marginRiskMessage}
        marginPercent={promoMarginPercent}
        minThreshold={settings.minGrossMarginThreshold}
      />

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <Info className="w-3.5 h-3.5" />
        Simulation assumes constant supplier cost of ₹{costPrice.toLocaleString('en-IN')} per unit.
      </p>
    </div>
  );
}
