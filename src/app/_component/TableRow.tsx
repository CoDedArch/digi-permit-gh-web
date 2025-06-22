export default function TableRow({
  permitNo,
  type,
  status,
  date,
  actionNeeded,
}: {
  permitNo: string;
  type: string;
  status: string;
  date: string;
  actionNeeded?: boolean;
}) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {permitNo}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "Approved"
              ? "bg-green-100 text-green-800"
              : status === "Under Review"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {date}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {actionNeeded ? (
          <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Take Action
          </button>
        ) : (
          <button className="text-gray-600 hover:text-gray-900">View</button>
        )}
      </td>
    </tr>
  );
}
