import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { ProductSelector } from '../components/planner/ProductSelector';
import { SegmentSelector } from '../components/planner/SegmentSelector';
import { DiscountConfigurator } from '../components/planner/DiscountConfigurator';
import { FinancialSimulationPanel } from '../components/planner/FinancialSimulationPanel';
import { InventoryImpactMeter } from '../components/planner/InventoryImpactMeter';
import { AiInsightDrawer } from '../components/planner/AiInsightDrawer';
import { ApprovalModal } from '../components/planner/ApprovalModal';
import { Button } from '../components/common/Button';
import {
  calculatePromotionSimulation,
  generateAiRecommendation,
} from '../services/recommendationEngine';
import {
  Sparkles,
  CheckCircle2,
  Bookmark,
  ShieldAlert,
} from 'lucide-react';

export function PlannerPage() {
  const navigate = useNavigate();
  const {
    products,
    segments,
    settings,
    approveCampaign,
    saveDraftCampaign,
    plannerPrefill,
    setPlannerPrefill,
    addToast,
  } = useApp();

  // Selected State
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (plannerPrefill?.productId) {
      return products.find((p) => p.id === plannerPrefill.productId) || products[0];
    }
    return products[0];
  });

  const [selectedSegment, setSelectedSegment] = useState(() => {
    if (plannerPrefill?.segmentId) {
      return segments.find((s) => s.id === plannerPrefill.segmentId) || segments[0];
    }
    return segments[0];
  });

  const [campaignName, setCampaignName] = useState('Autumn Special Promotion 2026');
  const [discountPercent, setDiscountPercent] = useState(() => {
    return plannerPrefill?.discount !== undefined ? plannerPrefill.discount : 15;
  });

  const [startDate, setStartDate] = useState('2026-10-05');
  const [endDate, setEndDate] = useState('2026-10-19');

  // AI Drawer and Approval Modal states
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  // Handle incoming prefill from another page
  useEffect(() => {
    if (plannerPrefill) {
      if (plannerPrefill.productId) {
        const found = products.find((p) => p.id === plannerPrefill.productId);
        if (found) setSelectedProduct(found);
      }
      if (plannerPrefill.segmentId) {
        const found = segments.find((s) => s.id === plannerPrefill.segmentId);
        if (found) setSelectedSegment(found);
      }
      if (plannerPrefill.discount !== undefined) {
        setDiscountPercent(plannerPrefill.discount);
      }
      setCampaignName(`Targeted Promo: ${plannerPrefill.productId ? products.find(p => p.id === plannerPrefill.productId)?.name?.slice(0, 20) : 'Special'}`);
      setPlannerPrefill(null); // clear prefill
    }
  }, [plannerPrefill, products, segments, setPlannerPrefill]);

  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) || 14);

  // Run real-time simulation
  const simulation = calculatePromotionSimulation({
    product: selectedProduct,
    segment: selectedSegment,
    discountPercent,
    durationDays,
    minGrossMarginThreshold: settings.minGrossMarginThreshold,
    defaultSafetyBufferPercent: settings.defaultSafetyBufferPercent,
  });

  // Trigger AI Recommendation
  const handleGenerateRecommendation = () => {
    if (!selectedProduct || !selectedSegment) return;
    const rec = generateAiRecommendation({
      product: selectedProduct,
      segment: selectedSegment,
      durationDays,
      minGrossMarginThreshold: settings.minGrossMarginThreshold,
      defaultSafetyBufferPercent: settings.defaultSafetyBufferPercent,
    });
    setAiRecommendation(rec);
    setAiDrawerOpen(true);
  };

  // Apply recommendation discount
  const handleApplyRecommendedDiscount = (disc) => {
    setDiscountPercent(disc);
    addToast('Recommendation Applied', `Discount updated to optimal ${disc}%.`, 'success');
  };

  // Build campaign payload
  const currentCampaignData = {
    name: campaignName || `${selectedProduct?.name} - ${discountPercent}% Promo`,
    productId: selectedProduct?.id,
    productName: selectedProduct?.name,
    sku: selectedProduct?.sku,
    category: selectedProduct?.category,
    targetSegmentId: selectedSegment?.id,
    targetSegmentName: selectedSegment?.name,
    discountPercent,
    originalPrice: selectedProduct?.sellingPrice,
    promoPrice: simulation?.promoPrice,
    costPrice: selectedProduct?.costPrice,
    startDate,
    endDate,
    status: 'active',
    estimatedUnits: simulation?.estimatedUnits,
    actualUnits: 0,
    estimatedRevenue: simulation?.promoRevenue,
    actualRevenue: 0,
    estimatedProfit: simulation?.promoProfit,
    actualProfit: 0,
    marginPercent: simulation?.promoMarginPercent,
    inventoryImpact: `${simulation?.remainingStock} units post-promo`,
    inventoryRisk: simulation?.stockRiskLevel,
    notes: `Simulated via ${selectedSegment?.name} elasticity profile with ${durationDays} days duration.`,
  };

  // Final approval action
  const handleConfirmApproval = () => {
    approveCampaign(currentCampaignData);
    setApprovalModalOpen(false);
    navigate('/campaigns');
  };

  // Save Draft action
  const handleSaveDraft = () => {
    saveDraftCampaign(currentCampaignData);
    navigate('/campaigns');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Interactive Promotion Planner"
        subtitle="Simulate consumer price elasticity, evaluate gross profit margins, and protect inventory buffer."
        breadcrumbs={['Home', 'Promotion Planner']}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleGenerateRecommendation}
            >
              Generate AI Recommendation
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Bookmark}
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => {
                if (!simulation?.isApprovalAllowed && settings.autoGuardrailsEnabled) {
                  addToast(
                    'Guardrail Restriction',
                    'Cannot approve campaign with critical stockout or margin breach. Adjust discount or safety buffer.',
                    'danger'
                  );
                  return;
                }
                setApprovalModalOpen(true);
              }}
            >
              Approve Campaign
            </Button>
          </>
        }
      />

      {/* Critical Guardrail Banner if constraints violated */}
      {simulation && !simulation.isApprovalAllowed && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Automated Guardrail Alert: Promotion Not Feasible</h4>
            <p className="text-xs mt-0.5 text-rose-800 leading-relaxed">
              {simulation.verdictReason}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={handleGenerateRecommendation}
                icon={Sparkles}
              >
                Auto-Fix with AI Recommendation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
            {/* Step 1: Product Selection */}
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <hr className="border-slate-100" />

            {/* Step 2: Customer Segment Selection */}
            <SegmentSelector
              segments={segments}
              selectedSegment={selectedSegment}
              onSelectSegment={setSelectedSegment}
            />

            <hr className="border-slate-100" />

            {/* Step 3: Parameters & Discount Slider */}
            <DiscountConfigurator
              campaignName={campaignName}
              onChangeCampaignName={setCampaignName}
              discountPercent={discountPercent}
              onChangeDiscount={setDiscountPercent}
              startDate={startDate}
              onChangeStartDate={setStartDate}
              endDate={endDate}
              onChangeEndDate={setEndDate}
              durationDays={durationDays}
            />
          </div>
        </div>

        {/* Right Column: Real-time Financial & Inventory Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <FinancialSimulationPanel
            simulation={simulation}
            settings={settings}
          />

          <InventoryImpactMeter
            simulation={simulation}
            settings={settings}
          />
        </div>
      </div>

      {/* AI Recommendation Drawer / Modal */}
      <AiInsightDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        recommendation={aiRecommendation}
        onApplyRecommendation={handleApplyRecommendedDiscount}
      />

      {/* Campaign Approval Confirmation Modal */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleConfirmApproval}
        campaignData={currentCampaignData}
        simulation={simulation}
      />
    </div>
  );
}
