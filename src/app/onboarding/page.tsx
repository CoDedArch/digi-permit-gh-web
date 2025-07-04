"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getApplicantTypes,
  getPermitTypes,
  uploadFile,
} from "../data/queries";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  UploadCloud,
  Check,
  X,
  RefreshCw,
  CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Cookies from "js-cookie";

const today = new Date();
const maxBirthDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate(),
);

function FileUpload({
  accept,
  onFileUpload,
}: {
  accept: string;
  onFileUpload: (file: File | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setIsUploading(true);

        // Simulate upload process
        setTimeout(() => {
          onFileUpload(selectedFile);
          setIsUploading(false);
        }, 1000);
      }
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    onFileUpload(null); // Clear the file
  };

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      ) : file ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium">{file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop a file here, or click to select"}
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Select File
          </Button>
        </div>
      )}
    </div>
  );
}

type PermitType = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  base_fee: number;
  standard_duration_days: number;
};

type ApplicantType = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cardstep, setCardStep] = useState<"front" | "back">("front");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [applicantTypes, setApplicantTypes] = useState<ApplicantType[]>([]);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);

  // get the method and the contact passad
  const method = searchParams.get("method"); // "email" or "phone"
  const contact = searchParams.get("contact");

  //check if user needs to fill some extra inputs

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    other_name: "",
    phone: "",
    alt_phone: "",
    ghana_card_front: null as File | null,
    ghana_card_back: null as File | null,
    applicant_type: "",
    permit_type: "",
    documents: [] as string[],
    date_of_birth: "",
    gender: "",
    address: "",
    firm_name: "",
    license_number: "",
  });

  const needsProfessionalInfo = !["individual", "property_owner", ""].includes(
    formData.applicant_type,
  );

  const isProfessional = needsProfessionalInfo;
  const canContinue =
    !isProfessional || (formData.firm_name && formData.license_number);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle selection of the Applicant Type
  const handleSelect = (code: string) => {
    setFormData((prev) => ({ ...prev, applicant_type: code }));
  };

  const handleFileUpload = (
    side: "ghana_card_front" | "ghana_card_back",
    file: File | null,
  ) => {
    if (!file) return;

    // Check if the same file name is being used
    const otherSide =
      side === "ghana_card_front" ? "ghana_card_back" : "ghana_card_front";
    const otherFile = formData[otherSide];

    if (otherFile && otherFile.name === file.name) {
      toast.error("Front and back uploads must be different files.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [side]: file,
    }));

    // Automatically go to back step after front is uploaded
    if (side === "ghana_card_front" && file) {
      setCardStep("back");
    }
  };

  const resetFile = (side: "ghana_card_front" | "ghana_card_back") => {
    setFormData((prev) => ({
      ...prev,
      [side]: null,
    }));
    setCardStep(side === "ghana_card_back" ? "back" : "front");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // const token = Cookies.get("auth_token"); // or from context/cookie
      // if (!token) {
      //   toast.error("Authentication token missing");
      //   throw new Error("Authentication token missing");
      // }

      if (!formData.ghana_card_front || !formData.ghana_card_back) {
        toast.error("Please upload both sides of your Ghana Card.");
        return;
      }
      // 1. Upload Ghana card files first (if needed)
      const frontFileUrl = await uploadFile(formData.ghana_card_front);
      const backFileUrl = await uploadFile(formData.ghana_card_back);

      // 2. Send onboarding data
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        other_name: formData.other_name,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        alt_phone: formData.alt_phone,
        applicant_type_code: formData.applicant_type,
        firm_name: formData.firm_name || null,
        license_number: formData.license_number || null,
        documents: {
          front: frontFileUrl,
          back: backFileUrl,
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}onboarding/user/onboarding/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to complete onboarding");
      }

      // On success
      toast.success("🎉 Onboarding complete!");
      router.push("/");
    } catch (err) {
      console.error("Onboarding failed", err);
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
    setAutoAdvance(false);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const skipStep = () => {
    if (step === 4) {
      setFormData((prev) => ({ ...prev, applicant_type: "individual" }));
      // Skip document upload
      setStep(5); // Go to account setup
    } else {
      nextStep();
    }
  };

  // Auto-advance from welcome screen
  useEffect(() => {
    if (step === 0 && autoAdvance) {
      const timer = setTimeout(() => {
        nextStep();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, autoAdvance]);

  useEffect(() => {
    if (method === "email") {
      setFormData((prev) => ({ ...prev, email: contact || "" }));
    } else if (method === "phone") {
      setFormData((prev) => ({ ...prev, phone: contact || "" }));
    }
  }, [method, contact]);

  // We'll fetch the Applicant Types
  useEffect(() => {
    getApplicantTypes().then((types) => setApplicantTypes(types));
  }, []);

  useEffect(() => {
    getPermitTypes().then((types) => setPermitTypes(types));
  }, []);

  useEffect(() => {
    if (step === 4) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
        <Progress value={(step / 5) * 100} className="h-2 rounded-none" />

        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 0
              ? "Welcome to Digi-Permit"
              : step === 1
              ? "Personal Information"
              : step === 2
              ? "Identity Verification"
              : step === 3
              ? "Tell Us About Yourself"
              : step === 4
              ? "Permit Information"
              : "Setting Up Your Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 0 ? "Step 1 of 6" : `Step ${step + 1} of 6`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: step > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: step > 0 ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 0 && (
                <div className="space-y-4 text-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <BuildingIcon className="w-12 h-12 text-blue-600" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold">
                    Streamlining Building Permits in Ghana
                  </h3>
                  <p className="text-gray-600">
                    Digi-Permit is your digital gateway to fast, transparent
                    building permit applications. Our platform simplifies the
                    process while ensuring compliance with Ghana&apos;s building
                    regulations.
                  </p>
                  <div className="pt-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5 }}
                      className="h-1 bg-blue-200 rounded-full"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identity Information */}
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_name">Other Names (Optional)</Label>
                    <Input
                      id="other_name"
                      name="other_name"
                      placeholder="Middle name, etc."
                      value={formData.other_name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={method === "email"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 flex items-center pl-3 h-full">
                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-l-lg">
                          <img
                            src="https://flagcdn.com/w20/gh.png"
                            alt="Ghana flag"
                            className="w-5 h-3.5 rounded-sm"
                          />
                          <span className="text-gray-700 text-sm">+233</span>
                        </div>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-24 pr-4 py-2 border text-gray-900 placeholder:text-slate-300"
                        placeholder="24 123 4567"
                        disabled={method === "phone"}
                        pattern="[0-9]{9,10}"
                        title="Enter 9-10 digit Ghanaian phone number"
                        style={{ minWidth: 0 }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alt_phone">
                      Alternative Phone (Optional)
                    </Label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 flex items-center pl-3 h-full">
                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-l-lg">
                          <img
                            src="https://flagcdn.com/w20/gh.png"
                            alt="Ghana flag"
                            className="w-5 h-3.5 rounded-sm"
                          />
                          <span className="text-gray-700 text-sm">+233</span>
                        </div>
                      </div>
                      <Input
                        id="alt_phone"
                        name="alt_phone"
                        type="tel"
                        value={formData.alt_phone}
                        onChange={handleChange}
                        className="w-full pl-24 pr-4 py-2 border placeholder:text-slate-300"
                        placeholder="24 123 4567"
                        disabled={loading}
                        pattern="[0-9]{9,10}"
                        title="Enter 9-10 digit Ghanaian phone number"
                        style={{ minWidth: 0 }}
                      />
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date_of_birth && "text-muted-foreground",
                          )}
                        >
                          {formData.date_of_birth
                            ? format(new Date(formData.date_of_birth), "PPP")
                            : "Select a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            formData.date_of_birth
                              ? new Date(formData.date_of_birth)
                              : undefined
                          }
                          onSelect={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              date_of_birth:
                                date?.toISOString().split("T")[0] || "",
                            }))
                          }
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={maxBirthDate.getFullYear()}
                          disabled={(date) => date > maxBirthDate}
                          defaultMonth={maxBirthDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Residential Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Street, Town, Region"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="font-medium">Ghana Card Verification</h4>
                    <p className="text-sm text-gray-500">
                      Upload clear photos of both sides of your Ghana Card for
                      identity verification
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Front Upload */}
                    {(cardstep === "front" || formData.ghana_card_front) && (
                      <div className="space-y-2">
                        <Label>Ghana Card - Front</Label>
                        {formData.ghana_card_front ? (
                          <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm bg-green-50">
                            <span className="truncate text-green-700 font-medium">
                              ✓ {formData.ghana_card_front.name}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resetFile("ghana_card_front")}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Re-upload
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <FileUpload
                            accept="image/*"
                            onFileUpload={(file) =>
                              handleFileUpload("ghana_card_front", file)
                            }
                          />
                        )}
                      </div>
                    )}

                    {/* Back Upload */}
                    {formData.ghana_card_front &&
                      (cardstep === "back" || formData.ghana_card_back) && (
                        <div className="space-y-2">
                          <Label>Ghana Card - Back</Label>
                          {formData.ghana_card_back ? (
                            <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm bg-green-50">
                              <span className="truncate text-green-700 font-medium">
                                ✓ {formData.ghana_card_back.name}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resetFile("ghana_card_back")}
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Re-upload
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <FileUpload
                              accept="image/*"
                              onFileUpload={(file) =>
                                handleFileUpload("ghana_card_back", file)
                              }
                            />
                          )}
                        </div>
                      )}

                    <AnimatePresence>
                      {formData.ghana_card_front &&
                        formData.ghana_card_back && (
                          <motion.p
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-green-900"
                          >
                            ✅ Ghana Card upload complete.
                          </motion.p>
                        )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h5 className="font-medium text-sm mb-2">
                      Why we need this:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>
                        To verify your identity as required by Ghana&apos;s
                        Building Regulations
                      </li>
                      <li>To prevent fraudulent applications</li>
                      <li>Your data is securely stored and encrypted</li>
                    </ul>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Which best describes you?
                    </h2>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        Tip
                      </span>
                      <p>
                        Not sure what to choose? You can{" "}
                        <span className="font-medium text-blue-600">skip</span>{" "}
                        — we&apos;ll go with{" "}
                        <span className="font-semibold text-gray-800">
                          Individual
                        </span>{" "}
                        for now.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {applicantTypes.map((type) => {
                      const isSelected = formData.applicant_type === type.code;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleSelect(type.code)}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-left transition hover:border-blue-500",
                            isSelected
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-sm text-gray-800">
                                {type.name}
                              </h3>
                              {type.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {type.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {needsProfessionalInfo && (
                      <motion.div
                        key="professional-info"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pt-6"
                      >
                        <h4 className="text-md font-semibold text-blue-900">
                          We need this extra bit of information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firm_name">Firm Name</Label>
                            <Input
                              id="firm_name"
                              name="firm_name"
                              placeholder="Your firm or company"
                              value={formData.firm_name || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  firm_name: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="license_number">
                              License Number
                            </Label>
                            <Input
                              id="license_number"
                              name="license_number"
                              placeholder="Professional license number"
                              value={formData.license_number || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  license_number: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h5 className="font-medium text-sm mb-2">
                      How this helps:
                    </h5>
                    <p className="text-sm text-gray-600">
                      Knowing your role helps us tailor the application process
                      to your needs and provide relevant guidance based on your
                      expertise level.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  {/* Animated intro */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-1"
                  >
                    <h2 className="text-xl font-semibold text-gray-900">
                      Discover What Permits You Can Apply For
                    </h2>
                    <p className="text-sm text-gray-600">
                      Here are the types of permits available — we’ll guide you
                      through the right one based on your needs.
                    </p>
                  </motion.div>

                  {/* Animated permit type cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {permitTypes.map((type, index) => (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.07 }}
                        className="rounded-xl border border-gray-200 hover:shadow-md transition bg-white p-4 space-y-2"
                      >
                        <h3 className="font-medium text-base text-gray-800">
                          {type.name}
                        </h3>
                        {type.description && (
                          <p className="text-sm text-gray-600">
                            {type.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs pt-2 text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Avg. Duration: {type.standard_duration_days} days
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Fee: GHS {Number(type.base_fee).toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Closing note */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="pt-6 text-sm text-center text-gray-600"
                  >
                    We’ll help you choose the right permit later based on your
                    project.
                  </motion.div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    {progress < 100 ? (
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    ) : (
                      <CheckIcon className="w-12 h-12 text-green-600" />
                    )}
                  </div>

                  <h3 className="text-xl font-semibold">
                    {progress < 100
                      ? "Setting up your account"
                      : "Account ready!"}
                  </h3>

                  <p className="text-gray-600">
                    {progress < 100
                      ? "We're configuring your dashboard and preparing your application workspace..."
                      : "Your Digi-Permit account is ready to use!"}
                  </p>

                  <Progress value={progress} className="h-2" />

                  <p className="text-sm text-gray-500">
                    {progress < 100
                      ? "This will just take a moment..."
                      : "Redirecting you to your dashboard..."}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          {step < 5 && (
            <div className="mt-8 flex justify-between">
              {step > 0 ? (
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div /> // Empty div to maintain space
              )}

              <div className="flex gap-2">
                {(step === 4 || step === 3) && (
                  <Button variant="outline" onClick={skipStep}>
                    Skip
                  </Button>
                )}

                <Button
                  onClick={step === 4 ? handleSubmit : nextStep}
                  disabled={
                    (step === 1 &&
                      (!formData.email ||
                        !formData.first_name ||
                        !formData.last_name ||
                        !formData.phone ||
                        !formData.address ||
                        !formData.date_of_birth ||
                        !formData.gender)) ||
                    (step === 2 &&
                      (!formData.ghana_card_front ||
                        !formData.ghana_card_back)) ||
                    (step === 3 && (!formData.applicant_type || !canContinue))
                  }
                >
                  {step === 4 ? "Complete Setup" : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
