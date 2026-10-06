import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SALES_TREND_DATA } from '../../services/mockData';

// Format currency tooltip
function SalesCustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-200 text-xs">
        <p className="font-bold text-slate-900 mb-2">{label}, 2026</p>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> Total Revenue:
            </span>
            <span className="font-bold text-slate-900">
              ₹{payload[0]?.value?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-violet-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-500" /> Promo Sales:
            </span>
            <span className="font-bold text-slate-900">
              ₹{payload[1]?.value?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Gross Profit:
            </span>
            <span className="font-bold text-slate-900">
              ₹{payload[2]?.value?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function SalesTrendChart() {
  const [range, setRange] = useState('30D');

  const filteredData = React.useMemo(() => {
    if (range === '7D') return SALES_TREND_DATA.slice(-3);
    if (range === '30D') return SALES_TREND_DATA;
    if (range === '90D') return SALES_TREND_DATA;
    return SALES_TREND_DATA;
  }, [range]);


  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue & Promotional Velocity Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total sales, promotional revenue lift, and gross margins over time
          </p>
        </div>

        {/* Date filter pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start text-xs font-semibold text-slate-600">
          {['7D', '30D', '90D', 'YTD'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg transition-all ${
                range === r
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPromo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<SalesCustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              name="Total Revenue"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              name="Promo Revenue"
              dataKey="promoRevenue"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPromo)"
            />
            <Area
              type="monotone"
              name="Gross Profit"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
