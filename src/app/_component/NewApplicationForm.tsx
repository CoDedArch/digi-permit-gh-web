"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { PermitTypeWithRequirements, ZoningDistrict } from "@/types";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DocumentType,
  getCurrentUser,
  getZoningUses,
  initiatePayment,
  ZoningUse,
} from "../data/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MMDAPicker from "@/components/MmdaPicker";

// import SpatialPolygonInput from "@/components/SpatialInputPlot";
const SpatialPolygonInput = dynamic(
  () => import("@/components/SpatialInputPlot"),
  {
    ssr: false,
  },
);
const MapPreview = dynamic(() => import("@/components/MapPreview"), {
  ssr: false,
});
// Type-safe way to delete _getIconUrl property
const sensitiveZoneCodes = ["Ru A", "IN", "IE", "CZ", "SE"];
const SHORT_FORM_TYPES = [
  "sign_permit",
  "subdivision",
  "temporary_structure",
  "fittings_installation",
  "hoarding",
  "sand_weaning",
];

const LONG_FORM_TYPES = [
  "new_construction",
  "renovation_alteration",
  "change_of_use",
  "demolition",
];

const architectSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  firm_name: z.string().optional(),
  license_number: z.string().optional(),
  role: z.string().optional().default("architect"),
});

const createApplicationSchema = z.object({
  permitTypeId: z.any(),
  projectName: z.string().min(1),
  projectDescription: z.string().optional(),
  projectAddress: z.string().min(1),
  parcelNumber: z.string().min(1),
  zoningDistrictId: z.string().min(1).optional(),
  zoningUseId: z.string().min(1).optional(),
  architectId: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).nullable().optional(),
  constructionArea: z.coerce.number().min(0).nullable().optional(),
  expectedStartDate: z.coerce.date().optional(),
  expectedEndDate: z.coerce.date().optional(),
  drainageTypeId: z.string().optional().or(z.literal("")),
  siteConditionIds: z.array(z.string()).optional(),
  previousLandUseId: z.string().min(1, "Required").optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  parcelGeometry: z.any().optional(), // For GeoJSON polygon
  projectLocation: z.any().optional(), // For GeoJSON point
  gisMetadata: z.record(z.any()).optional(),
  zoningDistrictSpatial: z.any().optional(),
  maxHeight: z.coerce.number().min(0).nullable().optional(),
  maxCoverage: z.coerce.number().min(0).max(1).nullable().optional(),
  minPlotSize: z.coerce.number().min(0).nullable().optional(),
  parkingSpaces: z.coerce.number().min(0).nullable().optional(),
  landscapeArea: z.coerce.number().min(0).nullable().optional(),
  occupantCapacity: z.coerce.number().min(0).nullable().optional(),
  setbackFront: z.coerce.number().min(0).nullable().optional(),
  setbackRear: z.coerce.number().min(0).nullable().optional(),
  setbackLeft: z.coerce.number().min(0).nullable().optional(),
  setbackRight: z.coerce.number().min(0).nullable().optional(),

  setbacks: z.string().optional(),
  bufferZones: z.string().optional(),
  density: z.string().optional(),
  fireSafetyPlan: z.any().optional(),
  wasteManagementPlan: z.any().optional(),

  documentUploads: z.record(
    z.object({
      file_url: z.string().url(),
      doc_type_id: z.string(),
    }),
  ),

  // Schema
  mmdaId: z.string().min(1, "Please select an MMDA"),
  architect: architectSchema.optional(),
});

interface NewApplicationFormProps {
  permitType: PermitTypeWithRequirements;
  zoningDistricts: ZoningDistrict[];
  // zoningUses: { id: string; use: string; zoning_district_id: string }[];
  drainageTypes: { id: string; name: string; description?: string }[];
  siteConditions: { id: number; name: string; description?: string }[];
  previousLandUses: { id: string; name: string }[];
  mmdas: {
    id: number;
    name: string;
    type: string;
    region: string;
    contact_email?: string;
    contact_phone?: string;
    jurisdiction_boundaries?: GeoJSON.Polygon;
  }[];
}

export default function NewApplicationForm({
  permitType,
  zoningDistricts,
  drainageTypes,
  siteConditions,
  previousLandUses,
  mmdas,
}: NewApplicationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [showArchitectFields, setShowArchitectFields] = useState(false);
  const form = useForm({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      permitTypeId: permitType.id,
      projectName: "",
      projectDescription: "",
      projectAddress: "",
      parcelNumber: "",
      zoningDistrictId: "",
      zoningUseId: "",
      architectId: "",
      estimatedCost: null,
      constructionArea: null,
      expectedStartDate: undefined,
      expectedEndDate: undefined,
      drainageTypeId: "",
      siteConditionIds: [],
      previousLandUseId: "",
      latitude: 5.6037, // Accra latitude
      longitude: -0.187, // Accra longitude
      parcelGeometry: undefined,
      projectLocation: undefined,
      gisMetadata: undefined,
      zoningDistrictSpatial: undefined,
      maxHeight: null,
      maxCoverage: null,
      minPlotSize: null,
      parkingSpaces: null,
      setbacks: "",
      bufferZones: "",
      density: "",
      landscapeArea: null,
      occupantCapacity: null,
      fireSafetyPlan: "",
      wasteManagementPlan: "",
      setbackFront: null,
      setbackRear: null,
      setbackLeft: null,
      setbackRight: null,
      documentUploads: {},

      // Default values
      mmdaId: "",

      architect: {
        full_name: "",
        email: "",
        phone: "",
        firm_name: "",
        license_number: "",
        role: "architect",
      },
    },
  });

  const selectedZoningDistrictId = useWatch({
    control: form.control,
    name: "zoningDistrictId",
  });

  const selectedZoningDistrict = zoningDistricts.find(
    (zd) => String(zd.id) === String(selectedZoningDistrictId),
  );

  const isSensitiveDistrict = selectedZoningDistrict
    ? sensitiveZoneCodes.includes(selectedZoningDistrict.code)
    : false;

  const [zoningUses, setZoningUses] = useState<ZoningUse[]>([]);
  const [loadingUses, setLoadingUses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedStartDate = useWatch({
    control: form.control,
    name: "expectedStartDate",
  });

  const selectedZoningUse = zoningUses.find(
    (z) => String(z.id) === String(form.watch("zoningUseId")),
  );

  const steps = useMemo(() => {
    const isShort = SHORT_FORM_TYPES.includes(permitType.id);
    const base = ["Project Information"];

    if (isShort) {
      return [...base, "Timeline", "Documents", "Finish"];
    }

    return [
      ...base,
      "Zoning Districts",
      "Zoning Uses",
      "Technical",
      "Timeline",
      "Documents",
      "Finish",
    ];
  }, [permitType.id]);

  const lat = form.watch("latitude");
  const lng = form.watch("longitude");

  const handleFileUpload = async (file: File, docTypeId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type_id", docTypeId);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}uploads/application-documents`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );

    const result = await res.json();

    form.setValue(`documentUploads.${docTypeId}`, {
      file_url: result.file_url, // Save URL instead of file
      doc_type_id: docTypeId,
    });
  };

  // Handle payment
  const handlePayment = async () => {
    try {
      const callbackUrl = `${window.location.origin}/payment/verify`;

      // ✅ 1. Save form state + permit type + redirect URL
      const formData = form.getValues();
      localStorage.setItem("pendingApplication", JSON.stringify(formData));
      localStorage.setItem("pendingPermitTypeId", permitType.id);
      localStorage.setItem("pendingRedirectUrl", window.location.pathname);

      // ✅ 2. Initiate payment
      const payment = await initiatePayment({
        amount: permitType.base_fee,
        callbackUrl,
      });

      toast.info("Redirecting to Paystack...");
      window.location.href = payment.authorization_url;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Payment initiation failed");
      } else {
        toast.error("Payment initiation failed");
      }
    }
  };

  async function onSubmit(values: z.infer<typeof createApplicationSchema>) {
    try {
      const payload = {
        ...values,
        expected_start_date: values.expectedStartDate,
        expected_end_date: values.expectedEndDate,
        parcelGeometry:
          typeof values.parcelGeometry === "string"
            ? JSON.parse(values.parcelGeometry)
            : values.parcelGeometry,
        zoningDistrictSpatial:
          typeof values.zoningDistrictSpatial === "string"
            ? JSON.parse(values.zoningDistrictSpatial)
            : values.zoningDistrictSpatial,
        projectLocation: {
          type: "Point",
          coordinates: [values.longitude, values.latitude],
        },
        gisMetadata: values.gisMetadata ?? [],
      };

      console.log("Payload:", payload);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}applications/submit-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to create application");
      const newApplication = await response.json();
      router.push(`/my-applications/${newApplication.id}`);
      toast.success("Application created successfully!");
      localStorage.removeItem("pendingApplication");
      localStorage.removeItem("pendingRedirectUrl");
      localStorage.removeItem("pendingPermitTypeId");
    } catch {
      toast.error("Error submitting application");
    }
  }

  async function getCoordinatesFromAddress(address: string) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address,
      )}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coordinates");
    }

    const data = await response.json();
    if (data.length === 0) {
      throw new Error("No coordinates found for this address");
    }

    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  }

  // Explicitly type MapPreview props and cast MapContainer props to any to avoid type error

  const formatParcelNumber = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");

    // Common parcel number formats:
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
      )}`;
    } else {
      // For longer IDs (e.g. APN formats like 123-456-789-00)
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        9,
      )}-${cleaned.slice(9, 11)}`;
    }
  };

  useEffect(() => {
    console.log("Current form errors:", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    async function fetchZoningUses() {
      if (!selectedZoningDistrictId) return;

      setLoadingUses(true);
      setError(null);
      try {
        const result = await getZoningUses(Number(selectedZoningDistrictId));
        setZoningUses(result);
      } catch {
        setError("Failed to load zoning uses.");
        setZoningUses([]);
      } finally {
        setLoadingUses(false);
      }
    }

    fetchZoningUses();
  }, [selectedZoningDistrictId]);

  useEffect(() => {
    if (SHORT_FORM_TYPES.includes(permitType.id)) {
      form.setValue("zoningDistrictId", undefined);
      form.setValue("zoningUseId", undefined);
      // reset other fields
    }
  }, [permitType.id, form]);

  useEffect(() => {
    const saved = localStorage.getItem("pendingApplication");
    const savedStep = new URLSearchParams(window.location.search).get("step");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        form.reset(parsed); // ✅ Restore values
        if (savedStep === "finish") {
          setStep(steps.indexOf("Finish")); // ✅ Jump to last step
          setHasPaid(true);
        }
      } catch {
        console.warn("Failed to parse saved form data.");
      }
    }
  }, [form, steps]);

  useEffect(() => {
    async function checkApplicantType() {
      try {
        const user = await getCurrentUser();
        if (
          user.applicant_type_code === "individual" ||
          user.applicant_type_code === "property_owner"
        ) {
          setShowArchitectFields(true);
        }
      } catch (error) {
        console.error("Failed to get user type:", error);
      }
    }

    checkApplicantType();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto space-y-8 h-full"
      >
        <div className="space-y-2">
          <div className="flex gap-4 justify-between">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    step >= index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    step >= index ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {steps[step] === "Project Information" && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  name="projectName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="projectAddress"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  name="parcelNumber"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcel Number (APN)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 123-456-789"
                          onChange={(e) => {
                            const formatted = formatParcelNumber(
                              e.target.value,
                            );
                            field.onChange(formatted);
                          }}
                          onBlur={(e) => {
                            // Ensure proper formatting on blur
                            const formatted = formatParcelNumber(
                              e.target.value,
                            );
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-muted-foreground mt-1">
                        Format: XXX-XXX-XXX or XX-XXX-XX-XXX
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  name="projectDescription"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description{" "}
                        <span className="text-muted-foreground">
                          (Recommended)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Briefly describe your project to help reviewers understand it better"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {showArchitectFields && (
                <div className="border rounded-xl p-6 space-y-6 bg-muted/50 shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      Architect Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Required if you&apos;re applying as an{" "}
                      <strong>individual</strong> or{" "}
                      <strong>property owner</strong>. Provide details of the
                      licensed professional overseeing the project.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      name="architect.full_name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="architect.email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="architect.phone"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="architect.firm_name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Firm Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="architect.license_number"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* New Location Fields Section */}
              <div className="border rounded-lg p-6 space-y-6">
                <h3 className="font-medium">Project Location</h3>

                <p className="text-sm text-muted-foreground">
                  If you&apos;re not sure of the exact coordinates, you can
                  click <strong>“Geocode from Address”</strong> to auto-fill the
                  latitude and longitude from the project address, or use{" "}
                  <strong>“Use Current Location”</strong> to fetch your
                  device&apos;s location automatically.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    name="latitude"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            min={-90}
                            max={90}
                            step="0.000001"
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="longitude"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            min={-180}
                            max={180}
                            step="0.000001"
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {lat !== undefined && lng !== undefined && (
                  <MapPreview
                    lat={lat}
                    lng={lng}
                    onLocationChange={(lat, lng) => {
                      form.setValue("latitude", lat);
                      form.setValue("longitude", lng);
                    }}
                  />
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const address = form.getValues("projectAddress");
                      if (!address) {
                        toast.error("Please enter the project address first.");
                        return;
                      }

                      toast.info("Fetching coordinates from address...");

                      try {
                        const { lat, lon } = await getCoordinatesFromAddress(
                          address,
                        );
                        form.setValue("latitude", lat);
                        form.setValue("longitude", lon);
                        toast.success("Coordinates found and set!");
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          toast.error(
                            error.message || "Failed to geocode address.",
                          );
                        } else {
                          toast.error("Failed to geocode address.");
                        }
                      }
                    }}
                  >
                    Geocode from Address
                  </Button>
                </div>
              </div>

              <MMDAPicker mmdas={mmdas} form={form} />
            </motion.div>
          )}

          {steps[step] === "Zoning Districts" && (
            <motion.div key="step-1" className="space-y-6">
              <div className="bg-muted border-l-4 border-primary p-4 rounded-md">
                <h4 className="font-semibold text-sm mb-1">
                  Confused about Zoning Districts?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Zoning districts are areas defined by local authorities that
                  determine what kind of developments are permitted there.
                  Ghanaian law requires that every project be situated in an
                  appropriate zoning district — for example, residential,
                  commercial, industrial, or mixed-use zones. Choosing the
                  correct zoning district ensures compliance and avoids future
                  legal or planning issues.
                </p>
              </div>
              <FormField
                name="zoningDistrictId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zoning District</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {zoningDistricts.map((district) => {
                        const isSelected =
                          String(field.value) === String(district.id);

                        return (
                          <div
                            key={district.id}
                            onClick={() => field.onChange(district.id)}
                            className={cn(
                              "border rounded-xl p-4 cursor-pointer transition-shadow shadow-sm h-fit",
                              isSelected
                                ? "border-primary ring-2 ring-primary bg-muted"
                                : "hover:shadow-md",
                            )}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-base font-semibold">
                                  {district.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {district.code}
                                </p>
                              </div>
                              {district.color_code && (
                                <div
                                  className="h-5 w-5 rounded-full border"
                                  style={{
                                    backgroundColor: district.color_code,
                                  }}
                                  title={`Color Code: ${district.color_code}`}
                                />
                              )}
                            </div>

                            {/* Description */}
                            {district.description && (
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                {district.description}
                              </p>
                            )}

                            {/* Grid of Key Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              {district.population_served && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Population:
                                  </span>{" "}
                                  {district.population_served}
                                </div>
                              )}
                              {district.max_coverage && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Max Coverage:
                                  </span>{" "}
                                  {district.max_coverage}%
                                </div>
                              )}
                              {district.max_height && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Max Height:
                                  </span>{" "}
                                  {district.max_height}m
                                </div>
                              )}
                              {district.min_plot_size && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Min Plot Size:
                                  </span>{" "}
                                  {district.min_plot_size} m²
                                </div>
                              )}
                              {district.parking_requirement && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Parking:
                                  </span>{" "}
                                  {district.parking_requirement}
                                </div>
                              )}
                              {district.setbacks && (
                                <div>
                                  <span className="font-medium text-foreground">
                                    Setbacks:
                                  </span>{" "}
                                  {district.setbacks}
                                </div>
                              )}
                              {district.special_notes && (
                                <div className="col-span-2">
                                  <span className="font-medium text-foreground">
                                    Notes:
                                  </span>{" "}
                                  {district.special_notes}
                                </div>
                              )}
                            </div>
                            {/* Spatial Drawing Input */}
                            {isSelected && (
                              <div className="mt-4">
                                <FormField
                                  name="zoningDistrictSpatial"
                                  control={form.control}
                                  render={({ field: spatialField }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Define Your Site Boundary (Draw Polygon)
                                      </FormLabel>
                                      <SpatialPolygonInput
                                        value={spatialField.value}
                                        onChange={spatialField.onChange}
                                        center={[
                                          form.watch("latitude") ?? 0,
                                          form.watch("longitude") ?? 0,
                                        ]}
                                      />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
          {steps[step] === "Zoning Uses" && (
            <motion.div key="step-2" className="space-y-6">
              <FormField
                name="zoningUseId"
                control={form.control}
                render={({ field }) => {
                  const selectedDistrictId = form.watch("zoningDistrictId");
                  const filteredUses = zoningUses.filter(
                    (z) =>
                      String(z.zoning_district_id) ===
                      String(selectedDistrictId),
                  );

                  return (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Allowable Land Uses
                      </FormLabel>
                      <p className="text-sm text-gray-500 mb-4">
                        Select a land use that matches your project. These uses
                        are permitted in the selected zoning district.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUses.map((use) => {
                          const isSelected =
                            String(field.value) === String(use.id);

                          return (
                            <div
                              key={use.id}
                              onClick={() => field.onChange(String(use.id))}
                              className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="font-medium text-gray-800">
                                {use.use}
                              </div>

                              <div className="mt-2 space-x-2 text-xs">
                                {use.requires_epa_approval && (
                                  <span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5">
                                    EPA Required
                                  </span>
                                )}
                                {use.requires_heritage_review && (
                                  <span className="inline-block rounded-full bg-rose-100 text-rose-800 px-2 py-0.5">
                                    Heritage Review
                                  </span>
                                )}
                                {use.requires_traffic_study && (
                                  <span className="inline-block rounded-full bg-purple-100 text-purple-800 px-2 py-0.5">
                                    Traffic Study
                                  </span>
                                )}
                              </div>

                              {isSelected && (
                                <div className="mt-2 text-blue-600 font-medium text-sm">
                                  Selected
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </motion.div>
          )}

          {steps[step] === "Technical" && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-3 rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-900 mb-6">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Please Review Carefully</p>
                  <p>
                    The values you enter for technical parameters such as
                    height, coverage, and plot size must reflect the proposed
                    development accurately. Incorrect or misleading information
                    may result in application delays or rejection, and the
                    applicant bears full responsibility for any discrepancies.
                  </p>
                </div>
              </div>
              <div className="space-y-10 mb-10">
                <FormField
                  name="parcelGeometry"
                  control={form.control}
                  render={({ field: parcelField }) => (
                    <FormItem>
                      <FormLabel>Define Property Boundary (Parcel)</FormLabel>
                      <SpatialPolygonInput
                        value={parcelField.value}
                        onChange={parcelField.onChange}
                        center={[
                          form.watch("latitude") ?? 0,
                          form.watch("longitude") ?? 0,
                        ]}
                        referencePolygon={form.watch("zoningDistrictSpatial")} // 👈 Overlay reference
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="gisMetadata"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GIS Metadata (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {Array.isArray(field.value)
                            ? field.value.map(
                                (
                                  entry: { key: string; value: string },
                                  index: number,
                                ) => (
                                  <div
                                    key={index}
                                    className="grid grid-cols-2 gap-2"
                                  >
                                    <Input
                                      placeholder="Key"
                                      value={entry.key}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(Array.isArray(field.value)
                                            ? field.value
                                            : []),
                                        ];
                                        updated[index].key = e.target.value;
                                        field.onChange(updated);
                                      }}
                                    />
                                    <Input
                                      placeholder="Value"
                                      value={entry.value}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(Array.isArray(field.value)
                                            ? field.value
                                            : []),
                                        ];
                                        updated[index].value = e.target.value;
                                        field.onChange(updated);
                                      }}
                                    />
                                  </div>
                                ),
                              )
                            : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              field.onChange([
                                ...(Array.isArray(field.value)
                                  ? field.value
                                  : []),
                                { key: "", value: "" },
                              ])
                            }
                          >
                            + Add Metadata
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Technical Inputs + Zoning Reference Panel */}
              {!!selectedZoningDistrict && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* User Inputs */}

                  <div className="space-y-6">
                    <FormField
                      name="maxHeight"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed Max Height (m)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="maxCoverage"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed Site Coverage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={
                                field.value != null ? field.value * 100 : ""
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value) / 100
                                    : null,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="minPlotSize"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proposed Min Plot Size (m²)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Zoning Reference */}
                  <div className="rounded-md border p-4 bg-gray-50 space-y-2 text-sm text-gray-700">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">
                      Zoning District Reference
                    </h4>
                    <p>
                      <strong>Max Height:</strong>{" "}
                      {selectedZoningDistrict.max_height ?? "N/A"} m
                    </p>
                    <p>
                      <strong>Max Coverage:</strong>{" "}
                      {(selectedZoningDistrict.max_coverage ?? 0) * 100}%
                    </p>
                    <p>
                      <strong>Min Plot Size:</strong>{" "}
                      {selectedZoningDistrict.min_plot_size ?? "N/A"} m²
                    </p>
                    <p>
                      <strong>Density:</strong>{" "}
                      {selectedZoningDistrict.density ?? "N/A"}
                    </p>
                    <p>
                      <strong>Population Served:</strong>{" "}
                      {selectedZoningDistrict.population_served ?? "N/A"}
                    </p>
                    <p>
                      <strong>Setbacks:</strong>{" "}
                      {selectedZoningDistrict.setbacks ?? "N/A"}
                    </p>
                    <p>
                      <strong>Parking:</strong>{" "}
                      {selectedZoningDistrict.parking_requirement ?? "N/A"}
                    </p>
                    <p>
                      <strong>Buffer Zones:</strong>{" "}
                      {selectedZoningDistrict.buffer_zones ?? "N/A"}
                    </p>
                    {selectedZoningDistrict.special_notes && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        {selectedZoningDistrict.special_notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cost + Construction Area */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  name="estimatedCost"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost (₵)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="constructionArea"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Construction Area (sq ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {selectedZoningDistrict?.parking_requirement && (
                  <FormField
                    name="parkingSpaces"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Parking Spaces</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedZoningDistrict?.setbacks && (
                  <div className="space-y-4">
                    <FormLabel>Proposed Setbacks (in meters)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        name="setbackFront"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">
                              Front
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 3"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="setbackRear"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">
                              Rear
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 2"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="setbackLeft"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">
                              Left
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 1.5"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="setbackRight"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-700">
                              Right
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 1.5"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {selectedZoningDistrict?.buffer_zones && (
                  <FormField
                    name="bufferZones"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buffer Zones</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 5m from wetland"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedZoningDistrict?.density && (
                  <FormField
                    name="density"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Density</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12 dwellings/ha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  name="landscapeArea"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landscape Area (m²)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedZoningDistrict?.population_served && (
                  <FormField
                    name="occupantCapacity"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Occupant Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  name="fireSafetyPlan"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Safety Plan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Summarize fire safety provisions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="wasteManagementPlan"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Management Plan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Describe how waste will be managed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="previousLandUseId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Land Use</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select previous land use" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {previousLandUses.map((use) => (
                          <SelectItem
                            key={use.id}
                            value={use.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-accent cursor-pointer"
                          >
                            <div className="inline-block w-2 h-2 rounded-full bg-primary/50" />
                            <span className="text-sm font-medium">
                              {use.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSensitiveDistrict && (
                <FormField
                  name="siteConditionIds"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Conditions</FormLabel>
                      <div className="grid gap-2 md:grid-cols-2">
                        {siteConditions.map((condition) => {
                          const isChecked = field.value?.includes(
                            String(condition.id),
                          );
                          return (
                            <label
                              key={condition.id}
                              className={`flex items-start gap-2 border p-3 rounded-md cursor-pointer transition ${
                                isChecked
                                  ? "border-blue-600 bg-blue-50"
                                  : "hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), condition.id]
                                    : field.value?.filter(
                                        (id) =>
                                          String(id) !== String(condition.id),
                                      );
                                  field.onChange(newValue);
                                }}
                                className="mt-1"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {condition.name}
                                </p>
                                {condition.description && (
                                  <p className="text-sm text-gray-500">
                                    {condition.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        These are required for this environmentally sensitive
                        district.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Drainage Type Cards */}
              <FormField
                name="drainageTypeId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drainage Type</FormLabel>
                    <div className="grid md:grid-cols-2 gap-4">
                      {drainageTypes.map((d) => (
                        <div
                          key={d.id}
                          className={`
                  rounded-lg border p-4 cursor-pointer transition
                  ${
                    field.value === d.id
                      ? "border-blue-600 bg-blue-50"
                      : "hover:border-gray-400"
                  }
                `}
                          onClick={() => field.onChange(d.id)}
                        >
                          <p className="font-medium text-sm text-gray-800">
                            {d.name}
                          </p>
                          {d.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {d.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {steps[step] === "Timeline" && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  name="expectedStartDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              const today = new Date();
                              const minDate = new Date(today);
                              minDate.setDate(
                                minDate.getDate() +
                                  permitType.standard_duration_days,
                              );
                              return date < minDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="expectedEndDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full text-left",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) =>
                              !expectedStartDate || date < expectedStartDate
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
          )}
          {steps[step] === "Documents" && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h3 className="text-lg font-semibold">Required Documents</h3>

              {/* Merge and deduplicate permit + zoning docs */}
              {(() => {
                type MergedDocumentRequirement = {
                  id: number;
                  is_mandatory: boolean;
                  phase?: string | null;
                  notes?: string;
                  document_type: DocumentType;
                };

                const zoningDocs: MergedDocumentRequirement[] =
                  selectedZoningUse &&
                  [
                    "new_construction",
                    "renovation_alteration",
                    "change_of_use",
                    "demolition",
                  ].includes(permitType.id)
                    ? selectedZoningUse.required_documents.map((doc) => ({
                        ...doc,
                        phase: doc.phase ?? null,
                        notes: doc.notes ?? undefined,
                      }))
                    : [];

                const permitDocs: MergedDocumentRequirement[] =
                  permitType.required_documents.map((doc) => ({
                    ...doc,
                    phase: doc.phase ?? null,
                    notes: doc.notes ?? undefined,
                  }));

                const uniqueDocsMap = new Map<
                  number,
                  MergedDocumentRequirement
                >();
                for (const doc of [...permitDocs, ...zoningDocs]) {
                  const name = doc.document_type.name.toLowerCase();
                  if (name.includes("building permit application form"))
                    continue;
                  uniqueDocsMap.set(doc.document_type.id, doc);
                }

                const finalDocs = Array.from(uniqueDocsMap.values());

                if (finalDocs.length === 0) {
                  return (
                    <p className="text-muted-foreground text-sm">
                      No document uploads are required for this application
                      type.
                    </p>
                  );
                }

                return (
                  <div className="space-y-6">
                    {finalDocs.map((docReq) => (
                      <FormField
                        key={`document-${docReq.id}`}
                        name={`documentUploads.${docReq.document_type.id}`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              {docReq.document_type.name}
                              {docReq.is_mandatory && (
                                <span className="text-red-500 text-xs uppercase font-bold">
                                  Required
                                </span>
                              )}
                            </FormLabel>
                            <FormDescription>
                              {docReq.document_type.description ??
                                "Upload document"}
                            </FormDescription>

                            <FormControl>
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      // Upload the file to backend immediately
                                      await handleFileUpload(
                                        file,
                                        String(docReq.document_type.id),
                                      );
                                      toast.success("Document uploaded");
                                    } catch {
                                      toast.error("Upload failed");
                                    }
                                  }
                                }}
                                className="block w-full border border-dashed border-gray-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                              />
                            </FormControl>

                            {field.value?.file_url && (
                              <div className="mt-3 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 px-3 py-2">
                                <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-green-800">
                                    Document uploaded successfully
                                  </span>
                                  <a
                                    href={field.value.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 underline hover:text-blue-800 transition"
                                  >
                                    View Document
                                  </a>
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {steps[step] === "Finish" && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Success Icon & Message */}
              <div className="text-center space-y-2">
                <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
                <h3 className="text-lg font-semibold text-foreground">
                  You&apos;re Almost Done!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Please review your application carefully before submitting.
                  Once submitted, your information will be processed and
                  reviewed by the appropriate planning authorities.
                </p>
              </div>

              {!hasPaid && (
                <div className="rounded-md border p-4 bg-blue-50 text-sm text-blue-900 border-blue-200">
                  <h4 className="font-medium mb-1">Submission Fee</h4>
                  <p>
                    A non-refundable <strong>processing fee</strong> of{" "}
                    <span className="text-base font-semibold text-blue-700">
                      ₵{permitType.base_fee}
                    </span>{" "}
                    will be charged. This fee covers the form review and
                    administrative processing. <br />
                    <span className="font-medium text-red-500">
                      Note: This is <u>not</u> your final permit cost.
                    </span>
                  </p>
                </div>
              )}

              {/* Payment Action */}
              {!hasPaid && (
                <div className="flex justify-center">
                  <Button size="lg" className="px-8" onClick={handlePayment}>
                    Pay ₵{permitType.base_fee}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-2 pt-6">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Clear specific fields before going back
                if (steps[step] === "Technical") {
                  form.setValue("occupantCapacity", null);
                  form.setValue("setbackFront", null);
                  form.setValue("setbackRear", null);
                  form.setValue("setbackLeft", null);
                  form.setValue("setbackRight", null);
                  form.setValue("setbacks", "");
                  form.setValue("bufferZones", "");
                  form.setValue("density", "");
                  form.setValue("parkingSpaces", null);
                }
                setStep(step - 1);
              }}
            >
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={async () => {
                console.log("steps is: ", step + 1);
                const fields = Object.keys(
                  createApplicationSchema.shape,
                ).filter((_, i) => i <= step * 5) as Array<
                  keyof typeof createApplicationSchema.shape
                >;
                const valid = await form.trigger(fields);
                if (valid) setStep(step + 1);
              }}
              disabled={
                (steps[step] === "Project Information" &&
                  (!form.watch("projectName") ||
                    !form.watch("projectAddress") ||
                    !form.watch("parcelNumber") ||
                    !form.watch("mmdaId") ||
                    (showArchitectFields &&
                      (!form.watch("architect.full_name") ||
                        !form.watch("architect.email") ||
                        !form.watch("architect.phone") ||
                        !form.watch("architect.firm_name") ||
                        !form.watch("architect.license_number"))))) ||
                (steps[step] === "Project Information" &&
                  (!form.watch("longitude") || !form.watch("latitude"))) ||
                (steps[step] === "Zoning Districts" &&
                  (!form.watch("zoningDistrictId") ||
                    !form.watch("zoningDistrictSpatial"))) ||
                (steps[step] === "Zoning Uses" && !form.watch("zoningUseId")) ||
                (steps[step] === "Technical" &&
                  (!form.watch("estimatedCost") ||
                    !form.watch("parcelGeometry") ||
                    !form.watch("maxHeight") ||
                    !form.watch("maxCoverage") ||
                    !form.watch("constructionArea") ||
                    !form.watch("drainageTypeId") ||
                    !form.watch("fireSafetyPlan") ||
                    !form.watch("wasteManagementPlan") ||
                    !form.watch("previousLandUseId") ||
                    (isSensitiveDistrict && !form.watch("siteConditionIds")) ||
                    (selectedZoningDistrict?.parking_requirement &&
                      !form.watch("parkingSpaces")) ||
                    (selectedZoningDistrict?.population_served &&
                      !form.watch("occupantCapacity")) ||
                    (selectedZoningDistrict?.setbacks &&
                      (!form.watch("setbackFront") ||
                        !form.watch("setbackLeft") ||
                        !form.watch("setbackRear") ||
                        !form.watch("setbackRight"))))) ||
                (steps[step] === "Timeline" &&
                  (!form.watch("expectedStartDate") ||
                    !form.watch("expectedEndDate"))) ||
                (steps[step] === "Documents" &&
                  (() => {
                    const zoningDocs =
                      selectedZoningUse &&
                      [
                        "new_construction",
                        "renovation_alteration",
                        "change_of_use",
                        "demolition",
                      ].includes(permitType.id)
                        ? selectedZoningUse.required_documents
                        : [];

                    const permitDocs = permitType.required_documents || [];

                    const allRequiredDocs = [
                      ...permitDocs,
                      ...zoningDocs,
                    ].filter(
                      (d, i, arr) =>
                        d.document_type.name !==
                          "Building Permit Application Form" &&
                        arr.findIndex(
                          (x) => x.document_type.id === d.document_type.id,
                        ) === i,
                    );

                    const uploaded = form.watch("documentUploads") || {};

                    return allRequiredDocs.some(
                      (doc) => !uploaded[doc.document_type.id],
                    );
                  })())
              }
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!hasPaid}
              onClick={form.handleSubmit(onSubmit)}
            >
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
