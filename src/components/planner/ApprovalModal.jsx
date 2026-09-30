import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  campaignData,
  simulation,
}) {
  if (!campaignData || !simulation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Campaign Approval"
      subtitle="Final review of promotion parameters and inventory allocation"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Back to Editor
          </Button>
          <Button
            variant="success"
            size="sm"
            icon={CheckCircle2}
            onClick={onConfirm}
          >
            Approve & Schedule Campaign
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Campaign Name:</span>
            <span className="font-bold text-slate-900">{campaignData.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Target Product:</span>
            <span className="font-bold text-slate-900">{campaignData.productName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Customer Segment:</span>
            <span className="font-bold text-indigo-700">{campaignData.targetSegmentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Discount Rate:</span>
            <span className="font-mono font-bold text-indigo-600">{campaignData.discountPercent}% OFF (₹{simulation.promoPrice.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Dates:</span>
            <span className="font-mono text-slate-700">{campaignData.startDate} to {campaignData.endDate}</span>
          </div>
        </div>

        {/* Financial & Stock Impact Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-[10px] uppercase font-bold text-indigo-700 block">
              Estimated Revenue
            </span>
            <span className="text-base font-bold font-mono text-indigo-950">
              ₹{simulation.promoRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-indigo-600 block mt-0.5">
              {simulation.estimatedUnits} units projected
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              Estimated Profit
            </span>
            <span className="text-base font-bold font-mono text-emerald-950">
              ₹{simulation.promoProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              {simulation.promoMarginPercent}% gross margin
            </span>
          </div>
        </div>

        {/* Guardrail Check Confirmation */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Automated Guardrails Passed</span>
            <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
              Inventory buffer meets safety policy and profit margin exceeds the minimum threshold. Approving will publish this campaign to active history.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
