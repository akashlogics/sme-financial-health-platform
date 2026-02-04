import { describe, it, expect } from "vitest";
import {
  calculateFinancialRatios,
  calculateCreditScore,
  assessFinancialRisks,
  generateCostOptimizationRecommendations,
  type FinancialMetrics,
} from "./financialCalculations";

describe("Financial Calculations", () => {
  describe("calculateFinancialRatios", () => {
    it("should calculate liquidity ratios correctly", () => {
      const metrics: Partial<FinancialMetrics> = {
        currentAssets: 100000,
        currentLiabilities: 50000,
        inventory: 20000,
      };

      const ratios = calculateFinancialRatios(metrics);

      expect(ratios.currentRatio).toBe(2);
      expect(ratios.quickRatio).toBe(1.6);
      expect(ratios.workingCapital).toBe(50000);
    });

    it("should calculate profitability ratios correctly", () => {
      const metrics: Partial<FinancialMetrics> = {
        netIncome: 50000,
        revenue: 500000,
        assets: 1000000,
        equity: 500000,
      };

      const ratios = calculateFinancialRatios(metrics);

      expect(ratios.profitMargin).toBe(10);
      expect(ratios.returnOnAssets).toBe(5);
      expect(ratios.returnOnEquity).toBe(10);
    });

    it("should calculate leverage ratios correctly", () => {
      const metrics: Partial<FinancialMetrics> = {
        debt: 500000,
        equity: 500000,
        assets: 1000000,
      };

      const ratios = calculateFinancialRatios(metrics);

      expect(ratios.debtToEquityRatio).toBe(1);
      expect(ratios.debtToAssetsRatio).toBe(0.5);
      expect(ratios.equityRatio).toBe(50);
    });

    it("should calculate efficiency ratios correctly", () => {
      const metrics: Partial<FinancialMetrics> = {
        revenue: 1000000,
        cogs: 600000,
        accountsReceivable: 100000,
        inventory: 50000,
        accountsPayable: 75000,
      };

      const ratios = calculateFinancialRatios(metrics);

      expect(ratios.receivablesTurnover).toBe(10);
      expect(ratios.inventoryTurnover).toBe(12);
      expect(ratios.payablesTurnover).toBeCloseTo(8, 1);
      expect(ratios.daysReceivableOutstanding).toBe(36.5);
      expect(ratios.daysInventoryOutstanding).toBeCloseTo(30.42, 1);
    });
  });

  describe("calculateCreditScore", () => {
    it("should calculate excellent credit score for healthy business", () => {
      const ratios = {
        currentRatio: 2.0,
        profitMargin: 15,
        debtToEquityRatio: 0.5,
        returnOnEquity: 20,
        cashConversionCycle: 30,
        assetTurnover: 1.5,
      };

      const result = calculateCreditScore(ratios, {}, 90, 80);

      expect(result.score).toBeGreaterThan(80);
      expect(result.tier).toBe("excellent");
    });

    it("should calculate poor credit score for struggling business", () => {
      const ratios = {
        currentRatio: 0.5,
        profitMargin: -10,
        debtToEquityRatio: 3.0,
        returnOnEquity: -15,
        cashConversionCycle: 120,
        assetTurnover: 0.3,
      };

      const result = calculateCreditScore(ratios, {}, 20, 30);

      expect(result.score).toBeLessThan(50);
      expect(["poor", "very_poor"]).toContain(result.tier);
    });

    it("should calculate fair credit score for average business", () => {
      const ratios = {
        currentRatio: 1.2,
        profitMargin: 5,
        debtToEquityRatio: 1.0,
        returnOnEquity: 8,
        cashConversionCycle: 60,
        assetTurnover: 0.8,
      };

      const result = calculateCreditScore(ratios, {}, 50, 50);

      expect(result.score).toBeGreaterThan(40);
      expect(result.score).toBeLessThan(80);
      expect(["fair", "good"]).toContain(result.tier);
    });
  });

  describe("assessFinancialRisks", () => {
    it("should identify low risk for healthy business", () => {
      const ratios = {
        currentRatio: 2.5,
        quickRatio: 2.0,
        profitMargin: 15,
        debtToEquityRatio: 0.5,
        debtServiceCoverageRatio: 3.0,
        cashConversionCycle: 30,
        inventoryTurnover: 8,
      };

      const result = assessFinancialRisks(ratios, {});

      expect(result.riskTier).toBe("very_low");
      expect(result.riskFactors.length).toBe(0);
      expect(result.riskScore).toBe(0);
    });

    it("should identify high risk for struggling business", () => {
      const ratios = {
        currentRatio: 0.8,
        quickRatio: 0.3,
        profitMargin: -10,
        debtToEquityRatio: 2.5,
        debtServiceCoverageRatio: 0.5,
        cashConversionCycle: 150,
        inventoryTurnover: 0.5,
      };

      const result = assessFinancialRisks(ratios, {});

      expect(["high", "very_high"]).toContain(result.riskTier);
      expect(result.riskFactors.length).toBeGreaterThan(0);
      expect(result.riskScore).toBeGreaterThan(50);
    });

    it("should identify specific risk factors", () => {
      const ratios = {
        currentRatio: 0.8,
        profitMargin: -5,
        debtToEquityRatio: 2.5,
      };

      const result = assessFinancialRisks(ratios, {});

      expect(result.riskFactors.length).toBeGreaterThan(0);
      const riskText = result.riskFactors.join(" ").toLowerCase();
      expect(riskText).toContain("liquidity");
      expect(riskText).toContain("loss");
      expect(riskText).toContain("leverage");
    });
  });

  describe("generateCostOptimizationRecommendations", () => {
    it("should generate recommendations for high operating expenses", () => {
      const ratios = {};
      const metrics: Partial<FinancialMetrics> = {
        operatingExpenses: 400000,
        revenue: 1000000,
      };
      const benchmarks = {
        operatingExpenseRatio: 25,
      };

      const recommendations = generateCostOptimizationRecommendations(
        ratios,
        metrics,
        benchmarks
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].category).toBe("Operating Expenses");
      expect(recommendations[0].savingsPotential).toBeGreaterThan(0);
      expect(recommendations[0].priority).toBe("high");
    });

    it("should generate recommendations for high COGS", () => {
      const ratios = {};
      const metrics: Partial<FinancialMetrics> = {
        cogs: 750000,
        revenue: 1000000,
      };
      const benchmarks = {
        cogsRatio: 60,
      };

      const recommendations = generateCostOptimizationRecommendations(
        ratios,
        metrics,
        benchmarks
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].category).toBe("Cost of Goods Sold");
      expect(recommendations[0].savingsPotential).toBeGreaterThan(0);
    });

    it("should not generate recommendations when metrics are optimal", () => {
      const ratios = {};
      const metrics: Partial<FinancialMetrics> = {
        operatingExpenses: 200000,
        revenue: 1000000,
        cogs: 500000,
      };
      const benchmarks = {
        operatingExpenseRatio: 25,
        cogsRatio: 60,
      };

      const recommendations = generateCostOptimizationRecommendations(
        ratios,
        metrics,
        benchmarks
      );

      expect(recommendations.length).toBe(0);
    });
  });
});
