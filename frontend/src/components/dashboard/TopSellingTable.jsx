import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StockStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export function TopSellingTable() {
  const { products, navigateToPlannerWith } = useApp();
  const navigate = useNavigate();

  // Sort top products by monthly units sold
  const topProducts = [...products]
    .sort((a, b) => (b.historicalMonthlyUnits || 0) - (a.historicalMonthlyUnits || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Top-Velocity Catalog Products
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Highest turnover SKUs, stock buffers, and promotional opportunities
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          icon={ArrowUpRight}
          iconPosition="right"
          onClick={() => navigate('/inventory')}
        >
          View All ({products.length})
        </Button>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Product & SKU</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold text-right">Price</th>
              <th className="pb-3 font-semibold text-right">30D Volume</th>
              <th className="pb-3 font-semibold text-center">Stock Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0 p-1 bg-slate-100 rounded-lg">{product.image}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-slate-600 font-medium">
                  {product.category}
                </td>
                <td className="py-3.5 pr-4 text-right font-bold text-slate-900 font-mono">
                  ₹{product.sellingPrice.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 pr-4 text-right font-medium text-slate-700">
                  <span className="font-bold text-slate-900">{product.historicalMonthlyUnits}</span> units
                </td>
                <td className="py-3.5 pr-4 text-center">
                  <StockStatusBadge status={product.status} />
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => {
                      navigateToPlannerWith(product);
                      navigate('/planner');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Plan Promo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
