import React from 'react';
import { useEffect } from "react";
import { getOverview } from "./api";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { DataHubPage } from './pages/DataHubPage';
import { PlannerPage } from './pages/PlannerPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ArrowRight } from 'lucide-react';

export function App() {
  useEffect(() => {
  getOverview()
    .then((data) => {
      console.log("Backend data:", data);
    })
    .catch((error) => {
      console.error("API connection failed:", error);
    });
}, []);
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="data-hub" element={<DataHubPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
