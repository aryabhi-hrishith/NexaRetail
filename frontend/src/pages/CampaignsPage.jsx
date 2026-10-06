import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { CampaignStatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CampaignDetailModal } from '../components/campaigns/CampaignDetailModal';
import {
  History,
  Search,
  Sparkles,
  Eye,
  Trash2,
  Play,
  Plus,
  Calendar,
  IndianRupee,
  Percent,
} from 'lucide-react';

export function CampaignsPage() {
  const navigate = useNavigate();
  const {
    campaigns,
    updateCampaignStatus,
    deleteCampaign,
    navigateToPlannerWith,
    products,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Status counts
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const scheduledCount = campaigns.filter((c) => c.status === 'scheduled').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;
  const draftCount = campaigns.filter((c) => c.status === 'draft').length;

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.targetSegmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sku.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (selectedStatusTab === 'active') matchesStatus = c.status === 'active';
      else if (selectedStatusTab === 'scheduled') matchesStatus = c.status === 'scheduled';
      else if (selectedStatusTab === 'completed') matchesStatus = c.status === 'completed';
      else if (selectedStatusTab === 'draft') matchesStatus = c.status === 'draft';

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, selectedStatusTab]);

  // Aggregate totals
  const totalCampaignRevenue = campaigns.reduce(
    (sum, c) => sum + (c.actualRevenue || c.estimatedRevenue || 0),
    0
  );
  const totalCampaignProfit = campaigns.reduce(
    (sum, c) => sum + (c.actualProfit || c.estimatedProfit || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Campaign Portfolio & Performance History"
        subtitle="Review active promotional pipelines, historical financial ROI, and customer segment outcomes."
        breadcrumbs={['Home', 'Campaign History']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/planner')}
          >
            Create New Campaign
          </Button>
        }
      />

      {/* Aggregate Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Campaigns</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{campaigns.length}</p>
          </div>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-700"><History className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Cumulative Revenue</span>
            <p className="text-xl font-extrabold text-indigo-950 font-mono mt-0.5">
              ₹{(totalCampaignRevenue / 100000).toFixed(1)}L
            </p>
          </div>
          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700"><IndianRupee className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Gross Profit Lift</span>
            <p className="text-xl font-extrabold text-emerald-900 font-mono mt-0.5">
              ₹{(totalCampaignProfit / 100000).toFixed(1)}L
            </p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Percent className="w-4 h-4" /></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Active</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activeCount} Running</p>
          </div>
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Play className="w-4 h-4" /></span>
        </div>
      </div>

      {/* Campaigns Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All (${campaigns.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'scheduled', label: `Scheduled (${scheduledCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
              { id: 'draft', label: `Drafts (${draftCount})` },
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

          {/* Search Row */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns, products, segments..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 sm:px-6">Campaign & Timeline</th>
                <th className="py-3 px-4">Target Product & SKU</th>
                <th className="py-3 px-4">Target Segment</th>
                <th className="py-3 px-4 text-center">Discount</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((camp) => {
                const revenue = camp.actualRevenue || camp.estimatedRevenue || 0;
                const profit = camp.actualProfit || camp.estimatedProfit || 0;

                return (
                  <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {camp.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {camp.startDate} → {camp.endDate}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{camp.productName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{camp.sku}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {camp.targetSegmentName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold font-mono text-slate-900">
                        {camp.discountPercent}% OFF
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{revenue.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-600 block">
                        ₹{profit.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {camp.marginPercent}% margin
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <CampaignStatusBadge status={camp.status} />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveCampaign(camp);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Campaign Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const matchedProd = products.find((p) => p.id === camp.productId);
                            if (matchedProd) {
                              navigateToPlannerWith(
                                matchedProd,
                                camp.targetSegmentId,
                                camp.discountPercent
                              );
                            }
                            navigate('/planner');
                          }}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate in Planner"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCampaign(camp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No campaigns found</p>
                    <p className="text-[11px]">Create a new promotion or adjust your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        campaign={activeCampaign}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={updateCampaignStatus}
        onDelete={deleteCampaign}
      />
    </div>
  );
}
