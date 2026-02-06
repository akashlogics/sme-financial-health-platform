import { useState, useCallback } from "react";

export const translations = {
  en: {
    // Navigation
    appTitle: "FinPulse SME",
    appSubtitle: "AI-Powered Financial Health Platform",
    dashboard: "Dashboard",
    upload: "Upload & Analyze",
    forecast: "Forecasting",
    products: "Products",
    compliance: "Compliance",
    settings: "Settings",

    // Dashboard
    healthScore: "Financial Health Score",
    scoreOf: "out of 100",
    creditScore: "Credit Score",
    riskLevel: "Risk Level",
    financialData: "Financial Data",
    viewAnalysis: "View Analysis",
    uploadData: "Upload Financial Data",

    // Metrics
    currentAssets: "Current Assets",
    currentLiabilities: "Current Liabilities",
    debtEquity: "Debt-to-Equity",
    profitMargin: "Profit Margin",
    workingCapital: "Working Capital",
    burnRate: "Monthly Burn Rate",
    liquidityRatio: "Liquidity Ratio",
    quickRatio: "Quick Ratio",

    // Upload
    uploadTitle: "Upload Financial Documents",
    uploadDesc: "Drop your CSV, XLSX, or PDF files here for AI-powered analysis",
    uploadFormats: "Supported: CSV, XLSX, PDF (text-based)",
    selectIndustry: "Select Industry Type",
    analyzeBtn: "Analyze with AI",
    analysisRunning: "AI analysis in progress...",
    analysisComplete: "Analysis Complete",

    // Analysis Results
    riskAssessment: "Risk Assessment",
    recommendations: "Recommendations",
    costOptimization: "Cost Optimization Insights",
    benchmarking: "Industry Benchmarking",

    // Forecast
    forecastTitle: "12-Month Financial Forecast",
    forecastCashFlow: "Projected Cash Flow",
    forecastRevenue: "Revenue Projection",

    // Products
    productsTitle: "Recommended Financial Products",
    productsDesc: "Tailored suggestions based on your financial profile",
    interestRate: "Interest Rate",
    tenure: "Tenure",
    limit: "Limit",
    applyNow: "Apply Now",
    viewDetails: "View Details",

    // Compliance
    complianceTitle: "GST & Tax Compliance",
    complianceStatus: "Compliance Status",
    gstFiled: "GST Filed",
    gstDue: "GST Due",
    gstOverdue: "Overdue",
    advanceTax: "Advance Tax",
    tdsCompliance: "TDS Compliance",

    // General
    language: "Language",
    security: "Security",
    connected: "Connected",
    notConnected: "Not Connected",
    high: "High",
    medium: "Medium",
    low: "Low",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    revenueExpense: "Revenue vs Expenses",
    costBreakdown: "Cost Breakdown",
  },
  hi: {
    // Navigation
    appTitle: "फिनपल्स SME",
    appSubtitle: "AI-चालित वित्तीय स्वास्थ्य प्लेटफॉर्म",
    dashboard: "डैशबोर्ड",
    upload: "अपलोड & विश्लेषण",
    forecast: "पूर्वानुमान",
    products: "उत्पाद",
    compliance: "अनुपालन",
    settings: "सेटिंग्स",

    // Dashboard
    healthScore: "वित्तीय स्वास्थ्य स्कोर",
    scoreOf: "100 में से",
    creditScore: "क्रेडिट स्कोर",
    riskLevel: "जोखिम स्तर",
    financialData: "वित्तीय डेटा",
    viewAnalysis: "विश्लेषण देखें",
    uploadData: "वित्तीय डेटा अपलोड करें",

    // Metrics
    currentAssets: "वर्तमान संपत्ति",
    currentLiabilities: "वर्तमान देनदारी",
    debtEquity: "ऋण-इक्विटी अनुपात",
    profitMargin: "लाभ मार्जिन",
    workingCapital: "कार्यशील पूंजी",
    burnRate: "मासिक बर्न रेट",
    liquidityRatio: "तरलता अनुपात",
    quickRatio: "त्वरित अनुपात",

    // Upload
    uploadTitle: "वित्तीय दस्तावेज़ अपलोड करें",
    uploadDesc: "AI-चालित विश्लेषण के लिए CSV, XLSX, या PDF फ़ाइलें यहाँ डालें",
    uploadFormats: "समर्थित: CSV, XLSX, PDF",
    selectIndustry: "उद्योग प्रकार चुनें",
    analyzeBtn: "AI से विश्लेषण करें",
    analysisRunning: "AI विश्लेषण चल रहा है...",
    analysisComplete: "विश्लेषण पूर्ण",

    // Analysis Results
    riskAssessment: "जोखिम मूल्यांकन",
    recommendations: "सुफारिशें",
    costOptimization: "लागत अनुकूलन अंतर्दृष्टि",
    benchmarking: "उद्योग बेंचमार्किंग",

    // Forecast
    forecastTitle: "12-मास वित्तीय पूर्वानुमान",
    forecastCashFlow: "प्रक्षेपित नकदी प्रवाह",
    forecastRevenue: "राजस्व प्रक्षेपण",

    // Products
    productsTitle: "अनुशंसित वित्तीय उत्पाद",
    productsDesc: "आपके वित्तीय प्रोफ़ाइल के आधार पर अनुकूलित सुझाव",
    interestRate: "ब्याज दर",
    tenure: "कार्यकाल",
    limit: "सीमा",
    applyNow: "अभी आवेदन करें",
    viewDetails: "विवरण देखें",

    // Compliance
    complianceTitle: "GST & कर अनुपालन",
    complianceStatus: "अनुपालन स्थिति",
    gstFiled: "GST दाखिल",
    gstDue: "GST देय",
    gstOverdue: "बकाया",
    advanceTax: "अग्रिम कर",
    tdsCompliance: "TDS अनुपालन",

    // General
    language: "भाषा",
    security: "सुरक्षा",
    connected: "जुड़ा",
    notConnected: "नहीं जुड़ा",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    excellent: "उत्कृष्ट",
    good: "अच्छा",
    fair: "ठीक",
    poor: "खराब",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    cancel: "रद्द करें",
    save: "सहेजें",
    delete: "हटाएं",
    edit: "संपादित करें",
    back: "वापस",
    revenueExpense: "राजस्व vs व्यय",
    costBreakdown: "लागत विभाजन",
  },
};

export type Language = "en" | "hi";

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  return {
    language,
    setLanguage,
    t,
    toggleLanguage,
  };
}
