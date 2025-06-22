import { User } from "lucide-react";

export default function ActivityItem({ user, action, time }: { user: string, action: string, time: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mt-1">
        <User className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="font-medium">{user}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
        <p className="text-sm text-gray-600">{action}</p>
      </div>
    </div>
  );
}
