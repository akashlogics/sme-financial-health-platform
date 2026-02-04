import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with language preference and timezone for multilingual support.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "advisor"]).default("user").notNull(),
  languagePreference: mysqlEnum("languagePreference", ["en", "hi"]).default("en").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  openIdIdx: index("openId_idx").on(table.openId),
  roleIdx: index("role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Business entity representing an SME
 */
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: mysqlEnum("industry", [
    "manufacturing",
    "retail",
    "services",
    "agriculture",
    "logistics",
    "ecommerce",
    "healthcare",
    "education",
    "hospitality",
    "other"
  ]).notNull(),
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  gstNumber: varchar("gstNumber", { length: 15 }),
  panNumber: varchar("panNumber", { length: 10 }),
  financialYearStart: int("financialYearStart").default(4).notNull(), // Month (1-12)
  businessType: mysqlEnum("businessType", ["sole_proprietor", "partnership", "pvt_ltd", "llp", "other"]).notNull(),
  employeeCount: int("employeeCount"),
  annualTurnover: decimal("annualTurnover", { precision: 15, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdIdx: index("ownerId_idx").on(table.ownerId),
  industryIdx: index("industry_idx").on(table.industry),
}));

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

/**
 * Financial data uploads (CSV, XLSX, PDF)
 */
export const financialData = mysqlTable("financialData", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  dataType: mysqlEnum("dataType", ["balance_sheet", "profit_loss", "cash_flow", "bank_statement", "gst_return", "other"]).notNull(),
  period: varchar("period", { length: 50 }).notNull(), // e.g., "2024-01" for monthly, "2024-Q1" for quarterly
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 20 }).notNull(), // csv, xlsx, pdf
  fileSize: int("fileSize").notNull(),
  s3Key: varchar("s3Key", { length: 500 }).notNull(), // S3 storage path
  rawData: json("rawData"), // Parsed JSON data
  validationStatus: mysqlEnum("validationStatus", ["pending", "valid", "invalid", "partial"]).default("pending").notNull(),
  validationErrors: json("validationErrors"), // Array of validation errors
  source: mysqlEnum("source", ["manual_upload", "banking_api", "gst_api", "accounting_software"]).default("manual_upload").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  dataTypeIdx: index("dataType_idx").on(table.dataType),
  periodIdx: index("period_idx").on(table.period),
}));

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;

/**
 * Financial analysis results and creditworthiness scores
 */
export const financialAnalysis = mysqlTable("financialAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  financialDataId: int("financialDataId").notNull(),
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
  expirationDate: timestamp("expirationDate"),
  creditScore: decimal("creditScore", { precision: 5, scale: 2 }), // 0-100
  creditTier: mysqlEnum("creditTier", ["excellent", "good", "fair", "poor", "very_poor"]),
  riskTier: mysqlEnum("riskTier", ["very_low", "low", "medium", "high", "very_high"]),
  // Financial Ratios
  currentRatio: decimal("currentRatio", { precision: 8, scale: 2 }),
  quickRatio: decimal("quickRatio", { precision: 8, scale: 2 }),
  debtToEquityRatio: decimal("debtToEquityRatio", { precision: 8, scale: 2 }),
  profitMargin: decimal("profitMargin", { precision: 8, scale: 2 }),
  returnOnAssets: decimal("returnOnAssets", { precision: 8, scale: 2 }),
  returnOnEquity: decimal("returnOnEquity", { precision: 8, scale: 2 }),
  assetTurnover: decimal("assetTurnover", { precision: 8, scale: 2 }),
  debtServiceCoverageRatio: decimal("debtServiceCoverageRatio", { precision: 8, scale: 2 }),
  // Analysis Results
  analysisResults: json("analysisResults"), // Comprehensive analysis data
  aiInsights: text("aiInsights"), // LLM-generated narrative insights
  riskFactors: json("riskFactors"), // Identified risks
  opportunities: json("opportunities"), // Growth opportunities
  recommendations: json("recommendations"), // Actionable recommendations
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  creditScoreIdx: index("creditScore_idx").on(table.creditScore),
  creditTierIdx: index("creditTier_idx").on(table.creditTier),
}));

export type FinancialAnalysis = typeof financialAnalysis.$inferSelect;
export type InsertFinancialAnalysis = typeof financialAnalysis.$inferInsert;

/**
 * Cost optimization recommendations
 */
export const costOptimization = mysqlTable("costOptimization", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  analysisId: int("analysisId").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Operational Costs", "Personnel"
  currentCost: decimal("currentCost", { precision: 15, scale: 2 }).notNull(),
  recommendedCost: decimal("recommendedCost", { precision: 15, scale: 2 }).notNull(),
  savingsPotential: decimal("savingsPotential", { precision: 15, scale: 2 }).notNull(),
  savingsPercentage: decimal("savingsPercentage", { precision: 8, scale: 2 }).notNull(),
  recommendation: text("recommendation").notNull(),
  implementationDifficulty: mysqlEnum("implementationDifficulty", ["easy", "medium", "hard"]).notNull(),
  timelineMonths: int("timelineMonths"),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  categoryIdx: index("category_idx").on(table.category),
}));

export type CostOptimization = typeof costOptimization.$inferSelect;
export type InsertCostOptimization = typeof costOptimization.$inferInsert;

/**
 * Industry benchmarks for comparative analysis
 */
export const industryBenchmarks = mysqlTable("industryBenchmarks", {
  id: int("id").autoincrement().primaryKey(),
  industry: varchar("industry", { length: 100 }).notNull(),
  metricName: varchar("metricName", { length: 100 }).notNull(),
  averageValue: decimal("averageValue", { precision: 15, scale: 2 }),
  medianValue: decimal("medianValue", { precision: 15, scale: 2 }),
  percentile25: decimal("percentile25", { precision: 15, scale: 2 }),
  percentile75: decimal("percentile75", { precision: 15, scale: 2 }),
  percentile90: decimal("percentile90", { precision: 15, scale: 2 }),
  dataSource: varchar("dataSource", { length: 255 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  industryIdx: index("industry_idx").on(table.industry),
  metricIdx: index("metricName_idx").on(table.metricName),
}));

export type IndustryBenchmark = typeof industryBenchmarks.$inferSelect;
export type InsertIndustryBenchmark = typeof industryBenchmarks.$inferInsert;

/**
 * Banking API connections
 */
export const bankingConnections = mysqlTable("bankingConnections", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  bankName: varchar("bankName", { length: 100 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  accountType: varchar("accountType", { length: 50 }), // Savings, Current, etc.
  apiType: varchar("apiType", { length: 50 }).notNull(), // e.g., "razorpay", "yodlee"
  encryptedCredentials: text("encryptedCredentials").notNull(), // Encrypted API credentials
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncDate: timestamp("lastSyncDate"),
  syncStatus: mysqlEnum("syncStatus", ["pending", "syncing", "success", "failed"]).default("pending").notNull(),
  syncErrorMessage: text("syncErrorMessage"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  bankNameIdx: index("bankName_idx").on(table.bankName),
}));

export type BankingConnection = typeof bankingConnections.$inferSelect;
export type InsertBankingConnection = typeof bankingConnections.$inferInsert;

/**
 * GST filing records and compliance tracking
 */
export const gstRecords = mysqlTable("gstRecords", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  gstNumber: varchar("gstNumber", { length: 15 }).notNull(),
  filingPeriod: varchar("filingPeriod", { length: 20 }).notNull(), // e.g., "2024-01"
  filingDate: timestamp("filingDate"),
  filingStatus: mysqlEnum("filingStatus", ["not_filed", "filed", "amended", "cancelled"]).notNull(),
  complianceScore: decimal("complianceScore", { precision: 5, scale: 2 }), // 0-100
  totalTaxLiability: decimal("totalTaxLiability", { precision: 15, scale: 2 }),
  totalTaxPaid: decimal("totalTaxPaid", { precision: 15, scale: 2 }),
  taxDue: decimal("taxDue", { precision: 15, scale: 2 }),
  deductionOpportunities: json("deductionOpportunities"), // Array of potential deductions
  filingGaps: json("filingGaps"), // Array of missed filings
  lastVerifiedDate: timestamp("lastVerifiedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  gstNumberIdx: index("gstNumber_idx").on(table.gstNumber),
  filingPeriodIdx: index("filingPeriod_idx").on(table.filingPeriod),
}));

export type GSTRecord = typeof gstRecords.$inferSelect;
export type InsertGSTRecord = typeof gstRecords.$inferInsert;

/**
 * Financial reports generated for investors/stakeholders
 */
export const financialReports = mysqlTable("financialReports", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  analysisId: int("analysisId"),
  reportTitle: varchar("reportTitle", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", ["investor_ready", "bank_loan", "tax_compliance", "custom"]).notNull(),
  reportFormat: mysqlEnum("reportFormat", ["pdf", "html", "excel"]).default("pdf").notNull(),
  language: mysqlEnum("language", ["en", "hi"]).default("en").notNull(),
  s3Key: varchar("s3Key", { length: 500 }), // S3 path to generated report
  reportContent: json("reportContent"), // Report structure and data
  generatedBy: int("generatedBy").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  businessIdIdx: index("businessId_idx").on(table.businessId),
  reportTypeIdx: index("reportType_idx").on(table.reportType),
}));

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;

/**
 * Audit logs for compliance and security
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  businessId: int("businessId"),
  actionType: varchar("actionType", { length: 100 }).notNull(), // e.g., "data_upload", "analysis_run", "report_generated"
  resourceType: varchar("resourceType", { length: 100 }).notNull(), // e.g., "financial_data", "analysis"
  resourceId: int("resourceId"),
  description: text("description"),
  status: mysqlEnum("status", ["success", "failure", "partial"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  changes: json("changes"), // Before/after data for modifications
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  businessIdIdx: index("businessId_idx").on(table.businessId),
  actionTypeIdx: index("actionType_idx").on(table.actionType),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * System configuration and settings
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(),
  configValue: text("configValue").notNull(),
  configType: mysqlEnum("configType", ["string", "number", "boolean", "json"]).default("string").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  configKeyIdx: index("configKey_idx").on(table.configKey),
}));

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  auditLogs: many(auditLogs),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  financialData: many(financialData),
  analyses: many(financialAnalysis),
  costOptimizations: many(costOptimization),
  bankingConnections: many(bankingConnections),
  gstRecords: many(gstRecords),
  reports: many(financialReports),
  auditLogs: many(auditLogs),
}));

export const financialDataRelations = relations(financialData, ({ one, many }) => ({
  business: one(businesses, {
    fields: [financialData.businessId],
    references: [businesses.id],
  }),
  analyses: many(financialAnalysis),
}));

export const financialAnalysisRelations = relations(financialAnalysis, ({ one, many }) => ({
  business: one(businesses, {
    fields: [financialAnalysis.businessId],
    references: [businesses.id],
  }),
  financialData: one(financialData, {
    fields: [financialAnalysis.financialDataId],
    references: [financialData.id],
  }),
  costOptimizations: many(costOptimization),
}));

export const costOptimizationRelations = relations(costOptimization, ({ one }) => ({
  business: one(businesses, {
    fields: [costOptimization.businessId],
    references: [businesses.id],
  }),
  analysis: one(financialAnalysis, {
    fields: [costOptimization.analysisId],
    references: [financialAnalysis.id],
  }),
}));

export const bankingConnectionsRelations = relations(bankingConnections, ({ one }) => ({
  business: one(businesses, {
    fields: [bankingConnections.businessId],
    references: [businesses.id],
  }),
}));

export const gstRecordsRelations = relations(gstRecords, ({ one }) => ({
  business: one(businesses, {
    fields: [gstRecords.businessId],
    references: [businesses.id],
  }),
}));

export const financialReportsRelations = relations(financialReports, ({ one }) => ({
  business: one(businesses, {
    fields: [financialReports.businessId],
    references: [businesses.id],
  }),
  analysis: one(financialAnalysis, {
    fields: [financialReports.analysisId],
    references: [financialAnalysis.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [auditLogs.businessId],
    references: [businesses.id],
  }),
}));