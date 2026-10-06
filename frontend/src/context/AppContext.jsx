import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_SEGMENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_SETTINGS,
} from '../services/mockData';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Products state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('optialign_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Customer segments
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);

  // Campaigns state
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('optialign_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  // AI recommendations state
  const [aiRecommendations, setAiRecommendations] = useState(INITIAL_AI_RECOMMENDATIONS);

  // Business settings state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('optialign_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Planner prefill state (for 1-click launch from other pages)
  const [plannerPrefill, setPlannerPrefill] = useState(null);

  // ── Backend API integration ────────────────────────────────────────────
  // 'idle' | 'loading' | 'ready' | 'error'
  const [apiStatus, setApiStatus] = useState('idle');
  // Raw data from the backend (null until loaded)
  const [apiData, setApiData] = useState(null);

  const fetchLiveData = useCallback(async () => {
    setApiStatus('loading');
    try {
      // Fire all requests concurrently
      const [overview, productsRaw, segmentsRaw, promotionsRaw, salesRaw] =
        await Promise.all([
          api.getOverview(),
          api.getProducts(),
          api.getCustomerSegments(),
          api.getPromotions(),
          api.getSalesDaily(),
        ]);

      // Normalise products from backend shape → frontend shape
      const liveProducts = productsRaw.map((p) => ({
        id: p.product_id,
        sku: p.product_id,
        name: p.product_name,
        category: p.category,
        sellingPrice: p.price,
        costPrice: p.cost,
        currentStock: p.stock_qty,
        reorderThreshold: Math.round(p.forecast_7d * 1.5) || 20,
        dailyVelocity: parseFloat((p.forecast_7d / 7).toFixed(1)),
        leadTimeDays: 7,
        status:
          p.stock_risk === 'High'
            ? 'critical'
            : p.stock_risk === 'Medium'
            ? 'low'
            : 'healthy',
        stockRisk: p.stock_risk,
        forecast7d: p.forecast_7d,
        marginPct: p.margin_pct,
        // Keep a few fields that pages use from mock data
        image: '📦',
        rating: 4.0,
        reviewCount: 0,
      }));

      // Store all raw API data for pages that want to use it directly
      setApiData({
        overview,
        products: productsRaw,
        segments: segmentsRaw,
        promotions: promotionsRaw,
        salesDaily: salesRaw,
      });

      // Update React state — pages read from context as before
      setProducts(liveProducts);

      setApiStatus('ready');
      console.info('[NexaRetail] Live backend data loaded successfully.');
    } catch (err) {
      console.warn('[NexaRetail] Backend unreachable — using mock data.', err.message);
      setApiStatus('error');
    }
  }, []);

  // Attempt to load live data once on mount
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Notifications center
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Critical Stock Alert',
      message: 'OnePlus Nord Buds 3 Pro has only 12 units remaining (below critical threshold).',
      type: 'danger',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Stockout Hazard Blocked',
      message: 'Promotion on Philips Air Fryer was flagged due to imminent stockout risk.',
      type: 'warning',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Campaign Approved',
      message: 'Summer Linen & Ethnic Carnival campaign is now Active with 142 units sold.',
      type: 'success',
      time: '3 hours ago',
      read: true,
    }
  ]);

  // Persist key states
  useEffect(() => {
    localStorage.setItem('optialign_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('optialign_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('optialign_settings', JSON.stringify(settings));
  }, [settings]);

  // Helper for adding toast
  const addToast = (title, message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add or Approve Campaign
  const approveCampaign = (campaignData) => {
    const newCampaign = {
      ...campaignData,
      id: campaignData.id || `camp-${Date.now()}`,
      status: campaignData.status || 'active',
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    
    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Campaign Approved',
        message: `Campaign "${newCampaign.name}" for ${newCampaign.productName} has been approved and scheduled.`,
        type: 'success',
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    addToast('Campaign Approved', `"${newCampaign.name}" is now live in the system.`, 'success');
    return newCampaign;
  };

  // Save Draft Campaign
  const saveDraftCampaign = (campaignData) => {
    const draft = {
      ...campaignData,
      id: campaignData.id || `camp-draft-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [draft, ...prev]);
    addToast('Draft Saved', `Campaign "${draft.name}" saved as draft.`, 'info');
    return draft;
  };

  // Update campaign status (e.g. pause, activate, complete)
  const updateCampaignStatus = (id, newStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    addToast('Campaign Updated', `Status changed to ${newStatus}.`, 'info');
  };

  // Delete campaign
  const deleteCampaign = (id) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    addToast('Campaign Deleted', 'Campaign record removed.', 'info');
  };

  // Update product stock
  const updateProductStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const stockNum = Math.max(0, parseInt(newStock, 10) || 0);
        let newStatus = 'healthy';
        if (stockNum === 0) newStatus = 'out_of_stock';
        else if (stockNum <= p.reorderThreshold * 0.5) newStatus = 'critical';
        else if (stockNum <= p.reorderThreshold * 1.5) newStatus = 'low';

        return {
          ...p,
          currentStock: stockNum,
          status: newStatus,
        };
      })
    );
    addToast('Stock Adjusted', 'Inventory level updated successfully.', 'success');
  };

  // Add new product
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      dailyVelocity: productData.dailyVelocity || 5.0,
      leadTimeDays: productData.leadTimeDays || 7,
      rating: 4.5,
      reviewCount: 0,
      image: '📦',
      historicalMonthlyUnits: (productData.dailyVelocity || 5) * 30,
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Product Added', `${newProduct.name} added to catalog.`, 'success');
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Settings Saved', 'Business configuration updated.', 'success');
  };

  // Notifications helpers
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('Cleared', 'All notifications cleared.', 'info');
  };

  // Send to Planner helper
  const navigateToPlannerWith = (product, segmentId = null, discount = null) => {
    setPlannerPrefill({
      productId: product?.id,
      segmentId: segmentId || 'frequent_buyers',
      discount: discount !== null ? discount : 15,
    });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        segments,
        campaigns,
        aiRecommendations,
        settings,
        searchQuery,
        setSearchQuery,
        plannerPrefill,
        setPlannerPrefill,
        toasts,
        addToast,
        removeToast,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        approveCampaign,
        saveDraftCampaign,
        updateCampaignStatus,
        deleteCampaign,
        updateProductStock,
        addProduct,
        updateSettings,
        navigateToPlannerWith,
        // ── Backend API ──────────────────────────────────────────
        apiStatus,          // 'idle'|'loading'|'ready'|'error'
        apiData,            // raw backend response objects
        fetchLiveData,      // () => Promise — manual refresh trigger
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
