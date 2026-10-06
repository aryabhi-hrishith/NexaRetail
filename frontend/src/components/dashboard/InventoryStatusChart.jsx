import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function InventoryStatusChart() {
  const { products } = useApp();
  const navigate = useNavigate();

  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowCount = products.filter((p) => p.status === 'low').length;
  const criticalCount = products.filter((p) => p.status === 'critical').length;
  const outCount = products.filter((p) => p.status === 'out_of_stock').length;

  const data = [
    { name: 'Healthy Stock', value: healthyCount, color: '#10b981', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
    { name: 'Low Stock', value: lowCount, color: '#f59e0b', textColor: 'text-amber-700', bg: 'bg-amber-50' },
    { name: 'Critical Risk', value: criticalCount, color: '#f43f5e', textColor: 'text-rose-700', bg: 'bg-rose-50' },
    { name: 'Out of Stock', value: outCount, color: '#94a3b8', textColor: 'text-slate-700', bg: 'bg-slate-100' },
  ];

  const totalProducts = products.length;
  const atRiskTotal = lowCount + criticalCount + outCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Inventory Health Alignment
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalProducts} SKUs Monitored
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Real-time catalog stock status & supply chain buffer distribution
        </p>

        {/* Donut Chart with Center Stat */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val, name) => [`${val} Products`, name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {Math.round((healthyCount / totalProducts) * 100)}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
              Healthy Stock
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Badges / Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div
            key={item.name}
            onClick={() => navigate('/inventory')}
            className={`p-2 rounded-xl flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity ${item.bg}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className={`text-xs font-semibold ${item.textColor}`}>{item.name}</span>
            </div>
            <span className={`text-xs font-mono font-bold ${item.textColor}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
