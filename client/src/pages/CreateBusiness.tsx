import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const INDUSTRIES = [
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "services", label: "Services" },
  { value: "agriculture", label: "Agriculture" },
  { value: "logistics", label: "Logistics" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
];

const BUSINESS_TYPES = [
  { value: "sole_proprietor", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "pvt_ltd", label: "Private Limited" },
  { value: "llp", label: "LLP" },
  { value: "other", label: "Other" },
];

export default function CreateBusiness() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    financialYearEnd: "03-31",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createBusinessMutation = trpc.business.create.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    }

    if (!formData.industry) {
      newErrors.industry = "Please select an industry";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Please select a business type";
    }

    if (formData.gstNumber && formData.gstNumber.length > 20) {
      newErrors.gstNumber = "GST number must be 20 characters or less";
    }

    if (formData.panNumber && formData.panNumber.length > 10) {
      newErrors.panNumber = "PAN number must be 10 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const [month, day] = formData.financialYearEnd.split("-");
      const yearEndMonth = parseInt(month);

      await createBusinessMutation.mutateAsync({
        name: formData.name,
        industry: formData.industry as any,
        businessType: formData.businessType as any,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        financialYearStart: yearEndMonth,
      });

      toast.success("Business created successfully!");
      setLocation("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create business. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Business</h1>
            <p className="text-sm text-slate-600 mt-1">Add your business details to get started</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Provide your business details. You can update these later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your business name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-2 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Industry and Business Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleSelectChange("industry", value)}
                  >
                    <SelectTrigger className={`mt-2 ${errors.industry ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.industry}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleSelectChange("businessType", value)}
                  >
                    <SelectTrigger className={`mt-2 ${errors.businessType ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.businessType}
                    </p>
                  )}
                </div>
              </div>

              {/* GST and PAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    placeholder="e.g., 27AABCT1234H1Z0"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    maxLength={20}
                    className={`mt-2 ${errors.gstNumber ? "border-red-500" : ""}`}
                  />
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      {errors.gstNumber && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.gstNumber}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formData.gstNumber.length}/20</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    placeholder="e.g., AAAPA1234A"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`mt-2 ${errors.panNumber ? "border-red-500" : ""}`}
                  />
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      {errors.panNumber && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.panNumber}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formData.panNumber.length}/10</span>
                  </div>
                </div>
              </div>

              {/* Registration Number and Financial Year End */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="CIN, LLPIN, or Registration Number"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="financialYearEnd">Financial Year End</Label>
                  <Select
                    value={formData.financialYearEnd}
                    onValueChange={(value) => handleSelectChange("financialYearEnd", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01-31">January 31</SelectItem>
                      <SelectItem value="02-28">February 28</SelectItem>
                      <SelectItem value="03-31">March 31</SelectItem>
                      <SelectItem value="04-30">April 30</SelectItem>
                      <SelectItem value="05-31">May 31</SelectItem>
                      <SelectItem value="06-30">June 30</SelectItem>
                      <SelectItem value="07-31">July 31</SelectItem>
                      <SelectItem value="08-31">August 31</SelectItem>
                      <SelectItem value="09-30">September 30</SelectItem>
                      <SelectItem value="10-31">October 31</SelectItem>
                      <SelectItem value="11-30">November 30</SelectItem>
                      <SelectItem value="12-31">December 31</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBusinessMutation.isPending}
                >
                  {createBusinessMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create Business
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Why we need this information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Business details:</strong> Help us provide industry-specific benchmarking and analysis</li>
            <li>• <strong>GST/PAN:</strong> Used to verify tax compliance and import GST filing data</li>
            <li>• <strong>Financial Year End:</strong> Ensures accurate financial analysis and reporting</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
