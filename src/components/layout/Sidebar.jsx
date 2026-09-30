import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Boxes,
  Users,
  History,
  Settings,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const { products, campaigns } = useApp();

  // Calculate dynamic alerts
  const lowOrCriticalStockCount = products.filter(
    (p) => p.status === 'critical' || p.status === 'out_of_stock' || p.status === 'low'
  ).length;

  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Promotion Planner',
      path: '/planner',
      icon: Sparkles,
      badge: 'AI Engine',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      badge: lowOrCriticalStockCount > 0 ? `${lowOrCriticalStockCount} alerts` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      name: 'Customer Insights',
      path: '/customers',
      icon: Users,
      badge: null,
    },
    {
      name: 'Campaign History',
      path: '/campaigns',
      icon: History,
      badge: activeCampaignsCount > 0 ? `${activeCampaignsCount} live` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-200 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                OptiAlign
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-medium">
              Promotion & Inventory AI
            </p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Live Sync Status & System Guard */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Inventory Guard
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Automated stockout simulation & margin protection active.
        </p>
      </div>

      {/* User / Store Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#080E21] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-700 text-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
            AP
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              Apex Retail India
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Bangalore Hub (Omni)
            </div>
          </div>
        </div>
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Store Settings"
        >
          <Settings className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
