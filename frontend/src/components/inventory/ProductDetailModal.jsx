import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { StockStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Sparkles, Edit, AlertTriangle, CheckCircle2, Clock, Truck, TrendingUp } from 'lucide-react';

export function ProductDetailModal({ product, isOpen, onClose, onOpenStockAdjust }) {
  const navigate = useNavigate();
  const { navigateToPlannerWith } = useApp();

  if (!product) return null;

  const marginPercent = (
    ((product.sellingPrice - product.costPrice) / product.sellingPrice) *
    100
  ).toFixed(1);

  const daysOfSupply = product.dailyVelocity > 0
    ? Math.round(product.currentStock / product.dailyVelocity)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Category: ${product.category}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={() => {
              onClose();
              onOpenStockAdjust(product);
            }}
          >
            Adjust Stock
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => {
              onClose();
              navigateToPlannerWith(product);
              navigate('/planner');
            }}
          >
            Launch Promotion in Planner
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Top Product Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
          <span className="text-4xl p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
            {product.image}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-bold text-sm text-slate-900">{product.name}</h4>
              <StockStatusBadge status={product.status} />
            </div>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Unit Economics Grid */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
            Unit Economics & Pricing Structure
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Cost Price (COGS)
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                ₹{product.costPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Selling Price (MRP)
              </span>
              <span className="text-sm font-bold font-mono text-indigo-700">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Unit Gross Margin
              </span>
              <span className="text-sm font-bold font-mono text-emerald-600">
                {marginPercent}%
              </span>
              <span className="text-[10px] text-slate-400 block">
                ₹{(product.sellingPrice - product.costPrice).toLocaleString('en-IN')}/unit
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Supplier Lead Time
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {product.leadTimeDays} days
              </span>
            </div>
          </div>
        </div>

        {/* Inventory & Demand Dynamics */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
            Inventory Dynamics & Run-Rate
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Available Stock
              </span>
              <span className={`text-base font-bold font-mono ${
                product.currentStock <= product.reorderThreshold ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {product.currentStock} units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Reorder Threshold
              </span>
              <span className="text-base font-bold font-mono text-slate-800">
                {product.reorderThreshold} units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Estimated Days of Supply
              </span>
              <span className={`text-base font-bold font-mono ${
                daysOfSupply < 7 ? 'text-rose-600' : 'text-emerald-700'
              }`}>
                {daysOfSupply} days remaining
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Recommendation Verdict */}
        {product.status === 'critical' || product.status === 'out_of_stock' ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Urgent Restock Action Recommended</span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                Stock is at or near zero with daily demand velocity of {product.dailyVelocity} units/day. Restock purchase order must be issued before enabling marketing promotions.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Eligible for Promotional Campaign</span>
              <p className="text-[11px] mt-0.5 leading-relaxed">
                Inventory buffer is above the safety threshold. You can simulate discounts up to 25% without risking supply shortages.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
