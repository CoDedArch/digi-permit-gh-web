// pages/inspections/request.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Application, getMyApplications } from "@/app/data/queries";
import { Calendar } from "@/components/ui/calendar"; // already imported
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

// Add at the top
const inspectionTypes = [
  "site",
  "foundation",
  "framing",
  "electrical",
  "plumbing",
  "final",
  "special",
];

export default function RequestInspectionPage() {
  const router = useRouter();

  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [inspectionDate, setInspectionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [inspectionType, setInspectionType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !inspectionDate || !inspectionType) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}inspections/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            application_id: applicationId,
            requested_date: inspectionDate,
            inspection_type: inspectionType,
            notes,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to submit request");
      toast.success("Inspection request submitted.");
      router.push("/schedule-inspection");
    } catch {
      toast.error("Could not submit inspection request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const apps = await getMyApplications();
        setApplications(apps);
      } catch (err) {
        toast.error("Could not load your applications");
      } finally {
        setLoadingApps(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="container min-h-screen flex flex-col justify-center items-center mx-auto px-4 py-10 bg-white ">
      <div className="">
        <Link href="/schedule-inspection">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inspections
          </Button>
        </Link>

        <h1 className="text-2xl font-semibold mb-4">
          Request a New Inspection
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="projectName">Select Your Project</Label>
            <Select
              value={applicationId?.toString() ?? ""}
              onValueChange={(val) => setApplicationId(Number(val))}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{app.project_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {app.application_number} • {app.mmda?.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="inspectionType">Inspection Type</Label>
            <Select
              value={inspectionType}
              onValueChange={(val) => setInspectionType(val)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose an inspection type" />
              </SelectTrigger>
              <SelectContent>
                {inspectionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Preferred Inspection Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full text-left font-normal",
                    !inspectionDate && "text-muted-foreground",
                  )}
                >
                  {inspectionDate
                    ? format(new Date(inspectionDate), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    inspectionDate ? new Date(inspectionDate) : undefined
                  }
                  onSelect={(date) =>
                    setInspectionDate(
                      date ? date.toISOString().split("T")[0] : "",
                    )
                  }
                  initialFocus
                  disabled={(date) => {
                    const today = new Date();
                    const minDate = new Date(today);
                    // example: 2-day wait (customize if needed)
                    minDate.setDate(minDate.getDate() + 2);
                    return date < minDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={
              loading || !applicationId || !inspectionDate || !inspectionType
            }
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" /> Submitting...
              </span>
            ) : (
              "Submit Inspection Request"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
