import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';

export function AiRecommendationCard({ recommendation }) {
  const navigate = useNavigate();
  const { products, navigateToPlannerWith } = useApp();

  const isOpportunity = recommendation.type === 'Opportunity' || recommendation.type === 'Targeted Niche';
  const isWarning = recommendation.type === 'Stockout Warning';

  const matchedProduct = products.find((p) => p.id === recommendation.productId);

  const handleAction = () => {
    if (isWarning) {
      navigate('/inventory');
    } else {
      navigateToPlannerWith(
        matchedProduct,
        recommendation.targetSegmentId,
        recommendation.recommendedDiscount
      );
      navigate('/planner');
    }
  };

  return (
    <div className={`relative rounded-2xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
      isWarning
        ? 'bg-gradient-to-b from-rose-50/40 to-white border-rose-200 ring-1 ring-rose-100'
        : 'bg-gradient-to-b from-indigo-50/40 to-white border-indigo-200/80 ring-1 ring-indigo-100/60'
    }`}>
      <div>
        {/* Card Header: Type Badge & Confidence */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${
              isWarning ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {isWarning ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {recommendation.badge}
            </span>
          </div>

          <Badge variant={isWarning ? 'danger' : 'primary'} size="sm">
            {isWarning ? 'Action Required' : `${recommendation.recommendedDiscount}% Promo Match`}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1.5">
          {recommendation.title}
        </h4>

        {/* Target Product & Segment Pill */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            📦 {recommendation.productName}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-mono font-medium">
            {recommendation.sku}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
            🎯 {recommendation.targetSegmentName}
          </span>
        </div>

        {/* Explainable Rationale */}
        <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/70 mb-4">
          {recommendation.rationale}
        </p>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Stock Buffer
            </span>
            <span className={`font-bold font-mono ${isWarning ? 'text-rose-600' : 'text-slate-900'}`}>
              {recommendation.currentStock} in stock
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Gross Margin
            </span>
            <span className="font-bold font-mono text-emerald-600">
              {recommendation.projectedMarginPercent}%
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Projected Lift
            </span>
            <span className="font-bold font-mono text-indigo-600">
              {recommendation.projectedRevenue > 0
                ? `+₹${(recommendation.projectedRevenue / 1000).toFixed(0)}k`
                : 'Stockout Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Simulated Recommendation
        </span>
        <Button
          size="sm"
          variant={isWarning ? 'danger' : 'primary'}
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleAction}
        >
          {recommendation.actionLabel}
        </Button>
      </div>
    </div>
  );
}
