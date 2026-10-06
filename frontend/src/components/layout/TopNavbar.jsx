import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Menu,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

export function TopNavbar({ setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    products,
    campaigns,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    navigateToPlannerWith,
    settings,
    apiStatus,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title and description
  const pageTitles = {
    '/': { title: 'Executive Dashboard', subtitle: 'Overview of retail performance, AI recommendations, and inventory risks' },
    '/planner': { title: 'Promotion Planner', subtitle: 'Simulate price elasticity, margin impact, and inventory feasibility' },
    '/inventory': { title: 'Inventory Alignment', subtitle: 'Monitor stock levels, reorder thresholds, and demand projections' },
    '/customers': { title: 'Customer Segment Insights', subtitle: 'Analyze purchasing behaviors, AOV, and price elasticity' },
    '/campaigns': { title: 'Campaign History', subtitle: 'Track historical performance, active promotions, and drafts' },
    '/settings': { title: 'Store Settings', subtitle: 'Configure margin thresholds, safety buffers, and currency standards' },
  };

  const currentMeta = pageTitles[location.pathname] || {
    title: 'OptiAlign Dashboard',
    subtitle: 'Retail Optimization Platform',
  };

  // Search Results
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredCampaigns = searchQuery.trim()
    ? campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.productName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {currentMeta.title}
            </h1>
            <p className="hidden md:block text-xs text-slate-500 truncate">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions: Global Search, Quick Planner, Notification & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* API Connection Status Pill */}
          {apiStatus === 'ready' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          {apiStatus === 'error' && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Offline
            </span>
          )}
          {(apiStatus === 'loading' || apiStatus === 'idle') && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
              …
            </span>
          )}
          {/* Global Search Bar with Live Results */}
          <div className="relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products, SKUs, campaigns..."
                className="w-40 sm:w-64 md:w-72 pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Search Results for "{searchQuery}"
                  </span>
                  <span>{filteredProducts.length + filteredCampaigns.length} found</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {/* Products Section */}
                  {filteredProducts.length > 0 && (
                    <div className="p-2">
                      <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Products ({filteredProducts.length})
                      </span>
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            navigateToPlannerWith(prod);
                            navigate('/planner');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl shrink-0">{prod.image}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {prod.sku} • Stock: {prod.currentStock}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 shrink-0">
                            ₹{prod.sellingPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campaigns Section */}
                  {filteredCampaigns.length > 0 && (
                    <div className="p-2">
                      <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Campaigns ({filteredCampaigns.length})
                      </span>
                      {filteredCampaigns.map((camp) => (
                        <div
                          key={camp.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            navigate('/campaigns');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {camp.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {camp.productName} • {camp.discountPercent}% OFF
                            </p>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {camp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProducts.length === 0 && filteredCampaigns.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No matching products or campaigns found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button: New Promotion */}
          <Button
            size="sm"
            variant="primary"
            icon={Sparkles}
            onClick={() => navigate('/planner')}
            className="hidden sm:inline-flex"
          >
            New Promotion
          </Button>

          {/* Currency Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>₹ INR ({settings.currency})</span>
          </div>

          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Alerts & Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                          !notif.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'danger' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 block" />
                          )}
                          {notif.type === 'warning' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                          )}
                          {notif.type === 'success' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                          )}
                          {notif.type === 'info' && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications to display.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AB
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Aryan B.</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    aryan.b@apexretail.in
                  </p>
                  <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Lead Merchandise Planner
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Store Configuration
                  </Link>
                  <Link
                    to="/campaigns"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    My Campaigns
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
