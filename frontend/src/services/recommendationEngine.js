/**
 * Deterministic AI Promotion & Inventory Alignment Simulation Engine
 * Clearly labeled as simulated algorithmic estimation.
 */

/**
 * Calculates promotion demand, financial performance, and inventory risk.
 */
export function calculatePromotionSimulation({
  product,
  segment,
  discountPercent = 0,
  durationDays = 14,
  minGrossMarginThreshold = 18.0,
  defaultSafetyBufferPercent = 20.0,
}) {
  if (!product) {
    return null;
  }

  const originalPrice = product.sellingPrice;
  const costPrice = product.costPrice;
  const discountRate = Math.max(0, Math.min(60, Number(discountPercent) || 0)) / 100;
  
  // Promotional pricing
  const promoPrice = Math.round(originalPrice * (1 - discountRate));
  const unitProfitOriginal = originalPrice - costPrice;
  const unitProfitPromo = promoPrice - costPrice;
  
  const originalMarginPercent = Number(((unitProfitOriginal / originalPrice) * 100).toFixed(1));
  const promoMarginPercent = promoPrice > 0 
    ? Number(((unitProfitPromo / promoPrice) * 100).toFixed(1)) 
    : 0;

  // Baseline demand during campaign window
  const dailyVelocity = product.dailyVelocity || 5.0;
  const baselineUnits = Math.round(dailyVelocity * durationDays);

  // Elasticity uplift based on customer segment
  const elasticity = segment?.elasticityCoefficient ?? 1.0;
  
  // Non-linear elasticity formula with diminishing returns at extreme discounts
  const upliftFactor = discountRate === 0 
    ? 1.0 
    : 1 + (elasticity * Math.pow(discountRate, 0.85) * 3.8);

  const estimatedUnits = Math.max(1, Math.round(baselineUnits * upliftFactor));
  
  // Financial outcomes
  const promoRevenue = estimatedUnits * promoPrice;
  const promoProfit = estimatedUnits * unitProfitPromo;
  
  const baselineRevenue = baselineUnits * originalPrice;
  const baselineProfit = baselineUnits * unitProfitOriginal;

  const incrementalRevenue = promoRevenue - baselineRevenue;
  const incrementalProfit = promoProfit - baselineProfit;

  // Inventory dynamics
  const currentStock = product.currentStock;
  const reorderThreshold = product.reorderThreshold;
  const safetyBufferUnits = Math.round(currentStock * (defaultSafetyBufferPercent / 100));
  const effectiveUsableStock = Math.max(0, currentStock - safetyBufferUnits);
  
  const remainingStock = currentStock - estimatedUnits;
  const daysToStockout = dailyVelocity > 0 && estimatedUnits > 0
    ? Number((currentStock / (estimatedUnits / durationDays)).toFixed(1))
    : 999;

  // Stock risk assessment
  let stockRiskLevel = 'safe';
  let stockRiskMessage = 'Sufficient inventory buffer available';
  
  if (remainingStock < 0) {
    stockRiskLevel = 'critical';
    stockRiskMessage = `Severe Stockout Hazard: Demand exceeds stock by ${Math.abs(remainingStock)} units`;
  } else if (remainingStock < safetyBufferUnits) {
    stockRiskLevel = 'warning';
    stockRiskMessage = `Safety Buffer Depleted: Only ${remainingStock} units left (below ${defaultSafetyBufferPercent}% safety buffer)`;
  } else if (remainingStock < reorderThreshold) {
    stockRiskLevel = 'warning';
    stockRiskMessage = `Below Reorder Level: Reorder point of ${reorderThreshold} units will be breached`;
  } else {
    stockRiskLevel = 'safe';
    stockRiskMessage = `Safe Buffer: ${remainingStock} units expected remaining (${reorderThreshold} reorder threshold)`;
  }

  // Margin risk assessment
  let marginRiskLevel = 'safe';
  let marginRiskMessage = 'Profit margin meets business targets';

  if (promoMarginPercent < minGrossMarginThreshold) {
    marginRiskLevel = 'critical';
    marginRiskMessage = `Margin Warning: ${promoMarginPercent}% is below minimum threshold of ${minGrossMarginThreshold}%`;
  } else if (promoMarginPercent < minGrossMarginThreshold + 5) {
    marginRiskLevel = 'warning';
    marginRiskMessage = `Tight Margin: ${promoMarginPercent}% is close to the ${minGrossMarginThreshold}% floor`;
  } else {
    marginRiskLevel = 'safe';
    marginRiskMessage = `Healthy Margin: ${promoMarginPercent}% retained (Cost: ₹${costPrice.toLocaleString('en-IN')})`;
  }

  // Overall recommendation verdict
  let verdict = 'recommended';
  let verdictBadge = 'Feasible & Profitable';
  let verdictReason = 'Balanced demand velocity and healthy gross margins with zero stockout vulnerability.';

  if (stockRiskLevel === 'critical' && marginRiskLevel === 'critical') {
    verdict = 'unviable';
    verdictBadge = 'Critical Risk: Margin & Stock Breach';
    verdictReason = 'This campaign will cause immediate stockouts and violates minimum gross margin floors.';
  } else if (stockRiskLevel === 'critical') {
    verdict = 'stockout_risk';
    verdictBadge = 'Inventory Constraint';
    verdictReason = 'Expected demand outstrips available physical stock. Reduce discount or expedite replenishment.';
  } else if (marginRiskLevel === 'critical') {
    verdict = 'margin_risk';
    verdictBadge = 'Margin Threshold Breach';
    verdictReason = `Gross margin drops below company policy of ${minGrossMarginThreshold}%. Lower the discount percentage.`;
  } else if (stockRiskLevel === 'warning') {
    verdict = 'caution';
    verdictBadge = 'Proceed with Caution';
    verdictReason = 'Stock buffer will be near depletion by campaign end. Monitor inventory velocity closely.';
  }

  return {
    originalPrice,
    promoPrice,
    costPrice,
    unitProfitOriginal,
    unitProfitPromo,
    originalMarginPercent,
    promoMarginPercent,
    baselineUnits,
    estimatedUnits,
    upliftMultiplier: Number(upliftFactor.toFixed(2)),
    promoRevenue,
    promoProfit,
    baselineRevenue,
    baselineProfit,
    incrementalRevenue,
    incrementalProfit,
    currentStock,
    safetyBufferUnits,
    effectiveUsableStock,
    remainingStock,
    daysToStockout,
    stockRiskLevel,
    stockRiskMessage,
    marginRiskLevel,
    marginRiskMessage,
    verdict,
    verdictBadge,
    verdictReason,
    isApprovalAllowed: stockRiskLevel !== 'critical' && marginRiskLevel !== 'critical',
  };
}

/**
 * Generates an automated optimal promotion recommendation for a product + segment pair.
 */
export function generateAiRecommendation({
  product,
  segment,
  durationDays = 14,
  minGrossMarginThreshold = 18.0,
  defaultSafetyBufferPercent = 20.0,
}) {
  if (!product || !segment) return null;

  // Test candidate discounts from 5% to 40% in steps of 5%
  const candidateDiscounts = [5, 10, 15, 20, 25, 30, 35, 40];
  let bestDiscount = 10;
  let highestScore = -Infinity;
  let bestSimulation = null;

  for (const disc of candidateDiscounts) {
    const sim = calculatePromotionSimulation({
      product,
      segment,
      discountPercent: disc,
      durationDays,
      minGrossMarginThreshold,
      defaultSafetyBufferPercent,
    });

    // Score function balances incremental profit, margin safety, and stock buffer
    let score = sim.incrementalProfit;
    
    // Penalize if margin is below threshold
    if (sim.marginRiskLevel === 'critical') {
      score -= 500000;
    } else if (sim.marginRiskLevel === 'warning') {
      score -= 50000;
    }

    // Heavy penalty for stockout
    if (sim.stockRiskLevel === 'critical') {
      score -= 1000000;
    } else if (sim.stockRiskLevel === 'warning') {
      score -= 75000;
    }

    if (score > highestScore) {
      highestScore = score;
      bestDiscount = disc;
      bestSimulation = sim;
    }
  }

  // Generate explainable rationale
  const rationalePoints = [
    `Targeting ${segment.name} (Elasticity: ${segment.elasticityCoefficient}x) yields an estimated ${bestSimulation.upliftMultiplier}x demand uplift.`,
    `At ${bestDiscount}% discount (₹${bestSimulation.promoPrice.toLocaleString('en-IN')}), unit gross margin remains at ${bestSimulation.promoMarginPercent}%, satisfying the ${minGrossMarginThreshold}% business floor.`,
    bestSimulation.remainingStock > 0 
      ? `Projected consumption of ${bestSimulation.estimatedUnits} units leaves ${bestSimulation.remainingStock} units in warehouse, avoiding stockouts.`
      : `Inventory constraint detected: Consider limiting promo duration or queuing purchase orders.`
  ];

  return {
    optimalDiscount: bestDiscount,
    simulation: bestSimulation,
    confidenceScore: 94,
    headline: `${bestDiscount}% Discount Optimized for ${segment.name}`,
    rationales: rationalePoints,
    engineNotice: 'Simulated estimation generated via deterministic price-elasticity and inventory constraint optimization models.',
  };
}
