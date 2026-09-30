import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CampaignStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ArrowUpRight, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export function RecentActivityFeed() {
  const { campaigns } = useApp();
  const navigate = useNavigate();

  const recentCampaigns = [...campaigns].slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Campaign Lifecycle
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live promotions, execution status, and gross revenues
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={ArrowUpRight}
            iconPosition="right"
            onClick={() => navigate('/campaigns')}
          >
            History
          </Button>
        </div>

        <div className="space-y-3">
          {recentCampaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => navigate('/campaigns')}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {camp.name}
                  </span>
                  <CampaignStatusBadge status={camp.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 truncate">
                  <span>{camp.productName}</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-semibold">{camp.discountPercent}% OFF</span>
                  <span>•</span>
                  <span>🎯 {camp.targetSegmentName}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 font-mono block">
                  ₹{((camp.actualRevenue || camp.estimatedRevenue || 0) / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {camp.marginPercent}% margin
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{campaigns.filter((c) => c.status === 'active').length} active promotions currently running</span>
        <span className="font-semibold text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate('/campaigns')}>
          View all campaigns →
        </span>
      </div>
    </div>
  );
}
