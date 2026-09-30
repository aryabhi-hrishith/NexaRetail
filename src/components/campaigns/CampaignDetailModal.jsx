import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { CampaignStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Sparkles, Play, Pause, Trash2, Calendar, TrendingUp, Boxes, CheckCircle2 } from 'lucide-react';

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}) {
  const navigate = useNavigate();
  const { products, navigateToPlannerWith } = useApp();

  if (!campaign) return null;

  const matchedProduct = products.find((p) => p.id === campaign.productId);

  const revenueDisplay = campaign.actualRevenue || campaign.estimatedRevenue || 0;
  const profitDisplay = campaign.actualProfit || campaign.estimatedProfit || 0;
  const unitsDisplay = campaign.actualUnits || campaign.estimatedUnits || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign.name}
      subtitle={`Campaign ID: ${campaign.id} • Target Segment: ${campaign.targetSegmentName}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              onDelete(campaign.id);
              onClose();
            }}
          >
            Delete
          </Button>

          {campaign.status === 'active' && (
            <Button
              variant="secondary"
              size="sm"
              icon={Pause}
              onClick={() => {
                onUpdateStatus(campaign.id, 'paused');
                onClose();
              }}
            >
              Pause Campaign
            </Button>
          )}

          {campaign.status === 'paused' && (
            <Button
              variant="success"
              size="sm"
              icon={Play}
              onClick={() => {
                onUpdateStatus(campaign.id, 'active');
                onClose();
              }}
            >
              Resume Campaign
            </Button>
          )}

          {campaign.status === 'draft' && (
            <Button
              variant="success"
              size="sm"
              icon={Play}
              onClick={() => {
                onUpdateStatus(campaign.id, 'active');
                onClose();
              }}
            >
              Publish & Activate
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => {
              onClose();
              if (matchedProduct) {
                navigateToPlannerWith(
                  matchedProduct,
                  campaign.targetSegmentId,
                  campaign.discountPercent
                );
              }
              navigate('/planner');
            }}
          >
            Duplicate in Planner
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Status banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm text-slate-900">{campaign.productName}</h4>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-slate-500 font-mono">
              SKU: {campaign.sku} • Category: {campaign.category}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Discount Given
            </span>
            <span className="text-xl font-extrabold text-indigo-600 font-mono">
              {campaign.discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* Campaign Timeline & Notes */}
        <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Timeline: {campaign.startDate} to {campaign.endDate}</span>
          </div>
          <span className="text-indigo-700 font-mono text-[11px]">
            Target: 🎯 {campaign.targetSegmentName}
          </span>
        </div>

        {/* Performance Metrics Breakdown */}
        <div>
          <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-2">
            Financial & Volume Outcomes
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {campaign.status === 'completed' || campaign.status === 'active' ? 'Total Revenue Lift' : 'Estimated Revenue'}
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                ₹{revenueDisplay.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Gross Profit Realized
              </span>
              <span className="text-base font-bold font-mono text-emerald-600">
                ₹{profitDisplay.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Gross Profit Margin %
              </span>
              <span className="text-base font-bold font-mono text-indigo-700">
                {campaign.marginPercent}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Units Distributed
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {unitsDisplay} units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Inventory Impact
              </span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                {campaign.inventoryImpact || 'Safe warehouse stock balance'}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Notes */}
        {campaign.notes && (
          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-1">
              Campaign Notes & Insights
            </h5>
            <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed">
              {campaign.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
