import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { INITIAL_SETTINGS } from '../services/mockData';
import {
  Settings,
  ShieldCheck,
  Percent,
  Boxes,
  IndianRupee,
  Save,
  RotateCcw,
  CheckCircle2,
  Bell,
  Building2,
} from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings, addToast } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = (e) => {
    e?.preventDefault();
    updateSettings(formData);
    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData({ ...INITIAL_SETTINGS });
    updateSettings(INITIAL_SETTINGS);
    setIsDirty(false);
    addToast('Reset Complete', 'Default business settings restored.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <PageHeader
        title="Business Rules & Store Configuration"
        subtitle="Manage inventory safety buffers, minimum gross margin floors, and promotion guardrails."
        breadcrumbs={['Home', 'Settings']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store & Organization Identity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Store Identity & Operational Region
              </h3>
              <p className="text-xs text-slate-500">
                Business metadata applied across reporting exports and alerts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store / Entity Name
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store ID / Warehouse Node
              </label>
              <input
                type="text"
                value={formData.storeId}
                onChange={(e) => handleChange('storeId', e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Regional Hub
              </label>
              <input
                type="text"
                value={formData.primaryRegion}
                onChange={(e) => handleChange('primaryRegion', e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Standard
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Margin & Profitability Floors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Percent className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Margin Thresholds & Profitability Protection
              </h3>
              <p className="text-xs text-slate-500">
                Establishes minimum gross margin floors for all promotion approvals
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Minimum Gross Margin Floor (%)
                </label>
                <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {formData.minGrossMarginThreshold}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Promotions resulting in a gross margin lower than this threshold will be flagged with a warning in the Promotion Planner.
              </p>
              <input
                type="range"
                min="5"
                max="40"
                step="0.5"
                value={formData.minGrossMarginThreshold}
                onChange={(e) => handleChange('minGrossMarginThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>5% (Aggressive Clearance)</span>
                <span>18% (Standard Retail)</span>
                <span>40% (High Premium)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Inventory Buffer & Supply Chain Policies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Boxes className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inventory Safety Buffers & Stockout Guardrails
              </h3>
              <p className="text-xs text-slate-500">
                Controls the reserve percentage of stock shielded from promotional spikes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Default Inventory Safety Buffer (%)
                </label>
                <span className="text-sm font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                  {formData.defaultSafetyBufferPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Percentage of available stock preserved to serve organic daily walk-in / baseline demand without running out.
              </p>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={formData.defaultSafetyBufferPercent}
                onChange={(e) => handleChange('defaultSafetyBufferPercent', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>5% (Lean)</span>
                <span>20% (Balanced)</span>
                <span>50% (High Safety)</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Toggle: Auto Guardrails */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Enforce Automated Stockout Guardrail
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Strictly disallow campaign approval if projected demand causes a complete stockout or violates the margin floor.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.autoGuardrailsEnabled}
                  onChange={(e) => handleChange('autoGuardrailsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Toggle: Low Stock Email Alerts */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Stockout Alert Push Notifications
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Send high-priority alerts to merchandise planners when any promo SKU drops below reorder threshold.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.emailAlertsOnStockout}
                  onChange={(e) => handleChange('emailAlertsOnStockout', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleReset}
          >
            Cancel / Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={CheckCircle2}
            type="submit"
            disabled={!isDirty}
          >
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
