import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ComplianceIndicatorProps {
  meets: boolean;
  label?: string; // Make optional if needed
  tooltip?: string; // Make optional if needed
}

export function ComplianceIndicator({
  meets,
  label,
  tooltip,
}: ComplianceIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            meets ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {label || (meets ? "Compliant" : "Non-compliant")}
        </span>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          <p className="max-w-[200px]">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
