import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getUserBusinesses,
  getBusinessById,
  createBusiness,
  getFinancialDataByBusiness,
  getLatestAnalysis,
  logUserAction,
} from "../db";
import { TRPCError } from "@trpc/server";

export const businessRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const businesses = await getUserBusinesses(ctx.user.id);
      return businesses;
    } catch (error) {
      console.error("Error fetching businesses:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch businesses",
      });
    }
  }),

  getById: protectedProcedure
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

        return business;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching business:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch business",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        industry: z.enum([
          "manufacturing",
          "retail",
          "services",
          "agriculture",
          "logistics",
          "ecommerce",
          "healthcare",
          "education",
          "hospitality",
          "other",
        ]),
        businessType: z.enum(["sole_proprietor", "partnership", "pvt_ltd", "llp", "other"]),
        registrationNumber: z.string().optional(),
        gstNumber: z.string().optional(),
        panNumber: z.string().optional(),
        financialYearStart: z.number().min(1).max(12).optional(),
        employeeCount: z.number().optional(),
        annualTurnover: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await createBusiness({
          ownerId: ctx.user.id,
          name: input.name,
          industry: input.industry,
          businessType: input.businessType,
          registrationNumber: input.registrationNumber,
          gstNumber: input.gstNumber,
          panNumber: input.panNumber,
          financialYearStart: input.financialYearStart || 4,
          employeeCount: input.employeeCount,
          annualTurnover: input.annualTurnover ? String(input.annualTurnover) : undefined,
        });

        await logUserAction(
          ctx.user.id,
          undefined,
          "business_created",
          "business",
          undefined,
          "success",
          `Created business: ${input.name}`
        );

        return { success: true };
      } catch (error) {
        console.error("Error creating business:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create business",
        });
      }
    }),

  getDashboard: protectedProcedure
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

        const financialDataList = await getFinancialDataByBusiness(input.businessId, 10);
        const latestAnalysis = await getLatestAnalysis(input.businessId);

        return {
          business,
          financialDataCount: financialDataList.length,
          latestData: financialDataList[0] || null,
          latestAnalysis: latestAnalysis || null,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching dashboard:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard",
        });
      }
    }),
});
