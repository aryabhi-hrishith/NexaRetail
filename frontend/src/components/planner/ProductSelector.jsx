import React, { useState } from 'react';
import { Search, ChevronDown, Check, Boxes } from 'lucide-react';
import { StockStatusBadge } from '../common/Badge';

export function ProductSelector({
  products,
  selectedProduct,
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Extract unique categories
  const categories = ['All Categories', ...new Set(products.map((p) => p.category))];

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          1. Select Product for Promotion
        </label>
        <span className="text-[11px] text-slate-500">
          {products.length} catalog items
        </span>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Product Card / Dropdown Trigger */}
      <div className="relative">
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
        >
          {selectedProduct ? (
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl p-1 bg-white rounded-lg border border-slate-200/60 shadow-xs shrink-0">
                {selectedProduct.image}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {selectedProduct.name}
                  </h4>
                  <StockStatusBadge status={selectedProduct.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                  <span>SKU: {selectedProduct.sku}</span>
                  <span>•</span>
                  <span>Cost: ₹{selectedProduct.costPrice.toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span className="text-slate-900 font-bold">MRP: ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-slate-400" />
              <span>Click to select a product from catalog</span>
            </div>
          )}

          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
            {/* Search input */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name, SKU or keyword..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                autoFocus
              />
            </div>

            {/* Product List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const isCritical = p.status === 'critical' || p.status === 'out_of_stock';

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      setDropdownOpen(false);
                    }}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{p.image}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {p.name}
                          </p>
                          {isCritical && (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-bold">
                              Stock Alert
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>{p.sku}</span>
                          <span>•</span>
                          <span>Stock: {p.currentStock}</span>
                          <span>•</span>
                          <span>Margin: {(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 font-mono block">
                        ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 ml-auto mt-0.5" />}
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No products matched your search.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Snapshot strip */}
      {selectedProduct && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Unit Cost (COGS)
            </span>
            <span className="text-sm font-bold font-mono text-slate-800">
              ₹{selectedProduct.costPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Baseline Gross Margin
            </span>
            <span className="text-sm font-bold font-mono text-emerald-600">
              {(((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.sellingPrice) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Available Physical Stock
            </span>
            <span className={`text-sm font-bold font-mono ${
              selectedProduct.currentStock <= selectedProduct.reorderThreshold ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {selectedProduct.currentStock} units
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Daily Run Rate
            </span>
            <span className="text-sm font-bold font-mono text-slate-800">
              {selectedProduct.dailyVelocity} units/day
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
