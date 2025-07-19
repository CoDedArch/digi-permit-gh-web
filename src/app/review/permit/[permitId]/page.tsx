"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  FileText,
  Home,
  MapPin,
  Ruler,
  HardHat,
  Landmark,
  ScrollText,
  Scroll,
  Ban,
  CheckCircle,
  ArrowRight,
  Check,
  X,
  Info,
  CalendarDays,
  AlertCircle,
  Flag,
  DollarSign,
  Activity,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { DocumentViewer } from "@/components/DocumentViewer";
import {
  getPermitApplicationById,
  PermitApplication,
} from "@/app/data/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Adjust import path as needed
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import {
  calculateArea,
  calculatePerimeter,
  getSampleCoordinates,
  getVertexCount,
  isLocationNearParcel,
  isParcelContained,
  parseParkingRequirement,
} from "@/lib/utils";
import { CoordinateTable } from "@/components/CoordinateTable";
import { ComplianceIndicator } from "@/components/ComplianceIndicator";

const MapPreview = dynamic(() => import("@/components/MapPreview"), {
  ssr: false,
});

const SpatialPolygonInput = dynamic(
  () => import("@/components/SpatialInputPlot"),
  {
    ssr: false,
  },
);

const ComplianceMap = dynamic(() => import("@/components/ComplianceMap"), {
  ssr: false,
});

type SetbackSides = "front" | "sides" | "rear";
interface Setbacks {
  front?: number;
  sides?: number;
  rear?: number;
}

const SHORT_FORM_TYPES = [
  "signage/billboard",
  "subdivision",
  "temporary_structure",
  "installation_of_fittings",
  "hoarding",
  "sand_weaning",
];

const LONG_FORM_TYPES = [
  "new_construction",
  "renovation_alteration",
  "change_of_use",
  "demolition",
];

export enum ApplicationStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  ADDITIONAL_INFO_REQUESTED = "additional_info_requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  INSPECTION_PENDING = "inspection_pending",
  INSPECTION_COMPLETED = "inspected",
  FOR_APPROVAL_OR_REJECTION = "approval requested",
  ISSUED = "issued",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

const reviewSchema = z.object({
  status: z.string().min(1, "Please select a valid status"),
  comments: z.string().min(1, "Review comments are required"),
  requiredChanges: z.string().optional(),
  nextSteps: z.string().optional(),
  inspectionDate: z.date().optional(),
  inspectionNotes: z.string().optional(),
});

const flagSchema = z.object({
  reason: z.string().min(1, "Please provide a reason for flagging"),
});

// Helper functions to implement the above options

export default function PermitReviewPage() {
  const router = useRouter();
  const params = useParams();
  const permitId = params.permitId as string;
  const [application, setApplication] = useState<PermitApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [needsReviewStatusUpdate, setNeedsReviewStatusUpdate] = useState(false);
  const [isSettingUnderReview, setIsSettingUnderReview] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [isShortPermit, setIsShortPermit] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: ApplicationStatus.UNDER_REVIEW,
      comments: "",
      requiredChanges: "",
      nextSteps: "",
    },
  });

  const flagForm = useForm({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    async function fetchApplication() {
      try {
        const data = await getPermitApplicationById(Number(permitId));

        console.log("Floor Areas ARE: ", data?.floor_areas);
        setApplication(data);

        setNeedsReviewStatusUpdate(
          data?.status !== ApplicationStatus.UNDER_REVIEW &&
            data?.status !== ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
        );

        form.reset({
          status: data?.status ?? ApplicationStatus.UNDER_REVIEW,
          comments: "",
          requiredChanges: "",
          nextSteps: "",
        });
      } catch (error) {
        toast.error("Failed to load permit application");
        router.push("/revi/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (permitId) {
      fetchApplication();
    }
  }, [permitId, form, router]);

  const steps = useMemo(() => {
    if (!application) return [];

    const normalizePermitTypeName = (name: string) =>
      name.toLowerCase().replace(/\s+/g, "_");

    console.log("Permit Application Type is: ", application?.permit_type?.name);

    console.log(
      "Normalized Permit Application is, ",
      normalizePermitTypeName(application?.permit_type?.name || ""),
    );

    const isShort = SHORT_FORM_TYPES.includes(
      normalizePermitTypeName(application?.permit_type?.name || ""),
    );

    const base = needsReviewStatusUpdate
      ? ["Set to Under Review", "Overview"]
      : ["Overview"];

    if (isShort) {
      setIsShortPermit(true);
      return [...base, "Timeline", "Documents", "Decision"];
    }

    return [
      ...base,
      "Property Details",
      "Zoning Compliance",
      "Technical Review",
      "Timeline",
      "Documents",
      "Decision",
    ];
  }, [application, needsReviewStatusUpdate]);

  const handleStatusChange = async (values: z.infer<typeof reviewSchema>) => {
    try {
      const payload = {
        newStatus: values.status,
        comments: values.comments,
        ...(values.status === ApplicationStatus.ADDITIONAL_INFO_REQUESTED && {
          requiredChanges: values.requiredChanges,
        }),
        ...(values.status === ApplicationStatus.INSPECTION_PENDING && {
          inspectionDate: values.inspectionDate,
          inspectionNotes: values.inspectionNotes,
        }),
        ...(values.status === ApplicationStatus.ISSUED && {
          issuedAt: new Date().toISOString(),
        }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}applications/reviewer/applications/${permitId}/submit-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to update application status");

      toast.success(`Application status updated to ${values.status}`);
      router.push("/");
    } catch (error) {
      toast.error("Failed to update application status");
    }
  };

  const handleSetUnderReview = async () => {
    try {
      setIsSettingUnderReview(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}applications/reviewer/applications/${permitId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newStatus: ApplicationStatus.UNDER_REVIEW,
            comments: "Application set to under review",
          }),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to update application status");

      const updatedApp = await response.json();
      setApplication(updatedApp);
      setNeedsReviewStatusUpdate(false);
      setCurrentStep(0);
      toast.success("Application status updated to Under Review");
    } catch (error) {
      toast.error("Failed to update application status");
    } finally {
      setIsSettingUnderReview(false);
    }
  };

  const handleCompleteStep = async (stepIndex: number) => {
    const stepName = steps[stepIndex]; // ["Zoning Compliance", ...]
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}applications/reviewer/applications/${permitId}/steps/${stepName}/complete`,
        {
          method: "POST",
          credentials: "include", // send auth cookies
        },
      );

      if (!completedSteps.includes(stepIndex)) {
        setCompletedSteps([...completedSteps, stepIndex]);
      }
      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Failed to mark step complete:", err);
    }
  };

  const handleFlagStep = async (values: z.infer<typeof flagSchema>) => {
    try {
      setIsFlagging(true);
      const stepName = steps[currentStep];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}applications/reviewer/applications/${permitId}/steps/${stepName}/flag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: values.reason }),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to flag step");

      toast.success("Step flagged successfully");
      flagForm.reset();
    } catch (error) {
      toast.error("Failed to flag step");
    } finally {
      setIsFlagging(false);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const canProceedToNextStep = (stepIndex: number) => {
    // First step (Set to Under Review) doesn't need completion
    if (needsReviewStatusUpdate && stepIndex === 0) return true;

    // Decision step is handled by the form submission
    if (steps[stepIndex] === "Decision") return true;

    // Check if current step is completed
    return completedSteps.includes(stepIndex);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading application...</div>;
  }

  if (!application) {
    return <div className="p-8 text-center">Application not found</div>;
  }

  return (
    <div className="p-6 py-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Reviewing: {application.project_name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {application.application_number}
                </Badge>
                <Badge>{application.permit_type?.name}</Badge>
                <Badge variant="secondary">{application.status}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Back to Dashboard
            </Button>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      currentStep >= index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                      completedSteps.includes(index)
                        ? "bg-green-500 text-white"
                        : "",
                    )}
                  >
                    {completedSteps.includes(index) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      currentStep >= index
                        ? "font-medium"
                        : "text-muted-foreground",
                      completedSteps.includes(index)
                        ? "text-green-600 font-medium"
                        : "",
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review content */}
          <AnimatePresence mode="wait">
            {steps[currentStep] === "Set to Under Review" && (
              <motion.div
                key="set-under-review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Set Application to Under Review</span>
                    </CardTitle>
                    <CardDescription>
                      This will change the application status to &quot;Under
                      Review&quot; and notify the applicant.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>
                        Current Status:{" "}
                        <Badge variant="outline">{application.status}</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        The application must be in &quot;Under Review&quot;
                        status before proceeding with the review.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSetUnderReview}
                        disabled={isSettingUnderReview}
                      >
                        {isSettingUnderReview
                          ? "Updating..."
                          : "Set to Under Review"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {steps[currentStep] === "Overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      <span>Project Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Project Name
                        </h4>
                        <p>{application.project_name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Description
                        </h4>
                        <p>
                          {application.project_description ||
                            "No description provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Applicant
                        </h4>
                        <p>{application.applicant?.full_name} </p>

                        <p className="text-sm text-muted-foreground">
                          {application.applicant?.email}
                        </p>
                      </div>
                      {application.architect && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Architect/Professional
                          </h4>
                          <p>{application.architect.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {application.architect.firm_name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          MMDA
                        </h4>
                        <p>{application.mmda?.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Address
                        </h4>
                        <p>{application.project_address}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Parcel Number
                        </h4>
                        <p>{application.parcel_number}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Application Date
                        </h4>
                        <p>{format(new Date(application.created_at), "PPP")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isShortPermit && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>Project Location</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {application.latitude && application.longitude ? (
                        <MapPreview
                          lat={application.latitude}
                          lng={application.longitude}
                          readonly
                          className="h-64 rounded-md border"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          No location data
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBackStep}
                    disabled={currentStep === 0}
                  >
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Overview Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Property Details" && (
              <motion.div
                key="property"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="h-5 w-5" />
                      <span>Property Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Previous Land Use
                        </h4>
                        <p>
                          {application.previous_land_use?.name ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Site Conditions
                        </h4>

                        {application.site_conditions?.length ? (
                          <ul className="list-disc pl-5">
                            {application.site_conditions.map((cond) => (
                              <li key={cond.name}>{cond.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <>
                            <p>No site conditions reported</p>
                            <ComplianceIndicator
                              meets={true}
                              label="Site Conditions"
                              tooltip="No site conditions reported — assumed compliant"
                            />
                          </>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Drainage Type
                        </h4>
                        <p>
                          {application.drainage_type?.name || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Estimated Cost
                        </h4>
                        <p>
                          {application.estimated_cost
                            ? `₵${application.estimated_cost.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Construction Area
                        </h4>
                        <p>
                          {application.construction_area
                            ? `${application.construction_area.toLocaleString()} m²`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Parking Spaces
                        </h4>
                        <p>{application.parking_spaces ?? "Not specified"}</p>

                        {application.parking_spaces == null ? (
                          <ComplianceIndicator
                            meets={true}
                            label="Parking Compliance"
                            tooltip="No parking provided — assumed compliant without specified requirement"
                          />
                        ) : application.zoning_district?.parking_requirement ? (
                          <ComplianceIndicator
                            meets={undefined} // Neutral/warning state
                            label="Parking Compliance"
                            tooltip={`Cannot verify parking compliance: "${application.zoning_district.parking_requirement}" — unit count is missing.`}
                          />
                        ) : (
                          <ComplianceIndicator
                            meets={true}
                            label="Parking Compliance"
                            tooltip="No zoning requirement provided"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      <span>Property Boundary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.parcel_geometry ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Shape Type
                          </p>
                          <p className="font-mono">
                            {application.parcel_geometry.type}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Vertex Count
                          </p>
                          <p className="font-mono">
                            {getVertexCount(application.parcel_geometry)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Approx. Area
                          </p>
                          <p className="font-mono">
                            {calculateArea(application.parcel_geometry)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Approx. Perimeter
                          </p>
                          <p className="font-mono">
                            {calculatePerimeter(application.parcel_geometry)}
                          </p>
                        </div>
                        <CoordinateTable
                          points={getSampleCoordinates(
                            application.parcel_geometry,
                          )}
                          title="Property Spatial Boundaries"
                        />
                        {application.spatial_data && (
                          <CoordinateTable
                            points={getSampleCoordinates(
                              application.spatial_data,
                            )}
                            title="Plot Spatial Boundaries"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No boundary data</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false); // 👈 close the dialog
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Property Details Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Zoning Compliance" && (
              <motion.div
                key="zoning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="h-5 w-5" />
                      <span>Zoning Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Zoning District
                        </h4>
                        <p>
                          {application.zoning_district
                            ? `${application.zoning_district.name} (${application.zoning_district.code})`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Permitted Use
                        </h4>
                        <p>{application.zoning_use?.use || "Not specified"}</p>
                        <ComplianceIndicator
                          meets={true}
                          label="Use Compliance"
                          tooltip="Use complies with the permitted zoning classification"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Zoning Compliance
                        </h4>
                        {application.zoning_district && (
                          <div className="mt-2 space-y-3">
                            {/* Plot Size Compliance */}
                            {application.zoning_district?.min_plot_size && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="block">Min Plot Size</span>
                                  <span className="text-xs text-muted-foreground">
                                    {calculateArea(application.parcel_geometry)}{" "}
                                    / Required:{" "}
                                    {application.zoning_district.min_plot_size}
                                    m²
                                  </span>
                                </div>
                                <ComplianceIndicator
                                  meets={
                                    parseFloat(
                                      calculateArea(
                                        application.parcel_geometry,
                                      ),
                                    ) >=
                                    application.zoning_district.min_plot_size
                                  }
                                />
                              </div>
                            )}

                            {/* Coverage Ratio */}
                            {application.zoning_district.max_coverage &&
                              application.construction_area && (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="block">Max Coverage</span>
                                    <span className="text-xs text-muted-foreground">
                                      {(
                                        (application.construction_area /
                                          parseFloat(
                                            calculateArea(
                                              application.parcel_geometry,
                                            ),
                                          )) *
                                        100
                                      ).toFixed(1)}
                                      % / Allowed:{" "}
                                      {application.zoning_district
                                        .max_coverage * 100}
                                      %
                                    </span>
                                  </div>
                                  <ComplianceIndicator
                                    meets={
                                      application.construction_area /
                                        parseFloat(
                                          calculateArea(
                                            application.parcel_geometry,
                                          ),
                                        ) <=
                                      (application.zoning_district
                                        ?.max_coverage || 0)
                                    }
                                    label="Coverage Ratio"
                                    tooltip={`${(
                                      (application.construction_area /
                                        parseFloat(
                                          calculateArea(
                                            application.parcel_geometry,
                                          ),
                                        )) *
                                      100
                                    ).toFixed(1)}% of parcel`}
                                  />
                                </div>
                              )}

                            {/* Setback Verification */}
                            {application.zoning_district.setbacks &&
                              application.setbacks && (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="block">
                                      Setback Compliance
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {Object.entries(application.setbacks).map(
                                        ([side, value]) => (
                                          <span key={side}>
                                            {side}: {value}m{" "}
                                          </span>
                                        ),
                                      )}
                                    </span>
                                  </div>
                                  <ComplianceIndicator
                                    meets={
                                      application.setbacks &&
                                      application.zoning_district?.setbacks
                                        ? (
                                            [
                                              "front",
                                              "sides",
                                              "rear",
                                            ] as SetbackSides[]
                                          ).every((side) => {
                                            const required =
                                              application.zoning_district
                                                ?.setbacks?.[side] || 0;
                                            const provided =
                                              application.setbacks?.[side] || 0;
                                            return provided >= required;
                                          })
                                        : true // Compliant if no setbacks are defined
                                    }
                                  />
                                </div>
                              )}

                            {/* Parking Requirements */}
                            {application.zoning_district
                              .parking_requirement && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="block">Parking Spaces</span>
                                  <span className="text-xs text-muted-foreground">
                                    Provided: {application.parking_spaces || 0}{" "}
                                    / Required:{" "}
                                    {
                                      application.zoning_district
                                        .parking_requirement
                                    }
                                  </span>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ComplianceIndicator
                                        meets={(() => {
                                          const requiredSpaces =
                                            parseParkingRequirement(
                                              application.zoning_district
                                                ?.parking_requirement,
                                            );
                                          if (requiredSpaces === null)
                                            return true; // No requirement = compliant
                                          return (
                                            (application.parking_spaces || 0) >=
                                            requiredSpaces
                                          );
                                        })()}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Provided:{" "}
                                      {application.parking_spaces || 0} spaces
                                      <br />
                                      Required:{" "}
                                      {application.zoning_district
                                        ?.parking_requirement || "None"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}

                            {/* Height Limit */}
                            {application.zoning_district.max_height && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="block">Max Height</span>
                                  <span className="text-xs text-muted-foreground">
                                    Proposed:{" "}
                                    {application.floor_areas?.maxHeight ||
                                      "N/A"}
                                    m / Limit:{" "}
                                    {application.zoning_district.max_height}m
                                  </span>
                                </div>
                                <ComplianceIndicator
                                  meets={
                                    (application.floor_areas?.maxHeight || 0) <=
                                    application.zoning_district.max_height
                                  }
                                />
                              </div>
                            )}
                            <ComplianceIndicator
                              meets={isParcelContained(
                                application.spatial_data,
                                application.parcel_geometry,
                              )}
                              label="Zoning Boundary"
                              tooltip="Verifies parcel is fully within designated zoning area"
                            />

                            <ComplianceIndicator
                              meets={isLocationNearParcel(
                                application.parcel_geometry,
                                application.project_location,
                              )}
                              label="Location Verification"
                              tooltip="Ensures project location matches parcel coordinates"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>Zoning District</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.spatial_data ? (
                      <div className="h-64 rounded-md border">
                        <SpatialPolygonInput
                          value={JSON.stringify(application.parcel_geometry)}
                          onChange={() => {}}
                          center={[
                            application.latitude ?? 0,
                            application.longitude ?? 0,
                          ]}
                          referencePolygon={
                            application.spatial_data
                              ? JSON.stringify(application.spatial_data)
                              : undefined
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No zoning district data
                      </p>
                    )}
                  </CardContent>
                  <CardContent>
                    <h2>Compliant Map</h2>
                    {application.parcel_geometry ? (
                      <ComplianceMap
                        parcelGeometry={application.parcel_geometry}
                        spatialData={application.spatial_data}
                        constructionArea={application.construction_area}
                        maxCoverage={application.zoning_district?.max_coverage}
                        center={[
                          application.latitude || 0,
                          application.longitude || 0,
                        ]}
                        locationNear={isLocationNearParcel(
                          application.parcel_geometry,
                          application.project_location,
                        )}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        No parcel boundary data available
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false); // 👈 close the dialog
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Zoning Compliance Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Technical Review" && (
              <motion.div
                key="technical"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <HardHat className="h-5 w-5" />
                      <span>Technical Specifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      {/* Proposed Height */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Proposed Height
                        </h4>
                        <p>
                          {application.floor_areas?.maxHeight
                            ? `${application.floor_areas.maxHeight}m`
                            : "Not specified"}
                        </p>
                        {application.floor_areas?.maxHeight &&
                          application.zoning_district?.max_height && (
                            <ComplianceIndicator
                              meets={
                                application.floor_areas.maxHeight <=
                                application.zoning_district.max_height
                              }
                              label="Height Compliance"
                              tooltip={`Zoning limit: ${application.zoning_district.max_height}m`}
                            />
                          )}
                      </div>

                      {/* Proposed Coverage */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Proposed Coverage
                        </h4>
                        <p>
                          {application.floor_areas?.maxCoverage
                            ? `${Math.round(
                                application.floor_areas.maxCoverage * 100,
                              )}%`
                            : "Not specified"}
                        </p>
                        {application.floor_areas?.maxCoverage &&
                          application.zoning_district?.max_coverage && (
                            <ComplianceIndicator
                              meets={
                                application.floor_areas.maxCoverage <=
                                application.zoning_district.max_coverage
                              }
                              label="Coverage Compliance"
                              tooltip={`Zoning limit: ${Math.round(
                                application.zoning_district.max_coverage * 100,
                              )}%`}
                            />
                          )}
                      </div>

                      {/* Setbacks */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Setbacks
                        </h4>
                        {application.setbacks ? (
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                "front",
                                "rear",
                                "left",
                                "right",
                              ] as SetbackSides[]
                            ).map((side) => (
                              <div key={side}>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {side}
                                </span>
                                <p>{application.setbacks?.[side] ?? "-"}</p>

                                {application.setbacks?.[side] != null &&
                                  application.zoning_district?.setbacks?.[
                                    side
                                  ] != null && (
                                    <ComplianceIndicator
                                      meets={
                                        application.setbacks[side]! >=
                                        application.zoning_district.setbacks[
                                          side
                                        ]!
                                      }
                                      label={`${
                                        side.charAt(0).toUpperCase() +
                                        side.slice(1)
                                      } Setback`}
                                      tooltip={`Minimum required: ${application.zoning_district.setbacks[side]}m`}
                                    />
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No setback information</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Fire Safety Plan
                        </h4>
                        <p>{application.fire_safety_plan || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Waste Management Plan
                        </h4>
                        <p>
                          {application.waste_management_plan || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Buffer Zones
                        </h4>
                        <p>
                          {application.floor_areas?.buffer_zones ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Density
                        </h4>
                        <p>
                          {application.floor_areas?.density ?? "Not specified"}
                        </p>

                        {application.floor_areas?.density == null ? (
                          <ComplianceIndicator
                            meets={true}
                            label="Density Compliance"
                            tooltip="No density provided — assumed compliant"
                          />
                        ) : application.zoning_district?.density != null ? (
                          <ComplianceIndicator
                            meets={
                              application.floor_areas.density <=
                              application.zoning_district.density
                            }
                            label="Density Compliance"
                            tooltip={`Zoning limit: ${application.zoning_district.density}`}
                          />
                        ) : (
                          <ComplianceIndicator
                            meets={undefined}
                            label="Density Compliance"
                            tooltip="Cannot verify compliance — zoning density requirement not provided"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false); // 👈 close the dialog
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Technical Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>Project Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Expected Start Date
                        </h4>
                        <p>
                          {application.expected_start_date
                            ? format(
                                new Date(application.expected_start_date),
                                "PPP",
                              )
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Expected End Date
                        </h4>
                        <p>
                          {application.expected_end_date
                            ? format(
                                new Date(application.expected_end_date),
                                "PPP",
                              )
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Application Date
                        </h4>
                        <p>{format(new Date(application.created_at), "PPP")}</p>
                      </div>
                      {application.submitted_at && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Submission Date
                          </h4>
                          <p>
                            {format(new Date(application.submitted_at), "PPP")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false); // 👈 close the dialog
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Timeline Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Submitted Documents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.documents &&
                    application.documents.length > 0 ? (
                      <div className="space-y-4">
                        <Tabs defaultValue="all" className="w-full">
                          <TabsList>
                            <TabsTrigger value="all">All Documents</TabsTrigger>
                            {application.permit_type && (
                              <>
                                <TabsTrigger value="required">
                                  Required Documents
                                </TabsTrigger>
                                <TabsTrigger value="additional">
                                  Additional Documents
                                </TabsTrigger>
                              </>
                            )}
                          </TabsList>
                          <TabsContent value="all">
                            <DocumentViewer
                              documents={application.documents.map(
                                (doc, idx) => ({
                                  id: idx,
                                  name:
                                    doc.document_type?.name ??
                                    "Unnamed document",
                                  file_url: doc.file_path,
                                  document_type:
                                    doc.document_type?.name ?? "Unknown",
                                }),
                              )}
                              permitType={
                                application.permit_type
                                  ? {
                                      ...application.permit_type,
                                      id: Number(application.permit_type.id),
                                    }
                                  : undefined
                              }
                            />
                          </TabsContent>

                          {application.permit_type && (
                            <>
                              <TabsContent value="required">
                                <DocumentViewer
                                  documents={application.documents
                                    .filter((doc) =>
                                      application.permit_type!.required_documents?.some(
                                        (req) =>
                                          req.document_type_id ===
                                          doc.document_type?.id,
                                      ),
                                    )
                                    .map((doc, idx) => ({
                                      id: idx,
                                      name:
                                        doc.document_type?.name ?? "Unnamed",
                                      file_url: doc.file_path,
                                      document_type:
                                        doc.document_type?.name ?? "Unknown",
                                    }))}
                                  permitType={{
                                    ...application.permit_type,
                                    id: Number(application.permit_type.id),
                                  }}
                                />
                              </TabsContent>

                              <TabsContent value="additional">
                                <DocumentViewer
                                  documents={application.documents
                                    .filter(
                                      (doc) =>
                                        !application.permit_type!.required_documents?.some(
                                          (req) =>
                                            req.document_type_id ===
                                            doc.document_type_id,
                                        ),
                                    )
                                    .map((doc, idx) => ({
                                      id: idx,
                                      name:
                                        doc.document_type?.name ?? "Unnamed",
                                      file_url: doc.file_path,
                                      document_type:
                                        doc.document_type?.name ?? "Unknown",
                                    }))}
                                  permitType={{
                                    ...application.permit_type,
                                    id: Number(application.permit_type.id),
                                  }}
                                />
                              </TabsContent>
                            </>
                          )}
                        </Tabs>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No documents submitted yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBackStep}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Flag This Step</DialogTitle>
                          <DialogDescription>
                            Please provide details about the issue you&apos;ve
                            found in this step.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...flagForm}>
                          <form
                            onSubmit={flagForm.handleSubmit(handleFlagStep)}
                            className="space-y-4"
                          >
                            <FormField
                              control={flagForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Flagging</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe the issue..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  flagForm.reset();
                                  setIsDialogOpen(false); // 👈 close the dialog
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isFlagging}>
                                {isFlagging ? "Submitting..." : "Submit Flag"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => handleCompleteStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                    >
                      {completedSteps.includes(currentStep) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Step Completed
                        </>
                      ) : (
                        "Complete Document Review"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {steps[currentStep] === "Decision" && (
              <motion.div
                key="decision"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleStatusChange)}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <ScrollText className="h-5 w-5" />
                          <span>Review Decision</span>
                        </CardTitle>
                        <CardDescription>
                          Select the action you wish to take on this application
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            value: ApplicationStatus.APPROVED,
                            label: "Approve",
                            icon: <Check className="text-green-600" />,
                          },
                          {
                            value: ApplicationStatus.REJECTED,
                            label: "Reject",
                            icon: <X className="text-red-600" />,
                          },
                          {
                            value: ApplicationStatus.ADDITIONAL_INFO_REQUESTED,
                            label: "Request Info",
                            icon: <Info className="text-yellow-600" />,
                          },
                          {
                            value: ApplicationStatus.INSPECTION_PENDING,
                            label: "Schedule Inspection",
                          },
                          {
                            value: ApplicationStatus.FOR_APPROVAL_OR_REJECTION,
                            label: "Send for Approval",
                            icon: <ArrowRight className="text-purple-600" />,
                          },
                          // {
                          //   value: ApplicationStatus.ISSUED,
                          //   label: "Issue Permit",
                          //   icon: <Scroll className="text-green-800" />,
                          // },
                          {
                            value: ApplicationStatus.COMPLETED,
                            label: "Mark Completed",
                            icon: <CheckCircle className="text-teal-600" />,
                          },
                          {
                            value: ApplicationStatus.CANCELLED,
                            label: "Cancel",
                            icon: <Ban className="text-red-500" />,
                          },
                          // {
                          //   value: ApplicationStatus.UNDER_REVIEW,
                          //   label: "Under Review",
                          //   icon: <Clock className="text-gray-500" />,
                          // },
                        ].map(({ value, label, icon }) => (
                          <Button
                            type="button"
                            key={value}
                            variant={
                              form.watch("status") === value
                                ? "default"
                                : "outline"
                            }
                            className="flex items-center gap-2 justify-start"
                            onClick={() => form.setValue("status", value)}
                          >
                            {icon}
                            {label}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>

                    {form.watch("status") ===
                      ApplicationStatus.ADDITIONAL_INFO_REQUESTED && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Requested Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={form.control}
                            name="requiredChanges"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Details</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="What additional information is required?"
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {form.watch("status") ===
                      ApplicationStatus.INSPECTION_PENDING && (
                      <Card className="rounded-2xl shadow-sm border">
                        <CardHeader>
                          <CardTitle className="text-xl font-semibold">
                            Schedule Inspection
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Inspection Date */}
                          <FormField
                            control={form.control}
                            name="inspectionDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mb-1 text-sm font-medium text-muted-foreground">
                                  Inspection Date
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span className="text-muted-foreground">
                                            Pick a date
                                          </span>
                                        )}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 mt-2 z-50 shadow-lg border rounded-xl">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Notes */}
                          <FormField
                            control={form.control}
                            name="inspectionNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-muted-foreground">
                                  Notes
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Add any notes for the inspector..."
                                    className="min-h-[100px] resize-none rounded-md"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {form.watch("status") === ApplicationStatus.ISSUED && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <ScrollText className="h-4 w-4 text-blue-600" />
                        <AlertTitle>Issuing Permit</AlertTitle>
                        <AlertDescription>
                          This will notify the applicant and issue the final
                          permit document.
                        </AlertDescription>
                      </Alert>
                    )}
                    {form.watch("status") === ApplicationStatus.CANCELLED && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle>Application Cancelled</AlertTitle>
                        <AlertDescription>
                          This action is irreversible and the applicant will be
                          notified.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Final Comments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="comments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Comments</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Provide review summary..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nextSteps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Steps</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="What are the next steps for the applicant?"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBackStep}
                      >
                        Back
                      </Button>
                      <Button type="submit">Submit Review</Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Application Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <h4 className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Status
                </h4>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {application.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <HardHat className="h-4 w-4 text-muted-foreground" />
                  Permit Type
                </h4>
                <p>{application.permit_type?.name}</p>
              </div>

              <div>
                <h4 className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Submitted
                </h4>
                <p>
                  {format(
                    new Date(
                      application.submitted_at || application.created_at,
                    ),
                    "PPP",
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Estimated Cost
                </h4>
                <p>
                  {application.estimated_cost
                    ? `₵${application.estimated_cost.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {steps.map((stepName, index) => (
                  <Button
                    key={stepName}
                    variant={currentStep === index ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentStep(index)}
                    disabled={
                      index > currentStep && !completedSteps.includes(index)
                    }
                  >
                    {stepName}
                    {completedSteps.includes(index) && (
                      <Check className="ml-auto h-4 w-4 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
