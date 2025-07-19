export default function StatCard({
  title,
  value,
  subValue,
  icon,
  trend,
  loading = false,
  customContent,
}: {
  title: string;
  value?: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  loading?: boolean;
  customContent?: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          {loading ? (
            <div className="animate-pulse h-8 w-20 bg-gray-200 rounded mt-1" />
          ) : customContent ? (
            <div className="mt-1">{customContent}</div>
          ) : (
            <>
              <p className="text-2xl font-semibold mt-1">{value}</p>
              {subValue && (
                <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
              )}
            </>
          )}
        </div>

        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {trend && !loading && (
        <div
          className={`mt-2 text-sm flex items-center ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? "↑ 12%" : "↓ 5%"} from last week
        </div>
      )}
    </div>
  );
}
