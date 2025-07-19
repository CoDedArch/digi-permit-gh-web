import { Clock } from "lucide-react";

interface InspectionCardProps {
  time: string;
  permitNo: string;
  address: string;
  type: string;
  status: string;
  inspectionId: number;
}

export default function InspectionCard({ 
  time, 
  permitNo, 
  address, 
  type, 
  status,
  inspectionId 
}: InspectionCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium">{time}</h3>
            <p className="text-sm text-gray-500">{permitNo}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "Scheduled" ? "bg-blue-100 text-blue-800" :
          status === "Confirmed" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {status}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium">{address}</p>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      <div className="mt-3 flex space-x-2">
        <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">View Details</button>
        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">Directions</button>
      </div>
    </div>
  );
}