export default function ReviewRow({ permitNo, type, applicant, daysInQueue, priority }: { permitNo: string, type: string, applicant: string, daysInQueue: number, priority: "high" | "medium" | "low" }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permitNo}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          daysInQueue > 3 ? "bg-red-100 text-red-800" :
          daysInQueue > 1 ? "bg-yellow-100 text-yellow-800" :
          "bg-green-100 text-green-800"
        }`}>
          {daysInQueue} days
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button className={`px-3 py-1 rounded text-xs font-medium ${
          priority === "high" ? "bg-red-600 text-white" :
          priority === "medium" ? "bg-yellow-600 text-white" :
          "bg-green-600 text-white"
        }`}>
          Review Now
        </button>
      </td>
    </tr>
  );
}