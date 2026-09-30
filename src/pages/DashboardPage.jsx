import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import { SalesTrendChart } from '../components/dashboard/SalesTrendChart';
import { InventoryStatusChart } from '../components/dashboard/InventoryStatusChart';
import { AiRecommendationCard } from '../components/dashboard/AiRecommendationCard';
import { TopSellingTable } from '../components/dashboard/TopSellingTable';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import {
  IndianRupee,
  Percent,
  Sparkles,
  AlertOctagon,
  TrendingUp,
  Boxes,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { products, campaigns, aiRecommendations, settings, addToast } = useApp();

  // Aggregate metrics
  const totalRevenue = 2845200;
  const estimatedProfit = 1128400;
  const grossMarginPercent = Number(((estimatedProfit / totalRevenue) * 100).toFixed(1));

  const activePromotionsCount = campaigns.filter((c) => c.status === 'active').length;
  const scheduledCount = campaigns.filter((c) => c.status === 'scheduled').length;

  const stockoutRiskProducts = products.filter(
    (p) => p.status === 'critical' || p.status === 'out_of_stock' || p.status === 'low'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="Executive Retail Dashboard"
        subtitle="AI-driven demand forecast, pricing elasticity simulation, and supply chain stockout guardrails."
        breadcrumbs={['Home', 'Dashboard']}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => addToast('Data Refreshed', 'Catalog metrics synced with live inventory.', 'info')}
            >
              Sync Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/planner')}
            >
              Plan New Promotion
            </Button>
          </>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Net Revenue"
          value="₹28,45,200"
          subtitle="Target: ₹26,00,000"
          trend="+14.2%"
          trendDirection="up"
          trendLabel="vs last month"
          icon={IndianRupee}
          variant="primary"
        />

        <MetricCard
          title="Est. Gross Profit"
          value="₹11,28,400"
          subtitle={`${grossMarginPercent}% Gross Margin`}
          trend="+8.6%"
          trendDirection="up"
          trendLabel="vs last month"
          icon={Percent}
          variant="success"
        />

        <MetricCard
          title="Active Promotions"
          value={activePromotionsCount.toString()}
          subtitle={`${scheduledCount} scheduled upcoming`}
          trend={`${campaigns.length} total`}
          trendDirection="neutral"
          trendLabel="in pipeline"
          icon={Sparkles}
          variant="default"
          onClick={() => navigate('/campaigns')}
        />

        <MetricCard
          title="Stockout Risk SKUs"
          value={stockoutRiskProducts.length.toString()}
          subtitle="Requires attention before promo"
          trend={`${products.filter((p) => p.status === 'critical').length} Critical`}
          trendDirection="down"
          trendLabel="suppressed"
          icon={AlertOctagon}
          variant="danger"
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* AI Recommendation Engine Highlights */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              AI-Generated Promotion Recommendations
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Simulated Engine
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Deterministic elasticity & inventory guardrail model
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {aiRecommendations.map((rec) => (
            <AiRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalesTrendChart />
        </div>
        <div className="lg:col-span-1">
          <InventoryStatusChart />
        </div>
      </div>

      {/* Tables and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TopSellingTable />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
