export default function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: "up" | "down" }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`mt-2 text-sm flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? "↑ 12%" : "↓ 5%"} from last week
        </div>
      )}
    </div>
  );
}