import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

  const businessesQuery = trpc.business.list.useQuery();
  const businessDashboardQuery = trpc.business.getDashboard.useQuery(
    { businessId: selectedBusinessId || 0 },
    { enabled: selectedBusinessId !== null }
  );

  if (businessesQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const businesses = businessesQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Financial Health Platform</h1>
            <p className="text-sm text-slate-600 mt-1">Welcome, {user?.name || "User"}</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businesses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Businesses Yet</CardTitle>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Businesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => setSelectedBusinessId(business.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedBusinessId === business.id
                          ? "bg-blue-100 text-blue-900"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="font-medium text-sm">{business.name}</div>
                      <div className="text-xs text-slate-500">{business.industry}</div>
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
                    <h2 className="text-2xl font-bold text-slate-900">
                      {businessDashboardQuery.data.business.name}
                    </h2>
                    <p className="text-slate-600 mt-1">
                      {businessDashboardQuery.data.business.industry} • {businessDashboardQuery.data.business.businessType}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Credit Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {businessDashboardQuery.data.latestAnalysis ? (
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-blue-600">
                              {businessDashboardQuery.data.latestAnalysis.creditScore}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              businessDashboardQuery.data.latestAnalysis.creditTier === "excellent" ? "bg-green-100 text-green-800" :
                              businessDashboardQuery.data.latestAnalysis.creditTier === "good" ? "bg-blue-100 text-blue-800" :
                              businessDashboardQuery.data.latestAnalysis.creditTier === "fair" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {businessDashboardQuery.data.latestAnalysis.creditTier}
                            </span>
                          </div>
                        ) : (
                          <p className="text-slate-500">No analysis yet</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Risk Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {businessDashboardQuery.data.latestAnalysis ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`w-5 h-5 ${
                              businessDashboardQuery.data.latestAnalysis.riskTier === "very_low" ? "text-green-600" :
                              businessDashboardQuery.data.latestAnalysis.riskTier === "low" ? "text-blue-600" :
                              businessDashboardQuery.data.latestAnalysis.riskTier === "medium" ? "text-yellow-600" :
                              "text-red-600"
                            }`} />
                            <span className="font-semibold capitalize">
                              {businessDashboardQuery.data.latestAnalysis.riskTier?.replace("_", " ")}
                            </span>
                          </div>
                        ) : (
                          <p className="text-slate-500">No analysis yet</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Financial Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <span className="font-semibold">{businessDashboardQuery.data.financialDataCount} files</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={() => setLocation(`/business/${selectedBusinessId}/upload`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Financial Data
                    </Button>
                    {businessDashboardQuery.data.latestData && (
                      <Button variant="outline" onClick={() => setLocation(`/business/${selectedBusinessId}/analysis`)}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Analysis
                      </Button>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest financial data and analyses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {businessDashboardQuery.data.latestData ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{businessDashboardQuery.data.latestData.fileName}</p>
                              <p className="text-sm text-slate-500 capitalize">
                                {businessDashboardQuery.data.latestData.dataType?.replace("_", " ")}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              businessDashboardQuery.data.latestData.validationStatus === "valid" ? "bg-green-100 text-green-800" :
                              businessDashboardQuery.data.latestData.validationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {businessDashboardQuery.data.latestData.validationStatus}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500">No financial data uploaded yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-center">Select a business to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
