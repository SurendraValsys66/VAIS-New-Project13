import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileText,
  Search,
  MapPin,
  Users,
  Building,
  Target,
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  Check,
  Loader2,
  Calculator,
  Trash2,
  Sparkles,
  TrendingUp,
  Filter,
  Info,
  Zap,
  Settings,
  Pin,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingStatsWidget } from "@/components/ui/floating-stats-widget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTour } from "@/contexts/TourContext";

interface UploadedFile {
  file: File;
  rows: number;
  columns: string[];
  preview: any[];
  mappings: Record<string, string>;
  status: "uploaded" | "mapping" | "validated" | "error";
  errors?: string[];
}

interface PreviewMatch {
  company: string;
  jobTitle: string;
  confidence: number;
  email?: string;
  location?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  createdAt: Date;
  isPreset?: boolean;
}

interface LiveEstimate {
  matches: number;
  credits: number;
  confidence: "low" | "medium" | "high";
  loading: boolean;
}

const jobTitles = [
  "CEO",
  "CTO",
  "CMO",
  "VP Engineering",
  "VP Sales",
  "VP Marketing",
  "Director of Engineering",
  "Engineering Manager",
  "Product Manager",
  "Sales Manager",
  "Marketing Manager",
  "Data Scientist",
  "Software Engineer",
];

const jobFunctions = [
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "Finance",
  "Human Resources",
  "Customer Success",
  "Product",
  "Data & Analytics",
];

const jobLevels = [
  "C-Level",
  "VP",
  "Director",
  "Manager",
  "Senior Individual Contributor",
  "Individual Contributor",
  "Entry Level",
];

const countriesData = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "India",
  "Singapore",
  "Netherlands",
];

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
];

const industries = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Non-profit",
];

export default function FindProspect() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { startTour } = useTour();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [previewMatches, setPreviewMatches] = useState<PreviewMatch[]>([]);
  const [isProcessingSample, setIsProcessingSample] = useState(false);
  const [stickyFilters, setStickyFilters] = useState(false);

  // Live Estimate State
  const [liveEstimate, setLiveEstimate] = useState<LiveEstimate>({
    matches: 0,
    credits: 0,
    confidence: "low",
    loading: false,
  });

  // Filter states - REORDERED: Geo first, then Job Function → Job Level → Job Title
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedJobFunctions, setSelectedJobFunctions] = useState<string[]>(
    [],
  );
  const [selectedJobLevels, setSelectedJobLevels] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    [],
  );
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // UI states
  const [countryOpen, setCountryOpen] = useState(false);
  const [jobFunctionOpen, setJobFunctionOpen] = useState(false);
  const [jobLevelOpen, setJobLevelOpen] = useState(false);
  const [jobTitleOpen, setJobTitleOpen] = useState(false);

  // Saved searches with presets
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: "preset-1",
      name: "Tech CTOs - US",
      filters: {
        countries: ["United States"],
        jobFunctions: ["Engineering"],
        jobLevels: ["C-Level"],
      },
      createdAt: new Date("2024-08-15"),
      isPreset: true,
    },
    {
      id: "preset-2",
      name: "Sales VPs - EU",
      filters: {
        countries: ["United Kingdom", "Germany", "France"],
        jobFunctions: ["Sales"],
        jobLevels: ["VP"],
      },
      createdAt: new Date("2024-08-16"),
      isPreset: true,
    },
  ]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Estimate Effect - Updates when filters change
  useEffect(() => {
    const updateEstimate = async () => {
      if (
        selectedCountries.length === 0 ||
        selectedJobFunctions.length === 0 ||
        selectedJobLevels.length === 0
      ) {
        setLiveEstimate({
          matches: 0,
          credits: 0,
          confidence: "low",
          loading: false,
        });
        return;
      }

      setLiveEstimate((prev) => ({ ...prev, loading: true }));

      // Simulate API call delay
      setTimeout(() => {
        const baseCount = uploadedFile ? uploadedFile.rows : 1000;
        const geoMultiplier = selectedCountries.length / countriesData.length;
        const functionMultiplier =
          selectedJobFunctions.length / jobFunctions.length;
        const levelMultiplier = selectedJobLevels.length / jobLevels.length;
        const titleMultiplier = selectedJobTitles.length > 0 ? 0.3 : 1;

        const totalMultiplier =
          geoMultiplier *
          functionMultiplier *
          levelMultiplier *
          titleMultiplier;
        const matches = Math.floor(
          baseCount * totalMultiplier * (0.4 + Math.random() * 0.4),
        );
        const credits = Math.ceil(matches / 100);

        const confidence =
          matches > 500 ? "high" : matches > 100 ? "medium" : "low";

        setLiveEstimate({ matches, credits, confidence, loading: false });
      }, 800);
    };

    updateEstimate();
  }, [
    selectedCountries,
    selectedJobFunctions,
    selectedJobLevels,
    selectedJobTitles,
    uploadedFile,
  ]);

  // File upload handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return;

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx)$/i))
      return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Auto-detect and map common headers
      const commonMappings = {
        company: ["company", "company name", "organization", "firm"],
        name: ["name", "full name", "first name", "contact name"],
        email: ["email", "email address", "e-mail", "contact email"],
        title: ["title", "job title", "position", "role"],
        location: ["location", "country", "city", "address"],
      };

      const mockData = {
        file,
        rows: 1250,
        columns: [
          "Company Name",
          "Contact Name",
          "Email Address",
          "Job Title",
          "Location",
          "Industry",
        ],
        preview: [
          {
            "Company Name": "Acme Corp",
            "Contact Name": "John Doe",
            "Email Address": "john@acme.com",
            "Job Title": "CTO",
            Location: "San Francisco",
            Industry: "Technology",
          },
          {
            "Company Name": "Tech Solutions",
            "Contact Name": "Jane Smith",
            "Email Address": "jane@techsol.com",
            "Job Title": "VP Engineering",
            Location: "New York",
            Industry: "Technology",
          },
          {
            "Company Name": "Data Analytics Inc",
            "Contact Name": "Bob Johnson",
            "Email Address": "bob@data.com",
            "Job Title": "Data Scientist",
            Location: "Austin",
            Industry: "Technology",
          },
        ],
        mappings: {
          company: "Company Name",
          name: "Contact Name",
          email: "Email Address",
          title: "Job Title",
          location: "Location",
        },
        status: "uploaded" as const,
      };

      setUploadedFile(mockData);
      setIsUploading(false);

      // Start sample processing
      setTimeout(() => {
        processSampleMatches(mockData);
      }, 500);
    }, 2000);
  }, []);

  const processSampleMatches = useCallback((file: UploadedFile) => {
    setIsProcessingSample(true);

    setTimeout(() => {
      // Mock sample matches
      const sampleMatches: PreviewMatch[] = [
        {
          company: "Acme Corp",
          jobTitle: "CTO",
          confidence: 95,
          email: "john@acme.com",
          location: "San Francisco",
        },
        {
          company: "Tech Solutions",
          jobTitle: "VP Engineering",
          confidence: 88,
          email: "jane@techsol.com",
          location: "New York",
        },
        {
          company: "Data Analytics Inc",
          jobTitle: "Data Scientist",
          confidence: 92,
          email: "bob@data.com",
          location: "Austin",
        },
        {
          company: "CloudTech LLC",
          jobTitle: "Engineering Manager",
          confidence: 85,
          email: "sara@cloud.com",
          location: "Seattle",
        },
        {
          company: "AI Innovations",
          jobTitle: "ML Engineer",
          confidence: 90,
          email: "mike@ai.com",
          location: "Boston",
        },
      ];

      setPreviewMatches(sampleMatches);
      setIsProcessingSample(false);
    }, 2000);
  }, []);

  const loadSavedSearch = useCallback((search: SavedSearch) => {
    const {
      countries = [],
      jobFunctions = [],
      jobLevels = [],
      jobTitles = [],
    } = search.filters;
    setSelectedCountries(countries);
    setSelectedJobFunctions(jobFunctions);
    setSelectedJobLevels(jobLevels);
    setSelectedJobTitles(jobTitles);
  }, []);

  const isFormValid = () => {
    return (
      selectedCountries.length > 0 &&
      selectedJobFunctions.length > 0 &&
      selectedJobLevels.length > 0
    );
  };

  const HelpTooltip = ({
    content,
    children,
  }: {
    content: string;
    children: React.ReactNode;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  const MultiSelectChips = ({
    options,
    selected,
    onSelect,
    placeholder,
    open,
    onOpenChange,
    required = false,
    helpText = "",
    maxVisibleChips = Infinity,
  }: {
    options: string[];
    selected: string[];
    onSelect: (value: string[]) => void;
    placeholder: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    required?: boolean;
    helpText?: string;
    maxVisibleChips?: number;
  }) => (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10",
              selected.length === 0 && "text-muted-foreground",
              required &&
                selected.length === 0 &&
                "border-red-200 focus:border-red-500",
            )}
          >
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
            />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-auto">
              {/* Select All Option */}
              <CommandItem
                onSelect={() => {
                  if (selected.length === options.length) {
                    // If all are selected, deselect all
                    onSelect([]);
                  } else {
                    // Select all options
                    onSelect(options);
                  }
                }}
                className="font-medium border-b border-gray-200 mb-1"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.length === options.length
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                Select All ({options.length})
              </CommandItem>

              {/* Individual Options */}
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    if (selected.includes(option)) {
                      onSelect(selected.filter((item) => item !== option));
                    } else {
                      onSelect([...selected, option]);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chip Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.slice(0, maxVisibleChips).map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer pr-1"
              onClick={() => onSelect(selected.filter((s) => s !== item))}
            >
              {item}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {selected.length > maxVisibleChips && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2"
            >
              +{selected.length - maxVisibleChips}
            </Badge>
          )}
        </div>
      )}

      {/* Help Text */}
      {required && selected.length === 0 && helpText && (
        <div className="flex items-center text-sm text-amber-600">
          <Info className="w-3 h-3 mr-1" />
          {helpText}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className={cn("w-full", stickyFilters ? "sticky top-0 z-50" : "")}>
          {/* Enhanced Header */}
          <div className="mb-6">
            {/* Desktop: title and stats side by side */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-valasys-orange to-valasys-orange-light rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Find Prospects
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <Button
                    data-tour="start-tour"
                    size="sm"
                    onClick={startTour}
                    className="bg-valasys-orange text-white hover:bg-valasys-orange/90 h-9"
                  >
                    Start Tour
                  </Button>
                </div>
                <FloatingStatsWidget className="w-full lg:w-auto" />
              </div>
            </div>

            {/* Mobile: stats below title */}
            <div className="lg:hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-valasys-orange to-valasys-orange-light rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Find Prospects
                </h1>
              </div>
              <div>
                <FloatingStatsWidget />
              </div>
            </div>

            <p className="text-gray-600 mt-2 mb-4">
              Required fields are marked • Save searches for reuse
            </p>
          </div>

          {/* Saved Searches */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {savedSearches
                  .filter((s) => s.isPreset)
                  .map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => loadSavedSearch(search)}
                    >
                      {search.name}
                    </Button>
                  ))}
              </div>
            </div>
          </div>

          {/* Live Estimate Bar - Responsive for mobile */}
          <Card
            className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200"
            data-tour="live-estimate"
          >
            <CardContent className="p-4">
              {/* Mobile Layout */}
              <div className="block lg:hidden">
                <div className="flex items-center space-x-2 mb-3">
                  {liveEstimate.loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Calculator className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium text-gray-900">
                    Live Estimate:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-900">
                      {liveEstimate.loading
                        ? "..."
                        : liveEstimate.matches.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-700">Prospects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-900">
                      {liveEstimate.loading ? "..." : liveEstimate.credits}
                    </div>
                    <div className="text-xs text-green-700">Credits</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={cn(
                      liveEstimate.confidence === "high" &&
                        "border-green-500 text-green-700",
                      liveEstimate.confidence === "medium" &&
                        "border-yellow-500 text-yellow-700",
                      liveEstimate.confidence === "low" &&
                        "border-red-500 text-red-700",
                    )}
                  >
                    {liveEstimate.confidence} confidence
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Updates live as you change filters. Final cost shown before
                  search runs.
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      {liveEstimate.loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <Calculator className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        Live Estimate:
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {liveEstimate.loading
                            ? "..."
                            : liveEstimate.matches.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-700">Prospects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-900">
                          {liveEstimate.loading ? "..." : liveEstimate.credits}
                        </div>
                        <div className="text-xs text-green-700">Credits</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          liveEstimate.confidence === "high" &&
                            "border-green-500 text-green-700",
                          liveEstimate.confidence === "medium" &&
                            "border-yellow-500 text-yellow-700",
                          liveEstimate.confidence === "low" &&
                            "border-red-500 text-red-700",
                        )}
                      >
                        {liveEstimate.confidence} confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 max-w-xs text-right">
                    Updates live as you change filters. Final cost shown before
                    search runs.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <Card className="h-fit" data-tour="upload-company-lists">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Upload className="w-5 h-5 mr-2 text-valasys-orange" />
                      Upload Company Lists
                      <span className="text-red-500 ml-1">*</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:inline-flex lg:hidden"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden lg:inline-flex"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 md:hidden w-fit"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                      dragActive
                        ? "border-valasys-orange bg-valasys-orange/5"
                        : "border-gray-300 hover:border-valasys-orange",
                      uploadedFile && "border-green-300 bg-green-50",
                    )}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onClick={() =>
                      !isUploading && fileInputRef.current?.click()
                    }
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />

                    {isUploading ? (
                      <div className="space-y-4">
                        <Loader2 className="w-12 h-12 mx-auto text-valasys-orange animate-spin" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Processing Upload...
                          </p>
                          <Progress value={uploadProgress} className="mt-2" />
                          <p className="text-sm text-gray-500 mt-1">
                            {uploadProgress}% complete
                          </p>
                        </div>
                      </div>
                    ) : uploadedFile ? (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center max-w-[260px] truncate rounded-full border border-green-200 bg-green-100 text-green-800 px-3 py-1 text-sm">
                            <FileText className="w-4 h-4 mr-2 text-green-600" />
                            <span className="truncate">
                              {uploadedFile.file.name}
                            </span>
                            <button
                              type="button"
                              aria-label="Remove attachment"
                              className="ml-2 rounded-full p-0.5 hover:bg-red-50 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedFile(null);
                                setPreviewMatches([]);
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </div>
                        <p className="text-sm text-green-700 text-center">
                          {uploadedFile.rows.toLocaleString()} rows •{" "}
                          {uploadedFile.columns.length} columns
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          Auto-mapped common fields
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Select / Drop file to upload
                          </p>
                          <p className="text-sm text-gray-500">
                            .csv, .xlsx — max 10MB
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            We'll preview 25 rows and estimate matches
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Section - REORDERED */}
            <div className="lg:col-span-3">
              <Card
                className={cn(stickyFilters && "sticky top-20 z-40")}
                data-tour="targeting-filters"
              >
                <CardHeader className="pb-4">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-valasys-orange" />
                        <span className="text-lg font-semibold">
                          Targeting Filters
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!isFormValid()}
                        data-tour="save-as-preset"
                        className="text-xs px-2 py-1 h-8"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save as Preset
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <CardTitle className="hidden sm:flex items-center justify-between text-lg">
                    <div className="flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-valasys-orange" />
                      Targeting Filters
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!isFormValid()}
                        data-tour="save-as-preset"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save as Preset
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Priority Order: Geo → Job Function → Job Level → Job Title */}

                    {/* Geolocation and Job Function - responsive */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                      {/* 1. Geolocation */}
                      <div className="space-y-2 w-full">
                        <HelpTooltip content="Location narrows results fastest and is required for accurate targeting.">
                          <Label className="flex items-center cursor-help">
                            <MapPin className="w-4 h-4 mr-1" />
                            Geolocation
                            <span className="text-red-500 ml-1">*</span>
                            <Info className="w-3 h-3 ml-1 text-gray-400" />
                          </Label>
                        </HelpTooltip>
                        <MultiSelectChips
                          options={countriesData}
                          selected={selectedCountries}
                          onSelect={setSelectedCountries}
                          placeholder="Select Country"
                          open={countryOpen}
                          onOpenChange={setCountryOpen}
                          required
                          helpText="Choose target markets for better prospect matching"
                          maxVisibleChips={7}
                        />
                      </div>

                      {/* 2. Job Function */}
                      <div className="space-y-2 w-full">
                        <HelpTooltip content="Job function helps us map to correct titles and is required for accurate matching.">
                          <Label className="flex items-center cursor-help">
                            Job Function
                            <span className="text-red-500 ml-1">*</span>
                            <Info className="w-3 h-3 ml-1 text-gray-400" />
                          </Label>
                        </HelpTooltip>
                        <MultiSelectChips
                          options={jobFunctions}
                          selected={selectedJobFunctions}
                          onSelect={setSelectedJobFunctions}
                          placeholder="Select functions..."
                          open={jobFunctionOpen}
                          onOpenChange={setJobFunctionOpen}
                          required
                          helpText="Required for mapping prospects to relevant roles"
                          maxVisibleChips={7}
                        />
                      </div>
                    </div>

                    {/* Job Level and Job Title - responsive */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                      {/* 3. Job Level */}
                      <div className="space-y-2 w-full">
                        <HelpTooltip content="Job level helps target the right seniority and is required for role accuracy.">
                          <Label className="flex items-center cursor-help">
                            Job Level
                            <span className="text-red-500 ml-1">*</span>
                            <Info className="w-3 h-3 ml-1 text-gray-400" />
                          </Label>
                        </HelpTooltip>
                        <MultiSelectChips
                          options={jobLevels}
                          selected={selectedJobLevels}
                          onSelect={setSelectedJobLevels}
                          placeholder="Select levels..."
                          open={jobLevelOpen}
                          onOpenChange={setJobLevelOpen}
                          required
                          helpText="Target specific seniority levels for better results"
                          maxVisibleChips={7}
                        />
                      </div>

                      {/* 4. Job Title - Now with typeahead */}
                      <div className="space-y-2 w-full">
                        <Label className="flex items-center">
                          Job Title
                          <span className="text-xs text-gray-500 ml-2">
                            (typeahead search)
                          </span>
                        </Label>
                        <MultiSelectChips
                          options={jobTitles}
                          selected={selectedJobTitles}
                          onSelect={setSelectedJobTitles}
                          placeholder="Search and select titles..."
                          open={jobTitleOpen}
                          onOpenChange={setJobTitleOpen}
                          maxVisibleChips={7}
                        />
                      </div>
                    </div>

                    {/* Optional Filters in Grid */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 text-sm mb-3">
                        Optional Filters
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-2 w-full">
                          <Label>Company Size</Label>
                          <Select
                            onValueChange={(value) =>
                              setSelectedCompanySizes([value])
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Any size" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size} employees
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 w-full">
                          <Label>Industry</Label>
                          <Select
                            onValueChange={(value) =>
                              setSelectedIndustries([value])
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Any industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced CTA Section */}
                    <div className="bg-gradient-to-r from-valasys-orange/5 to-blue-50 rounded-lg p-4 border border-valasys-orange/20">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Zap className="w-5 h-5 text-valasys-orange" />
                          <span className="font-medium text-gray-900">
                            Ready to Search
                          </span>
                        </div>
                        {liveEstimate.credits > 0 && (
                          <Badge
                            variant="outline"
                            className="border-valasys-orange text-valasys-orange text-xs sm:text-sm"
                          >
                            ~{liveEstimate.credits} credits
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-valasys-orange to-valasys-orange-light hover:from-valasys-orange-light hover:to-valasys-orange text-white font-semibold text-sm sm:text-lg shadow-lg"
                        disabled={
                          !isFormValid() ||
                          liveEstimate.loading ||
                          !uploadedFile
                        }
                        onClick={() => {
                          // Navigate to prospect results page
                          navigate("/prospect-results");
                        }}
                      >
                        {liveEstimate.loading ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        )}
                        Find{" "}
                        {liveEstimate.matches > 0
                          ? liveEstimate.matches.toLocaleString()
                          : ""}{" "}
                        Prospects
                      </Button>

                      <p className="text-xs text-gray-600 text-center mt-2 px-2 sm:px-0">
                        Note: Each 'Find Prospect' action deducts one search
                        from your available credits.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Mapping Modal */}
          <Dialog open={showMappingModal} onOpenChange={setShowMappingModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Review Column Mapping</DialogTitle>
                <DialogDescription>
                  We've auto-detected your columns. Review and adjust mappings
                  as needed.
                </DialogDescription>
              </DialogHeader>

              {uploadedFile && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">
                        Auto-mapping successful
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-detect
                    </Button>
                  </div>

                  {/* Enhanced Preview */}
                  <div>
                    <h4 className="font-medium mb-3">Data Preview</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            {uploadedFile.columns.map((col) => (
                              <TableHead
                                key={col}
                                className="text-sm font-medium"
                              >
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadedFile.preview.slice(0, 3).map((row, i) => (
                            <TableRow key={i}>
                              {uploadedFile.columns.map((col) => (
                                <TableCell key={col} className="text-sm">
                                  {row[col]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mapping Grid */}
                  <div>
                    <h4 className="font-medium mb-3">Field Mapping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        "Company Name",
                        "Contact Name",
                        "Email",
                        "Job Title",
                        "Location",
                      ].map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className="flex items-center">
                            {field}
                            {["Company Name", "Contact Name", "Email"].includes(
                              field,
                            ) && <span className="text-red-500 ml-1">*</span>}
                            {uploadedFile.mappings[
                              field.toLowerCase().replace(" ", "")
                            ] && (
                              <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                            )}
                          </Label>
                          <Select
                            defaultValue={
                              uploadedFile.mappings[
                                field.toLowerCase().replace(" ", "")
                              ]
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder={`Map to ${field}...`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                -- Skip field --
                              </SelectItem>
                              {uploadedFile.columns.map((col) => (
                                <SelectItem key={col} value={col}>
                                  {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMappingModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMappingModal(false);
                        processSampleMatches(uploadedFile);
                      }}
                    >
                      Confirm & Process Sample
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Save Search Dialog */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search as Preset</DialogTitle>
                <DialogDescription>
                  Save this configuration for quick reuse.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter preset name..."
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (newSearchName.trim()) {
                        const newSearch: SavedSearch = {
                          id: Date.now().toString(),
                          name: newSearchName,
                          filters: {
                            countries: selectedCountries,
                            jobFunctions: selectedJobFunctions,
                            jobLevels: selectedJobLevels,
                            jobTitles: selectedJobTitles,
                          },
                          createdAt: new Date(),
                          isPreset: true,
                        };
                        setSavedSearches([...savedSearches, newSearch]);
                        setNewSearchName("");
                        setShowSaveDialog(false);
                      }
                    }}
                    disabled={!newSearchName.trim()}
                  >
                    Save Preset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
