"use client";

import { PermitTypeWithRequirements } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileCheck2, ChevronDown, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type CardVariant = "quick" | "comprehensive";

export default function PermitTypeCard({
  permitType,
  variant = "quick",
}: {
  permitType: PermitTypeWithRequirements;
  variant?: CardVariant;
}) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const handleStartApplication = () => {
    router.push(`/new-application/${permitType.id}`);
  };

  const variantStyles = {
    quick: {
      border: "border-green-100",
      headerBg: "bg-green-50",
      headerText: "text-green-800",
      durationColor: "text-green-600",
    },
    comprehensive: {
      border: "border-blue-100",
      headerBg: "bg-blue-50",
      headerText: "text-blue-800",
      durationColor: "text-blue-600",
    },
  };

  // Safely handle base_fee display
  const displayFee = permitType.base_fee !== null 
    ? `₵${Number(permitType.base_fee).toFixed(2)}` 
    : "Fee varies";

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white h-fit",
      variantStyles[variant].border
    )}>
      {/* Card Header */}
      <div className={cn(
        "px-6 py-4 border-b",
        variantStyles[variant].headerBg,
        variantStyles[variant].border
      )}>
        <div className="flex justify-between items-start gap-2">
          <h3 className={cn(
            "text-lg font-semibold",
            variantStyles[variant].headerText
          )}>
            {permitType.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {permitType.requires_epa_approval && (
              <Badge variant="destructive" className="text-xs">EPA</Badge>
            )}
            {permitType.requires_heritage_review && (
              <Badge variant="secondary" className="text-xs">Heritage</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4 flex flex-col justify-between h-full">
        {permitType.description && (
          <p className="text-sm text-gray-600">{permitType.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className={variantStyles[variant].durationColor}>
              {permitType.standard_duration_days} days
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* <DollarSign className="h-4 w-4 text-gray-500" /> */}
            <span className="text-gray-700">
              {displayFee}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
            variant="outline"
            className="flex items-center gap-1"
          >
            {showDetails ? "Hide Details" : "View Requirements"}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              showDetails ? "rotate-180" : ""
            )} />
          </Button>
          <Button 
            size="sm" 
            onClick={handleStartApplication}
            className={cn(
              variant === "quick" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            Start Application
          </Button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              key="requirements"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Required Documents:
                </h4>
                <ul className="space-y-3">
                  {permitType.required_documents.map((req) => (
                    <li
                      key={req.document_type.id}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      {req.is_mandatory ? (
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FileCheck2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="leading-tight">
                        <span className={req.is_mandatory ? "font-medium" : ""}>
                          {req.document_type.name}
                        </span>
                        {!req.is_mandatory && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            (optional)
                          </span>
                        )}
                        {req.phase && (
                          <span className="ml-2 inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {req.phase}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}