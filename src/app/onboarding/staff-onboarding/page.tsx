"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

// Types for MMDA, Department, and Committee
type MMDABase = {
  id: number;
  name: string;
  region: string;
};

type DepartmentBase = {
  id: number;
  name: string;
  code: string;
};

type CommitteeBase = {
  id: number;
  name: string;
};

enum UserRole {
  REVIEW_OFFICER = "review_officer",
  INSPECTION_OFFICER = "inspection_officer",
  ADMIN = "admin",
}

export default function StaffOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Data fetching states
  const [mmdas, setMmdas] = useState<MMDABase[]>([]);
  const [filteredMmdas, setFilteredMmdas] = useState<MMDABase[]>([]);
  const [departments, setDepartments] = useState<DepartmentBase[]>([]);
  const [committees, setCommittees] = useState<CommitteeBase[]>([]);
  const [loadingData, setLoadingData] = useState({
    mmdas: false,
    departments: false,
    committees: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    mmda_id: "",
    department_id: "",
    committee_id: "",
    role: "",
    specialization: "",
    work_email: "",
    staff_number: "",
    designation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch MMDAs on component mount
  useEffect(() => {
    const fetchMmdas = async () => {
      setLoadingData((prev) => ({ ...prev, mmdas: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}mmdas/`,
        );
        const data = await response.json();
        setMmdas(data);
        setFilteredMmdas(data);
      } catch (error) {
        toast.error("Failed to load MMDAs");
      } finally {
        setLoadingData((prev) => ({ ...prev, mmdas: false }));
      }
    };
    fetchMmdas();
  }, []);

  // Fetch departments when MMDA is selected
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.mmda_id) return;
      setLoadingData((prev) => ({ ...prev, departments: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}mmdas/${formData.mmda_id}/departments`,
        );
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        toast.error("Failed to load departments");
      } finally {
        setLoadingData((prev) => ({ ...prev, departments: false }));
      }
    };
    fetchDepartments();
  }, [formData.mmda_id]);

  // Fetch committees when MMDA is selected
  useEffect(() => {
    const fetchCommittees = async () => {
      if (!formData.mmda_id) return;
      setLoadingData((prev) => ({ ...prev, committees: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}mmdas/${formData.mmda_id}/committees`,
        );
        const data = await response.json();
        setCommittees(data);
      } catch (error) {
        toast.error("Failed to load committees");
      } finally {
        setLoadingData((prev) => ({ ...prev, committees: false }));
      }
    };
    fetchCommittees();
  }, [formData.mmda_id]);

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
      const payload = {
        mmda_id: formData.mmda_id,
        department_id: formData.department_id,
        committee_id: formData.committee_id,
        role: formData.role,
        specialization: formData.specialization,
        work_email: formData.work_email?.trim() || null,
        staff_number: formData.staff_number,
        designation: formData.designation,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}onboarding/user/staff/onboarding`,
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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const canContinue = () => {
    switch (step) {
      case 0:
        return !!formData.mmda_id;
      case 1:
        return !!formData.department_id;
      case 2:
        return !!formData.committee_id;
      case 3:
        return !!formData.role;
      case 4:
        return (
          !!formData.specialization &&
          !!formData.staff_number
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
        <Progress value={(step / 5) * 100} className="h-2 rounded-none" />

        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 0
              ? "Welcome to Staff Portal"
              : step === 1
              ? "Select Department"
              : step === 2
              ? "Select Committee"
              : step === 3
              ? "Your Role"
              : step === 4
              ? "Personal Information"
              : "Account Setup"}
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
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      MMDA Staff Onboarding
                    </h3>
                    <p className="text-gray-600">
                      Please select the MMDA you are affiliated with to begin
                      the onboarding process.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search MMDAs by name or region..."
                        className="pl-10"
                        onChange={(e) => {
                          const searchTerm = e.target.value.toLowerCase();
                          setFilteredMmdas(
                            mmdas.filter(
                              (mmda) =>
                                mmda.name.toLowerCase().includes(searchTerm) ||
                                mmda.region.toLowerCase().includes(searchTerm),
                            ),
                          );
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Select MMDA</Label>
                      <Select
                        value={formData.mmda_id}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, mmda_id: value }))
                        }
                        disabled={loadingData.mmdas}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your MMDA" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {filteredMmdas.length > 0 ? (
                            filteredMmdas.map((mmda) => (
                              <SelectItem
                                key={mmda.id}
                                value={mmda.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {mmda.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({mmda.region})
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="py-2 text-center text-sm text-gray-500">
                              No MMDAs found matching your search
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {loadingData.mmdas && (
                        <p className="text-sm text-gray-500">
                          Loading MMDAs...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h5 className="font-medium text-sm mb-2">Note:</h5>
                    <p className="text-sm text-gray-600">
                      If your MMDA is not listed, please contact your
                      administrator.
                    </p>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      Department Information
                    </h3>
                    <p className="text-gray-600">
                      Please select the department you belong to within{" "}
                      {
                        mmdas.find((m) => m.id.toString() === formData.mmda_id)
                          ?.name
                      }
                      .
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Department</Label>
                    <Select
                      value={formData.department_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          department_id: value,
                        }))
                      }
                      disabled={loadingData.departments || !formData.mmda_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loadingData.departments && (
                      <p className="text-sm text-gray-500">
                        Loading departments...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      Committee Membership
                    </h3>
                    <p className="text-gray-600">
                      Please select any committees you belong to (optional).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Committee (Optional)</Label>
                    <Select
                      value={formData.committee_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          committee_id: value === "none" ? "" : value,
                        }))
                      }
                      disabled={loadingData.committees || !formData.mmda_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a committee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {committees.map((committee) => (
                          <SelectItem
                            key={committee.id}
                            value={committee.id.toString()}
                          >
                            {committee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loadingData.committees && (
                      <p className="text-sm text-gray-500">
                        Loading committees...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Your Role</h3>
                    <p className="text-gray-600">
                      Please select your primary role within the MMDA.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.REVIEW_OFFICER}>
                          Review Officer
                        </SelectItem>
                        <SelectItem value={UserRole.INSPECTION_OFFICER}>
                          Inspection Officer
                        </SelectItem>
                        <SelectItem value={UserRole.ADMIN}>
                          Administrator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === UserRole.REVIEW_OFFICER && (
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        placeholder="e.g., Structural Engineering, Architecture"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_email">Work Email (Optional)</Label>
                    <Input
                      id="work_email"
                      name="work_email"
                      type="email"
                      placeholder="your@mmda.gov.gh"
                      value={formData.work_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff_number">Staff Number</Label>
                    <Input
                      id="staff_number"
                      name="staff_number"
                      placeholder="MMDA-12345"
                      value={formData.staff_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      name="designation"
                      placeholder="e.g., Senior Officer"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </div>
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
                      ? "We're configuring your staff dashboard and permissions..."
                      : "Your staff account is ready to use!"}
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

              <Button
                onClick={step === 4 ? handleSubmit : nextStep}
                disabled={!canContinue()}
              >
                {step === 4 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
