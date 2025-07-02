"use client";

import { PermitTypeWithRequirements } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileCheck2 } from "lucide-react";

export default function PermitTypeCard({
  permitType,
}: {
  permitType: PermitTypeWithRequirements;
}) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const handleStartApplication = () => {
    router.push(`/new-application/${permitType.id}`);
  };

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white h-fit`}>
      <div className={`p-6 space-y-4 flex flex-col justify-between h-full`}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">
            {permitType.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {permitType.requires_epa_approval && (
              <Badge variant="destructive">EPA Review</Badge>
            )}
            {permitType.requires_heritage_review && (
              <Badge variant="secondary">Heritage Review</Badge>
            )}
          </div>
        </div>

        {permitType.description && (
          <p className="text-sm text-gray-600">{permitType.description}</p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
            variant="secondary"
          >
            {showDetails ? "Hide Details" : "View Requirements"}
          </Button>
          <Button size="sm" onClick={handleStartApplication}>
            Start Application
          </Button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              key="requirements"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-4"
            >
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Required Documents:
              </h4>
              <ul className="space-y-3">
                {permitType.required_documents.map((req) => (
                  <li
                    key={req.document_type.id}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    {req.is_mandatory ? (
                      <FileText className="h-4 w-4 text-blue-600 mt-1" />
                    ) : (
                      <FileCheck2 className="h-4 w-4 text-gray-400 mt-1" />
                    )}
                    <div>
                      {req.document_type.name}
                      {!req.is_mandatory && (
                        <span className="text-muted-foreground ml-1">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
