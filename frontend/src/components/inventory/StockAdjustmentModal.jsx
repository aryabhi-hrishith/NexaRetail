import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Check, Plus, Minus } from 'lucide-react';

export function StockAdjustmentModal({ product, isOpen, onClose }) {
  const { updateProductStock } = useApp();
  const [stockVal, setStockVal] = useState(0);

  // Sync state when modal opens for a new product
  useEffect(() => {
    if (isOpen && product) {
      setStockVal(product.currentStock);
    }
  }, [isOpen, product?.id, product?.currentStock]);

  if (!product) return null;

  const handleSave = () => {
    updateProductStock(product.id, stockVal);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock Level"
      subtitle={`Update physical inventory for ${product.name}`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={Check} onClick={handleSave}>
            Save Stock Adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-3xl p-1 bg-white rounded-lg border">{product.image}</span>
          <div>
            <h4 className="font-bold text-slate-900">{product.name}</h4>
            <p className="text-slate-500 font-mono">SKU: {product.sku}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            New Available Physical Stock
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStockVal((prev) => Math.max(0, prev - 10))}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="0"
              value={stockVal}
              onChange={(e) => setStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full text-center text-lg font-bold font-mono py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setStockVal((prev) => prev + 50)}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Reorder Threshold: <strong>{product.reorderThreshold} units</strong></span>
            <span>Current: <strong>{product.currentStock} units</strong></span>
          </div>
        </div>

        {/* Quick Replenishment chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
            Quick Replenishment Batch:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {[+25, +50, +100, +250].map((batch) => (
              <button
                key={batch}
                type="button"
                onClick={() => setStockVal((prev) => prev + batch)}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-colors"
              >
                +{batch} units
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
