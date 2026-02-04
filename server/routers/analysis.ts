import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getBusinessById,
  getLatestAnalysis,
  getAnalysisHistory,
  createFinancialAnalysis,
  getCostOptimizations,
  createCostOptimization,
  logUserAction,
} from "../db";
import { TRPCError } from "@trpc/server";
import {
  calculateFinancialRatios,
  calculateCreditScore,
  assessFinancialRisks,
  generateCostOptimizationRecommendations,
} from "../financialCalculations";

export const analysisRouter = router({
  getLatest: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const business = await getBusinessById(input.businessId);

        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        }

        if (business.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this business",
          });
        }

        const analysis = await getLatestAnalysis(input.businessId);

        if (!analysis) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No analysis found for this business",
          });
        }

        return analysis;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching analysis:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analysis",
        });
      }
    }),

  getHistory: protectedProcedure
    .input(z.object({ businessId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const business = await getBusinessById(input.businessId);

        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        }

        if (business.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this business",
          });
        }

        const history = await getAnalysisHistory(input.businessId, input.limit || 10);
        return history;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching analysis history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analysis history",
        });
      }
    }),

  runAnalysis: protectedProcedure
    .input(
      z.object({
        businessId: z.number(),
        financialDataId: z.number(),
        metrics: z.object({
          assets: z.number().optional(),
          currentAssets: z.number().optional(),
          inventory: z.number().optional(),
          liabilities: z.number().optional(),
          currentLiabilities: z.number().optional(),
          equity: z.number().optional(),
          revenue: z.number().optional(),
          netIncome: z.number().optional(),
          operatingIncome: z.number().optional(),
          cogs: z.number().optional(),
          operatingExpenses: z.number().optional(),
          interestExpense: z.number().optional(),
          taxExpense: z.number().optional(),
          cashFlow: z.number().optional(),
          accountsReceivable: z.number().optional(),
          accountsPayable: z.number().optional(),
          debt: z.number().optional(),
          shortTermDebt: z.number().optional(),
          longTermDebt: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const business = await getBusinessById(input.businessId);

        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        }

        if (business.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this business",
          });
        }

        // Calculate financial ratios
        const ratios = calculateFinancialRatios(input.metrics);

        // Calculate credit score
        const creditScoreResult = calculateCreditScore(ratios, input.metrics);

        // Assess risks
        const riskAssessment = assessFinancialRisks(ratios, input.metrics);

        // Create analysis record
        const analysis = await createFinancialAnalysis({
          businessId: input.businessId,
          financialDataId: input.financialDataId,
          creditScore: creditScoreResult.score ? String(creditScoreResult.score) : undefined,
          creditTier: creditScoreResult.tier as any,
          riskTier: riskAssessment.riskTier as any,
          currentRatio: ratios.currentRatio ? String(ratios.currentRatio) : undefined,
          quickRatio: ratios.quickRatio ? String(ratios.quickRatio) : undefined,
          debtToEquityRatio: ratios.debtToEquityRatio ? String(ratios.debtToEquityRatio) : undefined,
          profitMargin: ratios.profitMargin ? String(ratios.profitMargin) : undefined,
          returnOnAssets: ratios.returnOnAssets ? String(ratios.returnOnAssets) : undefined,
          returnOnEquity: ratios.returnOnEquity ? String(ratios.returnOnEquity) : undefined,
          assetTurnover: ratios.assetTurnover ? String(ratios.assetTurnover) : undefined,
          debtServiceCoverageRatio: ratios.debtServiceCoverageRatio ? String(ratios.debtServiceCoverageRatio) : undefined,
          analysisResults: JSON.stringify(ratios),
          riskFactors: JSON.stringify(riskAssessment.riskFactors),
          opportunities: JSON.stringify([]),
          recommendations: JSON.stringify([]),
        });

        await logUserAction(
          ctx.user.id,
          input.businessId,
          "analysis_run",
          "analysis",
          undefined,
          "success",
          `Ran financial analysis for business`
        );

        return {
          creditScore: creditScoreResult.score,
          creditTier: creditScoreResult.tier,
          riskTier: riskAssessment.riskTier,
          ratios,
          riskFactors: riskAssessment.riskFactors,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error running analysis:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to run analysis",
        });
      }
    }),

  getCostOptimizations: protectedProcedure
    .input(z.object({ analysisId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const optimizations = await getCostOptimizations(input.analysisId);
        return optimizations;
      } catch (error) {
        console.error("Error fetching cost optimizations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cost optimizations",
        });
      }
    }),
});
