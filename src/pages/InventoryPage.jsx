import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StockStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProductDetailModal } from '../components/inventory/ProductDetailModal';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';
import {
  Boxes,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Eye,
  Edit,
  AlertTriangle,
  Plus,
  TrendingDown,
  RefreshCw,
  PackageCheck,
} from 'lucide-react';

export function InventoryPage() {
  const navigate = useNavigate();
  const { products, navigateToPlannerWith, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [sortField, setSortField] = useState('currentStock');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Modal states
  const [activeProduct, setActiveProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStockAdjustOpen, setIsStockAdjustOpen] = useState(false);

  // Extract categories
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  // Counts for status tabs
  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowCount = products.filter((p) => p.status === 'low').length;
  const criticalCount = products.filter((p) => p.status === 'critical').length;
  const outCount = products.filter((p) => p.status === 'out_of_stock').length;

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

      let matchStatus = true;
      if (selectedStatusTab === 'healthy') matchStatus = p.status === 'healthy';
      else if (selectedStatusTab === 'low') matchStatus = p.status === 'low';
      else if (selectedStatusTab === 'critical') matchStatus = p.status === 'critical';
      else if (selectedStatusTab === 'out_of_stock') matchStatus = p.status === 'out_of_stock';

      return matchSearch && matchCategory && matchStatus;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'margin') {
        valA = (a.sellingPrice - a.costPrice) / a.sellingPrice;
        valB = (b.sellingPrice - b.costPrice) / b.sellingPrice;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, selectedStatusTab, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Inventory & Catalog Alignment"
        subtitle="Manage product stock levels, monitor reorder thresholds, and identify eligible promotional surplus."
        breadcrumbs={['Home', 'Inventory']}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => addToast('Inventory Synced', 'All warehouse stock levels re-indexed.', 'info')}
          >
            Refresh Warehouse Feed
          </Button>
        }
      />

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total SKUs</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{products.length}</p>
          </div>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-700"><Boxes className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Healthy Stock</span>
            <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{healthyCount}</p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><PackageCheck className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Low Stock Buffer</span>
            <p className="text-xl font-extrabold text-amber-900 mt-0.5">{lowCount}</p>
          </div>
          <span className="p-2 rounded-xl bg-amber-100 text-amber-700"><TrendingDown className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Critical / Stockout</span>
            <p className="text-xl font-extrabold text-rose-900 mt-0.5">{criticalCount + outCount}</p>
          </div>
          <span className="p-2 rounded-xl bg-rose-100 text-rose-700"><AlertTriangle className="w-4 h-4" /></span>
        </div>
      </div>

      {/* Main Table Card with Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All Products (${products.length})` },
              { id: 'healthy', label: `Healthy (${healthyCount})` },
              { id: 'low', label: `Low Buffer (${lowCount})` },
              { id: 'critical', label: `Critical Risk (${criticalCount})` },
              { id: 'out_of_stock', label: `Out of Stock (${outCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatusTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, SKU, or category..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 sm:px-6">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                  onClick={() => handleSort('sellingPrice')}
                >
                  <span className="inline-flex items-center gap-1">
                    Price <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none"
                  onClick={() => handleSort('margin')}
                >
                  <span className="inline-flex items-center gap-1">
                    Margin % <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 select-none"
                  onClick={() => handleSort('currentStock')}
                >
                  <span className="inline-flex items-center gap-1">
                    Stock / Reorder <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-4 text-center">DOI / Run-rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedProducts.map((p) => {
                const marginPercent = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
                const doi = p.dailyVelocity > 0 ? Math.round(p.currentStock / p.dailyVelocity) : 0;
                const stockFillPercent = Math.min(100, Math.round((p.currentStock / (p.reorderThreshold * 2.5)) * 100));

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-slate-100 rounded-lg shrink-0">{p.image}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {marginPercent}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-mono font-bold ${
                          p.currentStock <= p.reorderThreshold ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {p.currentStock} <span className="text-slate-400 font-normal">/ {p.reorderThreshold}</span>
                        </span>
                        {/* Mini bar */}
                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.status === 'healthy' ? 'bg-emerald-500' : p.status === 'low' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${stockFillPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-600">
                      <span className="font-semibold text-slate-900">{doi}d</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{p.dailyVelocity}/day</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <StockStatusBadge status={p.status} />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveProduct(p);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View SKU Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveProduct(p);
                            setIsStockAdjustOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Adjust Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            navigateToPlannerWith(p);
                            navigate('/planner');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" /> Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAndSortedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No products found</p>
                    <p className="text-[11px]">Try adjusting your search terms or filter tabs.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredAndSortedProducts.length} of {products.length} products</span>
          <span className="font-mono text-[11px]">Stock synchronized with warehouse buffer</span>
        </div>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={activeProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenStockAdjust={(p) => {
          setActiveProduct(p);
          setIsStockAdjustOpen(true);
        }}
      />

      <StockAdjustmentModal
        product={activeProduct}
        isOpen={isStockAdjustOpen}
        onClose={() => setIsStockAdjustOpen(false)}
      />
    </div>
  );
}
