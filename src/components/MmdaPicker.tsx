import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import { MMDA } from "@/app/data/queries";
import { useWatch } from "react-hook-form";

export default function MMDAPicker({
  mmdas,
  form,
}: {
  mmdas: MMDA[];
  form: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedMMDAId = useWatch({ control: form.control, name: "mmdaId" });
  // 🔍 Filtered & grouped MMDAs by region
  const groupedMMDAs = useMemo(() => {
    const filtered = mmdas.filter((mmda) =>
      mmda.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const groups: Record<string, MMDA[]> = {};
    for (const mmda of filtered) {
      if (!groups[mmda.region]) {
        groups[mmda.region] = [];
      }
      groups[mmda.region].push(mmda);
    }
    return groups;
  }, [mmdas, searchTerm]);

  // Extract watched values to variables for useEffect dependencies
  const watchedLatitude = form.watch("latitude");
  const watchedLongitude = form.watch("longitude");
  console.log(
    "Selected MMDA ID:",
    selectedMMDAId,
    "Type:",
    typeof selectedMMDAId,
  );
  console.log(
    "Available MMDAs:",
    mmdas.map((m) => ({ id: m.id, name: m.name })),
  );

  useEffect(() => {
    if (!form) return;
    const lat = form.getValues("latitude");
    const lng = form.getValues("longitude");
    const currentMMDA = form.getValues("mmdaId");
    console.log("📍 Coordinates received:", { lat, lng });
    console.log("📍 Current MMDA ID in form:", currentMMDA);

    if (!lat || !lng) {
      console.warn(
        "⚠️ Latitude or longitude is missing. Skipping MMDA auto-selection.",
      );
      return;
    }

    // if (currentMMDA) {
    //   console.info("ℹ️ MMDA already selected, skipping auto-selection.");
    //   return;
    // }

    const userPoint = point([lng, lat]);
    console.log("📌 Constructed GeoJSON point:", userPoint);

    let matched = false;

    for (const mmda of mmdas) {
      if (mmda.jurisdiction_boundaries) {
        try {
          const contains = booleanPointInPolygon(
            userPoint,
            mmda.jurisdiction_boundaries,
          );
          console.log(`🔍 Checking ${mmda.name}:`, contains);

          if (contains) {
            console.log(`✅ Match found: ${mmda.name} (${mmda.id})`);
            // Try this instead to ensure type consistency:
            form.setValue("mmdaId", mmda.id.toString(), {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
            matched = true;
            break;
          }
        } catch (error) {
          console.error(
            `❌ Error checking polygon for MMDA ${mmda.name}:`,
            error,
          );
        }
      } else {
        console.warn(`⚠️ No boundaries for MMDA: ${mmda.name}`);
      }
    }

    if (!matched) {
      console.warn("❌ No matching MMDA found for the given coordinates.");
    }
  }, [
    form,
    mmdas,
    watchedLatitude, // use extracted variables
    watchedLongitude,
  ]);

  // Add this to verify the form value is actually being set
  useEffect(() => {
    console.log("Current mmdaId in form:", form.getValues("mmdaId"));
  }, [form.getValues("mmdaId"), form]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-md bg-blue-50 border-l-4 border-blue-500 p-5 text-base text-blue-900">
        <AlertTriangle className="mt-1 h-12 w-12 text-blue-500" />
        <div className="space-y-2">
          <p className="font-semibold text-lg">Why is this important?</p>
          <p className="leading-relaxed">
            The <strong>Metropolitan/Municipal/District Assembly (MMDA)</strong>{" "}
            you select will be responsible for <strong>receiving</strong>,{" "}
            <strong>reviewing</strong>, and <strong>processing</strong> your
            building permit application. Please select the MMDA that governs the
            location where your project will take place.
          </p>
        </div>
      </div>

      <FormItem>
        <FormLabel>Select MMDA</FormLabel>
        <FormControl>
          <Select
            key={selectedMMDAId}
            value={selectedMMDAId?.toString()}
            onValueChange={(value) => form.setValue("mmdaId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your MMDA" />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-y-auto">
              {/* 🔍 Search Field */}
              <div className="px-3 py-2">
                <Input
                  placeholder="Search MMDA..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 📊 Total Count */}
              <div className="px-3 py-1 text-xs text-muted-foreground italic">
                Showing {Object.values(groupedMMDAs).flat().length} of{" "}
                {mmdas.length} MMDAs
              </div>

              {/* 🌍 Group by region */}
              {Object.entries(groupedMMDAs).map(([region, group]) => (
                <SelectGroup key={region}>
                  <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {region}
                  </div>
                  {group.map((mmda) => (
                    <SelectItem key={mmda.id} value={String(mmda.id)}>
                      {mmda.name} ({mmda.type})
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    </div>
  );
}
