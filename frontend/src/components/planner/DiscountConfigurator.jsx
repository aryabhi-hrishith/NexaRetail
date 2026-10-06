import React from 'react';
import { Percent, Calendar, Tag } from 'lucide-react';

export function DiscountConfigurator({
  campaignName,
  onChangeCampaignName,
  discountPercent,
  onChangeDiscount,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  durationDays,
}) {
  const quickDiscountPresets = [5, 10, 15, 20, 25, 30, 40];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          3. Campaign Parameters & Discount
        </label>
        <span className="text-[11px] text-slate-500">
          Duration: {durationDays} days
        </span>
      </div>

      {/* Campaign Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Campaign Name
        </label>
        <div className="relative">
          <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={campaignName}
            onChange={(e) => onChangeCampaignName(e.target.value)}
            placeholder="e.g. Festive Audio Surge Q4"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Interactive Discount Selector */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-indigo-600" />
            Discount Percentage Offered
          </span>
          <span className="text-lg font-extrabold text-indigo-600 font-mono">
            {discountPercent}% OFF
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={discountPercent}
          onChange={(e) => onChangeDiscount(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
          {quickDiscountPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeDiscount(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                discountPercent === preset
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
