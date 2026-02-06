import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, File, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DATA_TYPES = [
  { value: "balance_sheet", label: "Balance Sheet" },
  { value: "profit_loss", label: "Profit & Loss Statement" },
  { value: "cash_flow", label: "Cash Flow Statement" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "gst_return", label: "GST Return" },
  { value: "other", label: "Other Financial Document" },
];

const SUPPORTED_FORMATS = [".csv", ".xlsx", ".xls", ".pdf"];

interface FileWithPreview {
  file: File;
  preview: string;
  dataType: string;
  period: string;
}

export default function UploadFinancialData() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/business/:businessId/upload");
  const businessId = params?.businessId ? parseInt(params.businessId) : null;

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = trpc.financialData.upload.useMutation();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      return `File format not supported. Please upload CSV, XLSX, or PDF files.`;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `File size exceeds 10MB limit. Please upload a smaller file.`;
    }

    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: FileWithPreview[] = [];
    const newErrors: Record<string, string> = {};

    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        newErrors[`file_${index}`] = error;
      } else {
        newFiles.push({
          file,
          preview: file.name,
          dataType: "",
          period: new Date().toISOString().split("T")[0],
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Some files could not be added. Please check the errors below.");
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileData = (
    index: number,
    field: "dataType" | "period",
    value: string
  ) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!businessId) {
      toast.error("Business ID not found");
      return;
    }

    // Validate all files have data type selected
    const missingDataType = selectedFiles.some((f) => !f.dataType);
    if (missingDataType) {
      toast.error("Please select a data type for all files");
      return;
    }

    setIsUploading(true);

    try {
      for (const fileData of selectedFiles) {
        const fileType = fileData.file.name.split(".").pop()?.toLowerCase() as
          | "csv"
          | "xlsx"
          | "pdf"
          | undefined;

        if (!fileType) {
          throw new Error(`Invalid file type for ${fileData.file.name}`);
        }

        await uploadMutation.mutateAsync({
          businessId,
          dataType: fileData.dataType as any,
          period: fileData.period,
          fileName: fileData.file.name,
          fileType: fileType,
          fileSize: fileData.file.size,
          s3Key: `financial-data/${businessId}/${Date.now()}_${fileData.file.name}`,
        });
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setLocation(`/business/${businessId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Business not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/business/${businessId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Upload Financial Data</h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload your financial documents for analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Files</CardTitle>
            <CardDescription>
              Upload CSV, XLSX, or PDF files (max 10MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 mb-2">
                Drag and drop your files here
              </p>
              <p className="text-sm text-slate-600 mb-4">
                or click the button below to browse
              </p>
              <label>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button type="button" variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {selectedFiles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedFiles.map((fileData, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <File className="w-8 h-8 text-slate-400 flex-shrink-0 mt-1" />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {fileData.file.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {(fileData.file.size / 1024).toFixed(2)} KB
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label htmlFor={`dataType_${index}`} className="text-sm">
                            Data Type *
                          </Label>
                          <Select
                            value={fileData.dataType}
                            onValueChange={(value) =>
                              updateFileData(index, "dataType", value)
                            }
                          >
                            <SelectTrigger
                              id={`dataType_${index}`}
                              className="mt-1"
                            >
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {DATA_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`period_${index}`} className="text-sm">
                            Period (YYYY-MM-DD)
                          </Label>
                          <Input
                            id={`period_${index}`}
                            type="date"
                            value={fileData.period}
                            onChange={(e) =>
                              updateFileData(index, "period", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation(`/business/${businessId}`)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""} File
            {selectedFiles.length !== 1 ? "s" : ""}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Supported File Types</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>CSV:</strong> Comma-separated values with financial data</li>
            <li>• <strong>XLSX/XLS:</strong> Excel spreadsheets with financial statements</li>
            <li>• <strong>PDF:</strong> Scanned or exported financial documents</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
