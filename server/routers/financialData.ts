import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getFinancialDataByBusiness,
  getFinancialDataById,
  createFinancialData,
  getBusinessById,
} from "../db";
import { TRPCError } from "@trpc/server";

export const financialDataRouter = router({
  list: protectedProcedure
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

        const data = await getFinancialDataByBusiness(input.businessId);
        return data;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching financial data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch financial data",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ dataId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await getFinancialDataById(input.dataId);

        if (!data) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Financial data not found",
          });
        }

        const business = await getBusinessById(data.businessId);
        if (!business) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Business not found",
          });
        }

        if (business.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this data",
          });
        }

        return data;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching financial data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch financial data",
        });
      }
    }),

  upload: protectedProcedure
    .input(
      z.object({
        businessId: z.number(),
        dataType: z.enum([
          "balance_sheet",
          "profit_loss",
          "cash_flow",
          "bank_statement",
          "gst_return",
          "other",
        ]),
        period: z.string(),
        fileName: z.string(),
        fileType: z.enum(["csv", "xlsx", "pdf"]),
        fileSize: z.number(),
        s3Key: z.string(),
        rawData: z.any().optional(),
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

        // Parse period to get start and end dates
        const periodDate = new Date(input.period);
        const periodStart = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
        const periodEnd = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);

        const result = await createFinancialData({
          businessId: input.businessId,
          dataType: input.dataType,
          period: input.period,
          periodStart,
          periodEnd,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          rawData: input.rawData,
          validationStatus: "pending",
          uploadedAt: new Date(),
          uploadedBy: ctx.user.id,
        });

        return { success: true, dataId: result };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error uploading financial data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload financial data",
        });
      }
    }),
});
