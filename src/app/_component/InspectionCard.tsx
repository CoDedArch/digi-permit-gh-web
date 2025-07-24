import { Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface InspectionCardProps {
  time: string;
  permitNo: string;
  address: string;
  type: string;
  status: string;
  inspectionId: number;
  // onViewDetails: (inspectionId: number) => void;
}

export default function InspectionCard({ 
  time, 
  permitNo, 
  address, 
  type, 
  status,
  inspectionId,
  // onViewDetails 
}: InspectionCardProps) {

  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGetDirections = () => {
    // Open Google Maps with the address
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-3">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{address}</p>
            <p className="text-sm text-gray-500">{type}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => router.push(`/schedule-inspection/${inspectionId}`)}
          className="flex-1 bg-purple-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-purple-700 font-medium transition-colors"
        >
          View Details
        </button>
        <button 
          onClick={handleGetDirections}
          className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 px-3 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Directions
        </button>
      </div>
    </div>
  );
}