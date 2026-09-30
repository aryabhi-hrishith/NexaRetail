import React from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Info, X } from 'lucide-react';
import { Button } from '../common/Button';

export function AiInsightDrawer({
  isOpen,
  onClose,
  recommendation,
  onApplyRecommendation,
}) {
  if (!isOpen || !recommendation) return null;

  const { optimalDiscount, simulation, headline, rationales, engineNotice } = recommendation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-indigo-100 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Deterministic AI Recommendation Engine
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white">
            {headline}
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            Simulated optimization based on elasticity, cost margins, and stock constraints.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Key Simulation Result Badge */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-900 block">
                Recommended Promotional Discount
              </span>
              <span className="text-2xl font-black text-indigo-600 font-mono">
                {optimalDiscount}% OFF
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                New Price: ₹{simulation.promoPrice.toLocaleString('en-IN')} (MRP ₹{simulation.originalPrice.toLocaleString('en-IN')})
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-900 block">
                Projected Incremental Profit
              </span>
              <span className="text-xl font-bold text-emerald-600 font-mono">
                +₹{simulation.incrementalProfit.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {simulation.promoMarginPercent}% Gross Margin
              </span>
            </div>
          </div>

          {/* Explainable Rationales */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Algorithm Rationale & Guardrails:
            </h4>
            <div className="space-y-2">
              {rationales.map((rationale, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <p className="leading-relaxed">{rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{engineNotice}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Dismiss
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={() => {
              onApplyRecommendation(optimalDiscount);
              onClose();
            }}
          >
            Apply {optimalDiscount}% Discount to Planner
          </Button>
        </div>
      </div>
    </div>
  );
}
