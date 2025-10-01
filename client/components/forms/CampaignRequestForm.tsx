import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Upload,
  X,
  Check,
  ChevronsUpDown,
  FileText,
  Trash2,
  Target,
  Tag,
  Building2,
  ChevronRight,
  ChevronLeft,
  Edit,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form validation schema
const campaignFormSchema = z.object({
  campaignName: z.string().min(1, "Campaign name is required"),
  jobTitles: z.array(z.string()).min(1, "At least one job title is required"),
  jobFunctions: z
    .array(z.string())
    .min(1, "At least one job function is required"),
  jobLevels: z.array(z.string()).min(1, "At least one job level is required"),
  geolocations: z.array(z.string()).min(1, "At least one location is required"),
  employeeSize: z.string().min(1, "Employee size is required"),
  revenue: z.string().min(1, "Revenue is required"),
  industries: z.array(z.string()).min(1, "At least one industry is required"),
  talFile: z.any().optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// Steps definition matching BuildVAIS pattern
const steps = [
  { id: 1, name: "Campaign Details", icon: Tag },
  { id: 2, name: "Target Criteria", icon: Target },
  { id: 3, name: "Company Details", icon: Building2 },
  { id: 4, name: "File Upload", icon: Upload },
];

// Mock data for options
const jobTitleOptions = [
  "Software Engineer",
  "Product Manager",
  "Marketing Manager",
  "Sales Director",
  "Data Scientist",
  "UX Designer",
  "DevOps Engineer",
  "Business Analyst",
  "Customer Success Manager",
  "HR Manager",
  "Financial Analyst",
  "Project Manager",
];

const jobFunctionOptions = [
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Data & Analytics",
  "Design",
  "Operations",
  "Business Development",
  "Customer Success",
  "Human Resources",
  "Finance",
  "Management",
];

const jobLevelOptions = ["Entry", "Mid", "Senior", "Director", "VP", "C-Level"];

const geolocationOptions = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "India",
  "Singapore",
  "Japan",
  "Brazil",
  "Mexico",
];

const employeeSizeOptions = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
];

const revenueOptions = [
  "Under $1M",
  "$1M - $10M",
  "$10M - $50M",
  "$50M - $100M",
  "$100M - $500M",
  "$500M - $1B",
  "Over $1B",
];

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Real Estate",
  "Transportation",
  "Energy",
  "Media & Entertainment",
  "Telecommunications",
  "Agriculture",
  "Construction",
];

// Multi-select component
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
}

function MultiSelect({
  options,
  selected,
  onSelectedChange,
  placeholder,
  searchPlaceholder = "Search...",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (item: string) => {
    onSelectedChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((item) => (
                <Badge key={item} variant="secondary" className="mr-1 mb-1">
                  {item}
                  <span
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    if (selected.includes(option)) {
                      handleUnselect(option);
                    } else {
                      onSelectedChange([...selected, option]);
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// File upload component
interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
}

function FileUpload({ onFileChange, file }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-gray-300",
        "hover:border-primary hover:bg-primary/5",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div className="flex items-center justify-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <div className="text-left">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFileChange(null)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload TAL File
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" asChild>
              <span className="cursor-pointer">Choose File</span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supports CSV, Excel files up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}

export default function CampaignRequestForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaignName: "",
      jobTitles: [],
      jobFunctions: [],
      jobLevels: [],
      geolocations: [],
      employeeSize: "",
      revenue: "",
      industries: [],
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    console.log("Form submitted:", data);
    console.log("Uploaded file:", uploadedFile);
    // Handle form submission here
  };

  const isFormValid = () => {
    const values = form.watch();
    return (
      values.campaignName &&
      values.jobTitles?.length > 0 &&
      values.jobFunctions?.length > 0 &&
      values.jobLevels?.length > 0 &&
      values.geolocations?.length > 0 &&
      values.industries?.length > 0 &&
      values.employeeSize &&
      values.revenue
    );
  };

  const getStepProgress = () => {
    let progress = 0;
    const values = form.watch();

    // Step 1: Campaign Details
    if (values.campaignName) progress = 25;

    // Step 2: Target Criteria
    if (
      values.jobTitles?.length > 0 &&
      values.jobFunctions?.length > 0 &&
      values.jobLevels?.length > 0 &&
      values.geolocations?.length > 0 &&
      values.industries?.length > 0
    )
      progress = 50;

    // Step 3: Company Details
    if (values.employeeSize && values.revenue) progress = 75;

    // Step 4: Complete
    if (progress === 75) progress = 100;

    return progress;
  };

  const isStepValid = (step: number) => {
    const values = form.watch();
    switch (step) {
      case 1:
        return !!values.campaignName;
      case 2:
        return (
          values.jobTitles?.length > 0 &&
          values.jobFunctions?.length > 0 &&
          values.jobLevels?.length > 0 &&
          values.geolocations?.length > 0 &&
          values.industries?.length > 0
        );
      case 3:
        return !!values.employeeSize && !!values.revenue;
      case 4:
        return true; // File upload is optional
      default:
        return false;
    }
  };

  return (
    <Form {...form}>
      <div className="w-full space-y-6">
        {/* Enhanced Header with Progress */}
        <Card className="bg-gradient-to-r from-valasys-orange/5 to-valasys-blue/5 border-valasys-orange/20">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center text-2xl">
                <Target className="w-6 h-6 mr-3 text-valasys-orange" />
                Build My Campaign
              </CardTitle>
            </div>

            {/* Step Progress Indicator */}
            <div className="space-y-4">
              <div className="w-full overflow-hidden flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-4 px-1 md:px-0">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = isStepValid(step.id);

                  return (
                    <div key={step.id} className="flex items-center shrink-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition-all",
                          isActive
                            ? "border-valasys-orange bg-valasys-orange text-white"
                            : isCompleted
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-gray-300 bg-white text-gray-400",
                        )}
                      >
                        {isCompleted && !isActive ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "ml-2 text-sm font-medium truncate max-w-[7rem] md:max-w-none",
                          isActive
                            ? "text-valasys-orange"
                            : isCompleted
                              ? "text-green-600"
                              : "text-gray-500",
                        )}
                      >
                        {step.name}
                      </span>
                      {index < steps.length - 1 && (
                        <>
                          <div
                            className={cn(
                              "hidden lg:block h-0.5 mx-4 flex-1 min-w-[2rem]",
                              isCompleted ? "bg-green-500" : "bg-gray-300",
                            )}
                          />
                          <div
                            className={cn(
                              "lg:hidden w-0.5 h-6 my-3 ml-5 flex-shrink-0",
                              isCompleted ? "bg-green-500" : "bg-gray-300",
                            )}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>

            <p className="text-valasys-gray-600">
              Configure your campaign parameters to generate targeted prospect
              lists
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Campaign Details */}
              <Card
                className={cn(
                  "transition-all duration-200",
                  currentStep === 1
                    ? "ring-2 ring-valasys-orange/50 shadow-lg"
                    : "",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          isStepValid(1)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {isStepValid(1) ? <Check className="w-4 h-4" /> : "1"}
                      </div>
                      Campaign Details
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="campaignName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter campaign name"
                            {...field}
                            className={cn(
                              field.value ? "border-green-300" : "",
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!isStepValid(1)}
                      className="w-full sm:w-auto whitespace-normal text-center text-xs sm:text-sm"
                    >
                      Next: Target Criteria
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Target Criteria */}
              <Card
                className={cn(
                  "transition-all duration-200 mt-6",
                  currentStep === 2
                    ? "ring-2 ring-valasys-orange/50 shadow-lg"
                    : "",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          isStepValid(2)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {isStepValid(2) ? <Check className="w-4 h-4" /> : "2"}
                      </div>
                      Target Criteria
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                    >
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jobTitles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={jobTitleOptions}
                              selected={field.value}
                              onSelectedChange={field.onChange}
                              placeholder="Select job titles"
                              searchPlaceholder="Search job titles..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobFunctions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Function *</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={jobFunctionOptions}
                              selected={field.value}
                              onSelectedChange={field.onChange}
                              placeholder="Select job functions"
                              searchPlaceholder="Search job functions..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobLevels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Level *</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={jobLevelOptions}
                              selected={field.value}
                              onSelectedChange={field.onChange}
                              placeholder="Select job levels"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="geolocations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geolocation *</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={geolocationOptions}
                              selected={field.value}
                              onSelectedChange={field.onChange}
                              placeholder="Select locations"
                              searchPlaceholder="Search locations..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="industries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry *</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={industryOptions}
                            selected={field.value}
                            onSelectedChange={field.onChange}
                            placeholder="Select industries"
                            searchPlaceholder="Search industries..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!isStepValid(2)}
                      className="w-full sm:w-auto whitespace-normal text-center text-xs sm:text-sm"
                    >
                      Next: Company Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Company Details */}
              <Card
                className={cn(
                  "transition-all duration-200 mt-6",
                  currentStep === 3
                    ? "ring-2 ring-valasys-orange/50 shadow-lg"
                    : "",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          isStepValid(3)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {isStepValid(3) ? <Check className="w-4 h-4" /> : "3"}
                      </div>
                      Company Details
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                    >
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Size *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  field.value ? "border-green-300" : "",
                                )}
                              >
                                <SelectValue placeholder="Select employee size range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employeeSizeOptions.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="revenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revenue *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  field.value ? "border-green-300" : "",
                                )}
                              >
                                <SelectValue placeholder="Select revenue range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {revenueOptions.map((revenue) => (
                                <SelectItem key={revenue} value={revenue}>
                                  {revenue}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      disabled={!isStepValid(3)}
                      className="w-full sm:w-auto whitespace-normal text-center text-xs sm:text-sm"
                    >
                      Next: File Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: File Upload */}
              <Card
                className={cn(
                  "transition-all duration-200 mt-6",
                  currentStep === 4
                    ? "ring-2 ring-valasys-orange/50 shadow-lg"
                    : "",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          uploadedFile
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {uploadedFile ? <Check className="w-4 h-4" /> : "4"}
                      </div>
                      Upload Suppression File
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(4)}
                    >
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload
                    onFileChange={setUploadedFile}
                    file={uploadedFile}
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-valasys-orange hover:bg-valasys-orange/90 whitespace-normal text-center text-xs sm:text-sm"
                      disabled={!isFormValid()}
                    >
                      Submit Campaign Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Progress</p>
                  <Progress value={getStepProgress()} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(getStepProgress())}% Complete
                  </p>
                </div>

                {form.watch("campaignName") && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Campaign Name</p>
                    <p className="text-sm text-muted-foreground">
                      {form.watch("campaignName")}
                    </p>
                  </div>
                )}

                {form.watch("jobTitles")?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Job Titles</p>
                    <div className="flex flex-wrap gap-1">
                      {form
                        .watch("jobTitles")
                        ?.slice(0, 3)
                        .map((title) => (
                          <Badge
                            key={title}
                            variant="outline"
                            className="text-xs"
                          >
                            {title}
                          </Badge>
                        ))}
                      {form.watch("jobTitles")?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{form.watch("jobTitles").length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Form>
  );
}
