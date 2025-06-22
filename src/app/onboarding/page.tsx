"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, UploadCloud, Check, X } from "lucide-react";

function FileUpload({
  accept,
  onFileUpload,
}: {
  accept: string;
  onFileUpload: (file: File | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
  }, [onFileUpload]);

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
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
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


type PermitType =
  | "residential_single"
  | "residential_compound"
  | "commercial_retail"
  | "commercial_office"
  | "industrial_light"
  | "industrial_heavy"
  | "institutional"
  | "public_assembly"
  | "infrastructure"
  | "heritage_alteration"
  | "coastal_dev"
  | "high_rise"
  | "mining_support"
  | "market_stall"
  | "agric_structure"
  | "telecomm_tower"
  | "billboard_sign"
  | "temporary";

const DOCUMENT_MAP: Record<PermitType, string[]> = {
  // Residential
  residential_single: [
    "Completed Application Form",
    "Site Plan (approved by Survey Department)",
    "Architectural Drawings",
    "Land Title Certificate",
    "Structural Engineer's Report",
    "Indenture (if applicable)"
  ],
  residential_compound: [
    "Environmental Impact Assessment (EIA)",
    "Fire Safety Certificate",
    "Waste Management Plan",
    "All documents required for RESIDENTIAL_SINGLE"
  ],
  
  // Commercial
  commercial_retail: [
    "Business Operating License",
    "Market Operators Association Approval (for market stalls)",
    "Accessibility Compliance Certificate",
    "Sanitary Facility Plans"
  ],
  commercial_office: [
    "Parking Space Allocation Plan",
    "Elevator Safety Certificate (for buildings >2 floors)",
    "Electrical Wiring Diagram"
  ],
  
  // Industrial
  industrial_light: [
    "EPA Permit",
    "Noise Mitigation Plan",
    "Worker Safety Plan"
  ],
  industrial_heavy: [
    "Ministry of Trade Approval",
    "Hazardous Materials Handling Plan",
    "All documents required for INDUSTRIAL_LIGHT"
  ],
  
  // Institutional/Public
  institutional: [
    "Ministry of Education/Health Approval (as applicable)",
    "Disability Access Compliance Certificate",
    "Emergency Evacuation Plan"
  ],
  public_assembly: [
    "Ghana Fire Service Approval",
    "Public Health Certificate",
    "Crowd Control Plan"
  ],
  
  // Infrastructure
  infrastructure: [
    "Ministry of Roads and Highways Approval",
    "Traffic Impact Assessment",
    "Geotechnical Survey Report"
  ],
  
  // Special Cases
  heritage_alteration: [
    "Ghana Museums & Monuments Board Approval",
    "Historical Impact Assessment",
    "Conservation Method Statement"
  ],
  coastal_dev: [
    "EPA Coastal Zone Permit",
    "Erosion Control Plan",
    "Marine Impact Study"
  ],
  high_rise: [
    "Wind Load Analysis Report",
    "Seismic Stability Report",
    "Crane Operation Plan"
  ],
  mining_support: [
    "Minerals Commission Permit",
    "Mine Safety Compliance Certificate",
    "Explosives Storage Plan (if applicable)"
  ],
  
  // Local Government Categories
  market_stall: [
    "Assembly Business Permit",
    "Market Allocation Letter",
    "Simple Sketch Plan"
  ],
  agric_structure: [
    "Ministry of Food & Agriculture Approval",
    "Pest Control Plan",
    "Water Runoff Management Plan"
  ],
  telecomm_tower: [
    "NCA Frequency Authorization",
    "Radiation Safety Certificate",
    "Aviation Light Compliance"
  ],
  billboard_sign: [
    "Advertising Standards Authority Permit",
    "Structural Integrity Certificate",
    "Lighting Impact Assessment (for illuminated signs)"
  ],
  
  // Temporary Structures
  temporary: [
    "Temporary Occupation Permit",
    "Demolition Bond (if applicable)",
    "Duration of Use Declaration"
  ]
};

const userRoles = [
  "Real Estate Developer",
  "Architect",
  "Civil Engineer",
  "Construction Contractor",
  "Property Owner",
  "Urban Planner",
  "Government Official",
  "Legal Representative",
  "Other Professional"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

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
    user_role: "",
    permit_type: "",
    documents: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (name: "ghana_card_front" | "ghana_card_back", file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    
    // Simulate account setup with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding failed", err);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    setAutoAdvance(false);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const skipStep = () => {
    if (step === 4) { // Skip document upload
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
        <Progress value={(step / 5) * 100} className="h-2 rounded-none" />
        
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 0 ? "Welcome to Digi-Permit" : 
             step === 1 ? "Personal Information" :
             step === 2 ? "Identity Verification" :
             step === 3 ? "Tell Us About Yourself" :
             step === 4 ? "Permit Information" :
             "Setting Up Your Account"}
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
                  <h3 className="text-xl font-semibold">Streamlining Building Permits in Ghana</h3>
                  <p className="text-gray-600">
                    Digi-Permit is your digital gateway to fast, transparent building permit applications. 
                    Our platform simplifies the process while ensuring compliance with Ghana&apos;s building regulations.
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
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="alt_phone">Alternative Phone (Optional)</Label>
                    <Input
                      id="alt_phone"
                      name="alt_phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.alt_phone}
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
                      Upload clear photos of both sides of your Ghana Card for identity verification
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Front Side</Label>
                      <FileUpload
                        accept="image/*"
                        onFileUpload={(file) => handleFileUpload("ghana_card_front", file)}
                      />
                      {formData.ghana_card_front && (
                        <p className="text-sm text-green-600">✓ Uploaded</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Back Side</Label>
                      <FileUpload
                        accept="image/*"
                        onFileUpload={(file) => handleFileUpload("ghana_card_back", file)}
                      />
                      {formData.ghana_card_back && (
                        <p className="text-sm text-green-600">✓ Uploaded</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h5 className="font-medium text-sm mb-2">Why we need this:</h5>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>To verify your identity as required by Ghana&apos;s Building Regulations</li>
                      <li>To prevent fraudulent applications</li>
                      <li>Your data is securely stored and encrypted</li>
                    </ul>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Which best describes you?</Label>
                    <Select
                      onValueChange={(value) => setFormData(prev => ({ ...prev, user_role: value }))}
                      value={formData.user_role}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h5 className="font-medium text-sm mb-2">How this helps:</h5>
                    <p className="text-sm text-gray-600">
                      Knowing your role helps us tailor the application process to your needs 
                      and provide relevant guidance based on your expertise level.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>What type of permit are you interested in?</Label>
                    <Select
                      onValueChange={(value) => setFormData(prev => ({ ...prev, permit_type: value }))}
                      value={formData.permit_type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select permit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential_single">Residential - Single Family</SelectItem>
                        <SelectItem value="residential_compound">Residential - Compound</SelectItem>
                        <SelectItem value="commercial_retail">Commercial - Retail</SelectItem>
                        <SelectItem value="commercial_office">Commercial - Office</SelectItem>
                        <SelectItem value="industrial_light">Industrial - Light</SelectItem>
                        <SelectItem value="industrial_heavy">Industrial - Heavy</SelectItem>
                        <SelectItem value="institutional">Institutional</SelectItem>
                        <SelectItem value="public_assembly">Public Assembly</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="heritage_alteration">Heritage Alteration</SelectItem>
                        <SelectItem value="coastal_dev">Coastal Development</SelectItem>
                        <SelectItem value="high_rise">High Rise Building</SelectItem>
                          {DOCUMENT_MAP[formData.permit_type as PermitType]?.map((doc: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2">•</span>
                              <span className="text-sm">{doc}</span>
                            </li>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.permit_type && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h5 className="font-medium mb-2">Documents you&apos;ll need:</h5>
                        <ul className="space-y-2">
                          {DOCUMENT_MAP[formData.permit_type as PermitType]?.map((doc: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block mr-2">•</span>
                              <span className="text-sm">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
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
                    {progress < 100 ? "Setting up your account" : "Account ready!"}
                  </h3>
                  
                  <p className="text-gray-600">
                    {progress < 100 ? (
                      "We're configuring your dashboard and preparing your application workspace..."
                    ) : (
                      "Your Digi-Permit account is ready to use!"
                    )}
                  </p>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <p className="text-sm text-gray-500">
                    {progress < 100 ? "This will just take a moment..." : "Redirecting you to your dashboard..."}
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
                    (step === 1 && (!formData.email || !formData.first_name || !formData.last_name || !formData.phone)) ||
                    (step === 2 && (!formData.ghana_card_front || !formData.ghana_card_back)) ||
                    (step === 3 && !formData.user_role)
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