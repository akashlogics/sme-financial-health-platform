import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  businesses,
  financialData,
  financialAnalysis,
  costOptimization,
  industryBenchmarks,
  bankingConnections,
  gstRecords,
  financialReports,
  auditLogs,
  systemConfig
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Business queries
export async function getUserBusinesses(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(businesses).where(eq(businesses.ownerId, userId));
}

export async function getBusinessById(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBusiness(data: typeof businesses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(businesses).values(data);
  return result[0];
}

// Financial data queries
export async function getFinancialDataByBusiness(businessId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(financialData)
    .where(eq(financialData.businessId, businessId))
    .orderBy(desc(financialData.uploadedAt))
    .limit(limit);
}

export async function getFinancialDataById(dataId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(financialData).where(eq(financialData.id, dataId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFinancialData(data: typeof financialData.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(financialData).values(data);
  return result[0];
}

// Financial analysis queries
export async function getLatestAnalysis(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(financialAnalysis)
    .where(eq(financialAnalysis.businessId, businessId))
    .orderBy(desc(financialAnalysis.analysisDate))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAnalysisHistory(businessId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(financialAnalysis)
    .where(eq(financialAnalysis.businessId, businessId))
    .orderBy(desc(financialAnalysis.analysisDate))
    .limit(limit);
}

export async function createFinancialAnalysis(data: typeof financialAnalysis.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(financialAnalysis).values(data);
  return result[0];
}

export async function updateFinancialAnalysis(id: number, data: Partial<typeof financialAnalysis.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(financialAnalysis).set(data).where(eq(financialAnalysis.id, id));
}

// Cost optimization queries
export async function getCostOptimizations(analysisId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(costOptimization)
    .where(eq(costOptimization.analysisId, analysisId))
    .orderBy(desc(costOptimization.priority));
}

export async function createCostOptimization(data: typeof costOptimization.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(costOptimization).values(data);
  return result[0];
}

// Industry benchmark queries
export async function getIndustryBenchmarks(industry: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(industryBenchmarks)
    .where(eq(industryBenchmarks.industry, industry));
}

export async function getBenchmarkByMetric(industry: string, metricName: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(industryBenchmarks)
    .where(and(
      eq(industryBenchmarks.industry, industry),
      eq(industryBenchmarks.metricName, metricName)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Banking connection queries
export async function getBankingConnections(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bankingConnections)
    .where(eq(bankingConnections.businessId, businessId));
}

export async function getActiveBankingConnections(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bankingConnections)
    .where(and(
      eq(bankingConnections.businessId, businessId),
      eq(bankingConnections.isActive, true)
    ));
}

export async function createBankingConnection(data: typeof bankingConnections.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bankingConnections).values(data);
  return result[0];
}

export async function updateBankingConnection(id: number, data: Partial<typeof bankingConnections.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bankingConnections).set(data).where(eq(bankingConnections.id, id));
}

// GST records queries
export async function getGSTRecords(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(gstRecords)
    .where(eq(gstRecords.businessId, businessId))
    .orderBy(desc(gstRecords.filingPeriod));
}

export async function getLatestGSTRecord(businessId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(gstRecords)
    .where(eq(gstRecords.businessId, businessId))
    .orderBy(desc(gstRecords.filingPeriod))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createGSTRecord(data: typeof gstRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gstRecords).values(data);
  return result[0];
}

export async function updateGSTRecord(id: number, data: Partial<typeof gstRecords.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(gstRecords).set(data).where(eq(gstRecords.id, id));
}

// Financial reports queries
export async function getFinancialReports(businessId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(financialReports)
    .where(eq(financialReports.businessId, businessId))
    .orderBy(desc(financialReports.generatedAt));
}

export async function createFinancialReport(data: typeof financialReports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(financialReports).values(data);
  return result[0];
}

// Audit log queries
export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Cannot log: database not available");
    return;
  }

  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error("[Audit] Failed to create log:", error);
  }
}

export async function getAuditLogs(businessId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  if (businessId) {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.businessId, businessId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// System config queries
export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(key: string, value: string, type: string = "string") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(systemConfig).values({ configKey: key, configValue: value, configType: type as any }).onDuplicateKeyUpdate({
    set: { configValue: value, configType: type as any },
  });
}

// Utility function to log user actions
export async function logUserAction(
  userId: number | undefined,
  businessId: number | undefined,
  actionType: string,
  resourceType: string,
  resourceId?: number,
  status: "success" | "failure" | "partial" = "success",
  description?: string,
  ipAddress?: string,
  changes?: any
) {
  await createAuditLog({
    userId,
    businessId,
    actionType,
    resourceType,
    resourceId,
    status,
    description,
    ipAddress,
    changes,
  });
}
