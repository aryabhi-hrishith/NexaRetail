import React from 'react';
import { Users, Crown, Repeat, Calendar, Zap, UserMinus, Check } from 'lucide-react';

export function SegmentSelector({ segments, selectedSegment, onSelectSegment }) {
  const iconMap = {
    Repeat: Repeat,
    Crown: Crown,
    Calendar: Calendar,
    Zap: Zap,
    UserMinus: UserMinus,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          2. Target Customer Segment
        </label>
        <span className="text-[11px] text-slate-500">
          Drives pricing elasticity & conversion uplift
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {segments.map((seg) => {
          const isSelected = selectedSegment?.id === seg.id;
          const IconComponent = iconMap[seg.icon] || Users;

          return (
            <div
              key={seg.id}
              onClick={() => onSelectSegment(seg)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                      {seg.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                  {seg.summary}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">
                  AOV: <strong className="text-slate-800">₹{seg.aov.toLocaleString('en-IN')}</strong>
                </span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  seg.elasticityCoefficient > 1.2
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {seg.elasticityCoefficient}x Elasticity
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
