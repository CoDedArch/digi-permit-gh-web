import Link from "next/link";

interface ReviewRowProps {
  permitNo: string;
  type: string;
  applicant: string;
  daysInQueue: number;
  priority: "high" | "medium" | "low";
  permitId: number; // Added permitId for navigation
}

export default function ReviewRow({
  permitNo,
  type,
  applicant,
  daysInQueue,
  priority,
  permitId,
}: ReviewRowProps) {
  // Priority color mappings
  const priorityBadgeColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  const priorityButtonColors = {
    high: "bg-red-600 hover:bg-red-700 text-white",
    medium: "bg-yellow-600 hover:bg-yellow-700 text-white",
    low: "bg-green-600 hover:bg-green-700 text-white",
  };

  // Tooltip text based on priority
  const priorityTooltips = {
    high: "High priority - Urgent attention needed",
    medium: "Medium priority - Review soon",
    low: "Low priority - Standard review",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {permitNo}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {applicant}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${priorityBadgeColors[priority]}`}
          title={`${daysInQueue} days in queue`}
        >
          {daysInQueue} day{daysInQueue !== 1 ? "s" : ""}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Link
          href={`/review/permit/${permitId}`}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${priorityButtonColors[priority]}`}
          title={priorityTooltips[priority]}
        >
          Review
        </Link>
      </td>
    </tr>
  );
}