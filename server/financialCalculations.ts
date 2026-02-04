/**
 * Financial Calculations Engine
 * Handles all financial ratio calculations, creditworthiness scoring, and risk assessment
 */

export interface FinancialMetrics {
  assets: number;
  currentAssets: number;
  inventory: number;
  liabilities: number;
  currentLiabilities: number;
  equity: number;
  revenue: number;
  netIncome: number;
  operatingIncome: number;
  cogs: number;
  operatingExpenses: number;
  interestExpense: number;
  taxExpense: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  debt: number;
  shortTermDebt: number;
  longTermDebt: number;
}

export interface CalculatedRatios {
  // Liquidity Ratios
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;

  // Profitability Ratios
  profitMargin: number;
  operatingMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  assetTurnover: number;

  // Leverage Ratios
  debtToEquityRatio: number;
  debtToAssetsRatio: number;
  equityRatio: number;
  debtServiceCoverageRatio: number;

  // Efficiency Ratios
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  daysInventoryOutstanding: number;
  daysReceivableOutstanding: number;
  daysPayableOutstanding: number;
  cashConversionCycle: number;
}

export interface CreditScoreFactors {
  liquidityScore: number;
  profitabilityScore: number;
  leverageScore: number;
  efficiencyScore: number;
  growthScore: number;
  paymentHistoryScore: number;
}

/**
 * Calculate all financial ratios from raw metrics
 */
export function calculateFinancialRatios(metrics: Partial<FinancialMetrics>): Partial<CalculatedRatios> {
  const ratios: Partial<CalculatedRatios> = {};

  // Liquidity Ratios
  if (metrics.currentAssets !== undefined && metrics.currentLiabilities !== undefined) {
    ratios.currentRatio = metrics.currentAssets / (metrics.currentLiabilities || 1);
  }

  if (metrics.currentAssets !== undefined && metrics.inventory !== undefined && metrics.currentLiabilities !== undefined) {
    const quickAssets = metrics.currentAssets - (metrics.inventory || 0);
    ratios.quickRatio = quickAssets / (metrics.currentLiabilities || 1);
  }

  if (metrics.currentAssets !== undefined && metrics.currentLiabilities !== undefined) {
    ratios.workingCapital = metrics.currentAssets - metrics.currentLiabilities;
  }

  // Profitability Ratios
  if (metrics.netIncome !== undefined && metrics.revenue !== undefined) {
    ratios.profitMargin = (metrics.netIncome / (metrics.revenue || 1)) * 100;
  }

  if (metrics.operatingIncome !== undefined && metrics.revenue !== undefined) {
    ratios.operatingMargin = (metrics.operatingIncome / (metrics.revenue || 1)) * 100;
  }

  if (metrics.netIncome !== undefined && metrics.assets !== undefined) {
    ratios.returnOnAssets = (metrics.netIncome / (metrics.assets || 1)) * 100;
  }

  if (metrics.netIncome !== undefined && metrics.equity !== undefined) {
    ratios.returnOnEquity = (metrics.netIncome / (metrics.equity || 1)) * 100;
  }

  if (metrics.revenue !== undefined && metrics.assets !== undefined) {
    ratios.assetTurnover = metrics.revenue / (metrics.assets || 1);
  }

  // Leverage Ratios
  if (metrics.debt !== undefined && metrics.equity !== undefined) {
    ratios.debtToEquityRatio = metrics.debt / (metrics.equity || 1);
  }

  if (metrics.debt !== undefined && metrics.assets !== undefined) {
    ratios.debtToAssetsRatio = metrics.debt / (metrics.assets || 1);
  }

  if (metrics.equity !== undefined && metrics.assets !== undefined) {
    ratios.equityRatio = (metrics.equity / (metrics.assets || 1)) * 100;
  }

  if (metrics.operatingIncome !== undefined && metrics.shortTermDebt !== undefined && metrics.longTermDebt !== undefined) {
    const totalDebtService = (metrics.shortTermDebt || 0) + (metrics.longTermDebt || 0) + (metrics.interestExpense || 0);
    ratios.debtServiceCoverageRatio = metrics.operatingIncome / (totalDebtService || 1);
  }

  // Efficiency Ratios
  if (metrics.revenue !== undefined && metrics.accountsReceivable !== undefined) {
    ratios.receivablesTurnover = metrics.revenue / (metrics.accountsReceivable || 1);
  }

  if (metrics.cogs !== undefined && metrics.inventory !== undefined) {
    ratios.inventoryTurnover = metrics.cogs / (metrics.inventory || 1);
  }

  if (metrics.cogs !== undefined && metrics.accountsPayable !== undefined) {
    ratios.payablesTurnover = metrics.cogs / (metrics.accountsPayable || 1);
  }

  // Days calculations
  if (ratios.inventoryTurnover !== undefined) {
    ratios.daysInventoryOutstanding = 365 / (ratios.inventoryTurnover || 1);
  }

  if (ratios.receivablesTurnover !== undefined) {
    ratios.daysReceivableOutstanding = 365 / (ratios.receivablesTurnover || 1);
  }

  if (ratios.payablesTurnover !== undefined) {
    ratios.daysPayableOutstanding = 365 / (ratios.payablesTurnover || 1);
  }

  // Cash Conversion Cycle
  if (ratios.daysInventoryOutstanding !== undefined && 
      ratios.daysReceivableOutstanding !== undefined && 
      ratios.daysPayableOutstanding !== undefined) {
    ratios.cashConversionCycle = 
      (ratios.daysInventoryOutstanding || 0) + 
      (ratios.daysReceivableOutstanding || 0) - 
      (ratios.daysPayableOutstanding || 0);
  }

  return ratios;
}

/**
 * Calculate credit score based on financial ratios and metrics
 * Returns a score between 0-100
 */
export function calculateCreditScore(
  ratios: Partial<CalculatedRatios>,
  metrics: Partial<FinancialMetrics>,
  paymentHistoryScore: number = 50,
  growthScore: number = 50
): { score: number; tier: string; factors: CreditScoreFactors } {
  const factors: CreditScoreFactors = {
    liquidityScore: 0,
    profitabilityScore: 0,
    leverageScore: 0,
    efficiencyScore: 0,
    growthScore: growthScore,
    paymentHistoryScore: paymentHistoryScore,
  };

  // Liquidity Score (20% weight)
  if (ratios.currentRatio !== undefined) {
    // Ideal current ratio is 1.5-3.0
    if (ratios.currentRatio >= 1.5 && ratios.currentRatio <= 3.0) {
      factors.liquidityScore = 100;
    } else if (ratios.currentRatio >= 1.0 && ratios.currentRatio < 1.5) {
      factors.liquidityScore = 75;
    } else if (ratios.currentRatio >= 0.5 && ratios.currentRatio < 1.0) {
      factors.liquidityScore = 40;
    } else {
      factors.liquidityScore = Math.max(0, 100 - Math.abs(ratios.currentRatio - 1.5) * 20);
    }
  }

  // Profitability Score (25% weight)
  if (ratios.profitMargin !== undefined) {
    // Positive profit margin is good
    if (ratios.profitMargin >= 10) {
      factors.profitabilityScore = 100;
    } else if (ratios.profitMargin >= 5) {
      factors.profitabilityScore = 80;
    } else if (ratios.profitMargin >= 0) {
      factors.profitabilityScore = 60;
    } else {
      factors.profitabilityScore = Math.max(0, 30 + ratios.profitMargin * 3);
    }
  }

  if (ratios.returnOnEquity !== undefined) {
    const roeScore = Math.min(100, (ratios.returnOnEquity / 15) * 100);
    factors.profitabilityScore = (factors.profitabilityScore + roeScore) / 2;
  }

  // Leverage Score (25% weight)
  if (ratios.debtToEquityRatio !== undefined) {
    // Lower debt-to-equity is better, ideal is < 1.0
    if (ratios.debtToEquityRatio <= 0.5) {
      factors.leverageScore = 100;
    } else if (ratios.debtToEquityRatio <= 1.0) {
      factors.leverageScore = 80;
    } else if (ratios.debtToEquityRatio <= 2.0) {
      factors.leverageScore = 50;
    } else {
      factors.leverageScore = Math.max(0, 100 - ratios.debtToEquityRatio * 20);
    }
  }

  if (ratios.debtServiceCoverageRatio !== undefined) {
    const dscScore = Math.min(100, (ratios.debtServiceCoverageRatio / 2) * 100);
    factors.leverageScore = (factors.leverageScore + dscScore) / 2;
  }

  // Efficiency Score (15% weight)
  if (ratios.cashConversionCycle !== undefined) {
    // Lower cash conversion cycle is better
    if (ratios.cashConversionCycle <= 30) {
      factors.efficiencyScore = 100;
    } else if (ratios.cashConversionCycle <= 60) {
      factors.efficiencyScore = 80;
    } else if (ratios.cashConversionCycle <= 90) {
      factors.efficiencyScore = 60;
    } else {
      factors.efficiencyScore = Math.max(0, 100 - (ratios.cashConversionCycle - 30) / 2);
    }
  }

  if (ratios.assetTurnover !== undefined) {
    const atorScore = Math.min(100, ratios.assetTurnover * 50);
    factors.efficiencyScore = (factors.efficiencyScore + atorScore) / 2;
  }

  // Calculate weighted credit score
  const score =
    factors.liquidityScore * 0.2 +
    factors.profitabilityScore * 0.25 +
    factors.leverageScore * 0.25 +
    factors.efficiencyScore * 0.15 +
    factors.growthScore * 0.1 +
    factors.paymentHistoryScore * 0.05;

  // Determine credit tier
  let tier = "very_poor";
  if (score >= 80) {
    tier = "excellent";
  } else if (score >= 65) {
    tier = "good";
  } else if (score >= 50) {
    tier = "fair";
  } else if (score >= 35) {
    tier = "poor";
  }

  return {
    score: Math.round(score * 100) / 100,
    tier,
    factors,
  };
}

/**
 * Assess financial risks based on ratios and metrics
 */
export function assessFinancialRisks(
  ratios: Partial<CalculatedRatios>,
  metrics: Partial<FinancialMetrics>
): { riskTier: string; riskFactors: string[]; riskScore: number } {
  const riskFactors: string[] = [];
  let riskScore = 0; // 0 = no risk, 100 = very high risk

  // Liquidity Risk
  if (ratios.currentRatio !== undefined && ratios.currentRatio < 1.0) {
    riskFactors.push("Low liquidity: Current ratio below 1.0");
    riskScore += 20;
  }

  if (ratios.quickRatio !== undefined && ratios.quickRatio < 0.5) {
    riskFactors.push("Critical liquidity: Quick ratio below 0.5");
    riskScore += 15;
  }

  // Profitability Risk
  if (ratios.profitMargin !== undefined && ratios.profitMargin < 0) {
    riskFactors.push("Negative profit margin: Business operating at a loss");
    riskScore += 25;
  }

  if (ratios.returnOnEquity !== undefined && ratios.returnOnEquity < 0) {
    riskFactors.push("Negative ROE: Shareholders' equity is decreasing");
    riskScore += 20;
  }

  // Leverage Risk
  if (ratios.debtToEquityRatio !== undefined && ratios.debtToEquityRatio > 2.0) {
    riskFactors.push("High leverage: Debt-to-equity ratio exceeds 2.0");
    riskScore += 25;
  }

  if (ratios.debtServiceCoverageRatio !== undefined && ratios.debtServiceCoverageRatio < 1.0) {
    riskFactors.push("Debt service risk: Cannot cover debt obligations from operating income");
    riskScore += 30;
  }

  // Operational Risk
  if (ratios.cashConversionCycle !== undefined && ratios.cashConversionCycle > 120) {
    riskFactors.push("Working capital risk: Long cash conversion cycle");
    riskScore += 15;
  }

  if (ratios.inventoryTurnover !== undefined && ratios.inventoryTurnover < 1) {
    riskFactors.push("Inventory risk: Slow inventory turnover");
    riskScore += 10;
  }

  // Determine risk tier
  let riskTier = "very_low";
  if (riskScore >= 80) {
    riskTier = "very_high";
  } else if (riskScore >= 60) {
    riskTier = "high";
  } else if (riskScore >= 40) {
    riskTier = "medium";
  } else if (riskScore >= 20) {
    riskTier = "low";
  }

  return {
    riskTier,
    riskFactors,
    riskScore: Math.min(100, riskScore),
  };
}

/**
 * Generate cost optimization recommendations based on industry benchmarks
 */
export function generateCostOptimizationRecommendations(
  ratios: Partial<CalculatedRatios>,
  metrics: Partial<FinancialMetrics>,
  benchmarks: Record<string, number>
): Array<{
  category: string;
  currentValue: number;
  benchmarkValue: number;
  savingsPotential: number;
  recommendation: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    category: string;
    currentValue: number;
    benchmarkValue: number;
    savingsPotential: number;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Operating Expense Optimization
  if (metrics.operatingExpenses !== undefined && metrics.revenue !== undefined) {
    const operatingExpenseRatio = (metrics.operatingExpenses / metrics.revenue) * 100;
    const benchmarkRatio = benchmarks["operatingExpenseRatio"] || 30;

    if (operatingExpenseRatio > benchmarkRatio) {
      const savingsPotential = metrics.revenue * ((operatingExpenseRatio - benchmarkRatio) / 100);
      recommendations.push({
        category: "Operating Expenses",
        currentValue: operatingExpenseRatio,
        benchmarkValue: benchmarkRatio,
        savingsPotential,
        recommendation: `Reduce operating expenses by ${((operatingExpenseRatio - benchmarkRatio) / benchmarkRatio * 100).toFixed(1)}% to match industry benchmark. Focus on automation and process efficiency.`,
        priority: operatingExpenseRatio > benchmarkRatio * 1.5 ? "high" : "medium",
      });
    }
  }

  // COGS Optimization
  if (metrics.cogs !== undefined && metrics.revenue !== undefined) {
    const cogsRatio = (metrics.cogs / metrics.revenue) * 100;
    const benchmarkRatio = benchmarks["cogsRatio"] || 60;

    if (cogsRatio > benchmarkRatio) {
      const savingsPotential = metrics.revenue * ((cogsRatio - benchmarkRatio) / 100);
      recommendations.push({
        category: "Cost of Goods Sold",
        currentValue: cogsRatio,
        benchmarkValue: benchmarkRatio,
        savingsPotential,
        recommendation: `Optimize COGS by ${((cogsRatio - benchmarkRatio) / benchmarkRatio * 100).toFixed(1)}%. Consider supplier negotiations, bulk purchasing, or production efficiency improvements.`,
        priority: cogsRatio > benchmarkRatio * 1.3 ? "high" : "medium",
      });
    }
  }

  // Working Capital Optimization
  if (ratios.daysReceivableOutstanding !== undefined) {
    const benchmarkDRO = benchmarks["daysReceivableOutstanding"] || 45;

    if (ratios.daysReceivableOutstanding > benchmarkDRO) {
      const improvement = ratios.daysReceivableOutstanding - benchmarkDRO;
      recommendations.push({
        category: "Accounts Receivable",
        currentValue: ratios.daysReceivableOutstanding,
        benchmarkValue: benchmarkDRO,
        savingsPotential: 0,
        recommendation: `Improve collection efficiency. Current DRO is ${improvement.toFixed(0)} days above benchmark. Implement stricter credit policies and faster invoicing.`,
        priority: improvement > 30 ? "high" : "medium",
      });
    }
  }

  return recommendations;
}

/**
 * Calculate financial trend analysis
 */
export function calculateTrendAnalysis(
  currentMetrics: Partial<FinancialMetrics>,
  previousMetrics: Partial<FinancialMetrics>
): Record<string, number> {
  const trends: Record<string, number> = {};

  if (currentMetrics.revenue !== undefined && previousMetrics.revenue !== undefined) {
    trends.revenueGrowth = ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100;
  }

  if (currentMetrics.netIncome !== undefined && previousMetrics.netIncome !== undefined) {
    trends.profitGrowth = ((currentMetrics.netIncome - previousMetrics.netIncome) / previousMetrics.netIncome) * 100;
  }

  if (currentMetrics.assets !== undefined && previousMetrics.assets !== undefined) {
    trends.assetGrowth = ((currentMetrics.assets - previousMetrics.assets) / previousMetrics.assets) * 100;
  }

  if (currentMetrics.equity !== undefined && previousMetrics.equity !== undefined) {
    trends.equityGrowth = ((currentMetrics.equity - previousMetrics.equity) / previousMetrics.equity) * 100;
  }

  return trends;
}
