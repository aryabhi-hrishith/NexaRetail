import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import {
  Users,
  Crown,
  Repeat,
  Calendar,
  Zap,
  UserMinus,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export function CustomersPage() {
  const navigate = useNavigate();
  const { segments, products, navigateToPlannerWith } = useApp();

  const iconMap = {
    Repeat: Repeat,
    Crown: Crown,
    Calendar: Calendar,
    Zap: Zap,
    UserMinus: UserMinus,
  };

  // Pie chart data for customer distribution
  const pieColors = ['#10b981', '#6366f1', '#3b82f6', '#f59e0b', '#f43f5e'];
  const distributionData = segments.map((s, idx) => ({
    name: s.name,
    value: s.customerCount,
    share: s.customerSharePercent,
    color: pieColors[idx % pieColors.length],
  }));

  // Bar chart data for spending behavior
  const spendingData = segments.map((s) => ({
    name: s.name.split(' ')[0], // short name
    fullName: s.name,
    aov: s.aov,
    annualOrders: s.annualOrders,
    annualSpend: Math.round(s.aov * s.annualOrders),
    elasticity: s.elasticityCoefficient,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Customer Segment Insights & Behavioral Analytics"
        subtitle="Understand shopper price sensitivity, purchase cadence, and tailor personalized discount incentives."
        breadcrumbs={['Home', 'Customer Insights']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/planner')}
          >
            Launch Segment Campaign
          </Button>
        }
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Customer Base Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Cohort Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              117,500 total active customer profiles across retail touchpoints
            </p>

            <div className="relative h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val, name) => [`${val.toLocaleString('en-IN')} Customers`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Pie
                    data={distributionData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 leading-none">
                  1.18 Lakh
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                  Active Shoppers
                </span>
              </div>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 truncate max-w-[180px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-900 font-bold">{item.share}%</span>
                  <span className="text-slate-400">({(item.value / 1000).toFixed(1)}k)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Annual Spend & AOV Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Annual Spend Velocity & Basket Size (AOV)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of average ticket value vs cumulative annual customer spend (₹)
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendingData}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [`₹${val.toLocaleString('en-IN')}`, name === 'aov' ? 'Avg Order Value' : 'Est. Annual Spend']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />
                <Bar name="Avg Order Value (AOV)" dataKey="aov" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar name="Est. Annual Spend" dataKey="annualSpend" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segment Detailed Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Cohorts & Promotion Elasticity Profiles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed behavioral metrics and recommended promotional playbooks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map((seg) => {
            const IconComponent = iconMap[seg.icon] || Users;

            return (
              <div
                key={seg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <IconComponent className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{seg.name}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {seg.customerCount.toLocaleString('en-IN')} shoppers ({seg.customerSharePercent}%)
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${seg.badgeColor}`}>
                      {seg.elasticityCoefficient}x Elasticity
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
                    {seg.summary}
                  </p>

                  {/* Metrics Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Average Order Value
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        ₹{seg.aov.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Purchase Frequency
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {seg.annualOrders} orders/yr
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Repeat Retention
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-600">
                        {seg.retentionRate}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Margin Tolerance
                      </span>
                      <span className="text-sm font-bold text-indigo-700">
                        {seg.marginTolerance}
                      </span>
                    </div>
                  </div>

                  {/* Category Affinities */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Top Category Affinities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {seg.preferredCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strategy recommendation */}
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
                      💡 Recommended Promo Strategy:
                    </span>
                    <p className="text-[11px] text-indigo-950 leading-relaxed">
                      {seg.recommendedPromoStrategy}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <Button
                  size="sm"
                  variant="outline"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full"
                  onClick={() => {
                    navigateToPlannerWith(products[0], seg.id, 15);
                    navigate('/planner');
                  }}
                >
                  Target in Promotion Planner
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
