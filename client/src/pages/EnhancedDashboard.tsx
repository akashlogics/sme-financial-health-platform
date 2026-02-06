import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Plus, TrendingUp, AlertCircle, DollarSign, Globe, LogOut,
  Brain, Shield, Target, Zap, FileText, BarChart2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

// Sample data for visualizations
const SAMPLE_REVENUE_DATA = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
];

const SAMPLE_COST_DATA = [
  { name: "Salaries", value: 35 },
  { name: "Materials", value: 25 },
  { name: "Operations", value: 20 },
  { name: "Marketing", value: 12 },
  { name: "Other", value: 8 },
];

const SAMPLE_RADAR_DATA = [
  { metric: "Liquidity", value: 78, benchmark: 65 },
  { metric: "Profitability", value: 62, benchmark: 58 },
  { metric: "Solvency", value: 71, benchmark: 70 },
  { metric: "Efficiency", value: 55, benchmark: 60 },
  { metric: "Growth", value: 82, benchmark: 50 },
];

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function EnhancedDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useTranslation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

  const businessesQuery = trpc.business.list.useQuery();
  const businessDashboardQuery = trpc.business.getDashboard.useQuery(
    { businessId: selectedBusinessId || 0 },
    { enabled: selectedBusinessId !== null }
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const businesses = businessesQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t.appTitle}</h1>
                <p className="text-xs text-purple-300">{t.appSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "hi")}>
                <SelectTrigger className="w-32 bg-slate-800 border-purple-500/30">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                </SelectContent>
              </Select>

              {/* Security Badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-300 font-semibold">AES-256</span>
              </div>

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businesses.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">{t.dashboard}</CardTitle>
              <CardDescription>Create your first business to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/business/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Business
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Business List Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Your Businesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => setSelectedBusinessId(business.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedBusinessId === business.id
                          ? "bg-purple-500/30 text-purple-100 border border-purple-500/50"
                          : "hover:bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{business.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{business.industry}</div>
                    </button>
                  ))}
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Area */}
            <div className="lg:col-span-3">
              {selectedBusinessId && businessDashboardQuery.data ? (
                <div className="space-y-6">
                  {/* Business Header */}
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {businessDashboardQuery.data.business.name}
                    </h2>
                    <p className="text-purple-300 mt-1">
                      {businessDashboardQuery.data.business.industry} • {businessDashboardQuery.data.business.businessType}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-purple-300">{t.creditScore}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {businessDashboardQuery.data.latestAnalysis ? (
                          <div>
                            <div className="text-3xl font-bold text-purple-400">
                              {businessDashboardQuery.data.latestAnalysis.creditScore}
                            </div>
                            <span className="text-xs text-purple-300 mt-1 inline-block">
                              {businessDashboardQuery.data.latestAnalysis.creditTier}
                            </span>
                          </div>
                        ) : (
                          <p className="text-slate-400">No analysis yet</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-orange-300">{t.riskLevel}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {businessDashboardQuery.data.latestAnalysis ? (
                          <div>
                            <div className="text-3xl font-bold text-orange-400">
                              {businessDashboardQuery.data.latestAnalysis.riskTier?.replace("_", " ")}
                            </div>
                            <AlertCircle className="w-5 h-5 text-orange-400 mt-2" />
                          </div>
                        ) : (
                          <p className="text-slate-400">No analysis yet</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-300">{t.financialData}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-400" />
                          <span className="text-2xl font-bold text-blue-400">
                            {businessDashboardQuery.data.financialDataCount}
                          </span>
                          <span className="text-xs text-blue-300">files</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue vs Expenses */}
                    <Card className="bg-slate-800/50 border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">{t.revenueExpense}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={SAMPLE_REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4c5a7a" />
                            <XAxis dataKey="month" stroke="#8b8fa3" />
                            <YAxis stroke="#8b8fa3" />
                            <Tooltip contentStyle={{ background: "#1e1b2e", border: "1px solid #8b5cf6" }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8b5cf6" />
                            <Bar dataKey="expenses" fill="#f97316" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Cost Breakdown */}
                    <Card className="bg-slate-800/50 border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">{t.costBreakdown}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={SAMPLE_COST_DATA}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={80}
                              fill="#8b5cf6"
                              dataKey="value"
                            >
                              {SAMPLE_COST_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Financial Health Radar */}
                    <Card className="bg-slate-800/50 border-purple-500/20 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-white">Financial Health Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={SAMPLE_RADAR_DATA}>
                            <PolarGrid stroke="#4c5a7a" />
                            <PolarAngleAxis dataKey="metric" stroke="#8b8fa3" />
                            <PolarRadiusAxis stroke="#8b8fa3" />
                            <Radar name="Your Business" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Radar name="Industry Benchmark" dataKey="benchmark" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                            <Legend />
                            <Tooltip contentStyle={{ background: "#1e1b2e", border: "1px solid #8b5cf6" }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={() => setLocation(`/business/${selectedBusinessId}/upload`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t.uploadData}
                    </Button>
                    {businessDashboardQuery.data.latestData && (
                      <Button variant="outline" onClick={() => setLocation(`/business/${selectedBusinessId}/analysis`)}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {t.viewAnalysis}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-purple-500/20 p-12 text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Select a business to view details</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
