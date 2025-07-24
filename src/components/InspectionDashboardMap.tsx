// components/InspectorDashboardMap.tsx
"use client";
import * as turf from "@turf/turf";
import React from "react";
import { useRouter } from "next/navigation";
import {
  MapContainer,
  TileLayer,
  Polygon,
  FeatureGroup,
  Tooltip,
  Marker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CalendarCheck,
  FileText,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";
import L from "leaflet";
import type { Polygon as geoPoly } from "geojson";
import { PermitApplication, MMDA } from "./UseInspectorDashboard";

const MMDAColors = {
  pending: "#6b7280",
  scheduled: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#10b981",
  cancelled: "#ef4444",
  awaiting_inspection: "#8b5cf6",
};

type InspectionStatus = keyof typeof MMDAColors;

const StatusColorClasses: Record<string, string> = {
  pending: "bg-gray-500",
  scheduled: "bg-blue-500",
  in_progress: "bg-yellow-500",
  completed: "bg-green-600",
  cancelled: "bg-red-500",
  awaiting_inspection: "bg-purple-600",
};

function getMarkerStatus(item: PermitApplication): string {
  const inspectionStatus = item.inspections?.[0]?.status?.toLowerCase?.();

  if (inspectionStatus) {
    return inspectionStatus;
  }

  const appStatus = item.status?.toLowerCase?.();

  // Map application statuses to marker colors
  const appStatusToMarkerStatus: Record<string, string> = {
    inspection_pending: "awaiting_inspection",
    under_review: "awaiting_inspection",
    approved: "awaiting_inspection",
    additional_info_requested: "pending",
    submitted: "pending",
    draft: "pending",
    rejected: "cancelled",
    cancelled: "cancelled",
    completed: "completed",
    inspected: "completed",
    issued: "completed",
  };

  return appStatusToMarkerStatus[appStatus] || "pending";
}

const icons = {
  pending: <Clock className="h-4 w-4 text-gray-500" />,
  scheduled: <CalendarCheck className="h-4 w-4 text-blue-500" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
  completed: <Check className="h-4 w-4 text-green-600" />,
  cancelled: <AlertCircle className="h-4 w-4 text-red-600" />,
  awaiting_inspection: <FileText className="h-4 w-4 text-purple-600" />,
};

const inspectionSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
`;

type DashboardItem = PermitApplication & {
  type: "application" | "inspection";
  application_id?: number;
  inspection_type?: { name: string };
  scheduled_date?: string | null;
};

export function InspectionMapOverlay({ items }: { items: DashboardItem[] }) {
  const router = useRouter();

  return (
    <>
      {items.map((item, i) => {
        const hasGeometry = item.parcel_geometry?.type === "Polygon";
        const hasLatLng = item.latitude != null && item.longitude != null;
        const isPersonal = item.is_personal;

        const markerPosition = hasGeometry
          ? turf
              .center(item.parcel_geometry)
              .geometry.coordinates.slice()
              .reverse()
          : hasLatLng
          ? [item.latitude, item.longitude]
          : null;

        const rawStatus = item.status?.toLowerCase() || "pending";
        const status = rawStatus as InspectionStatus;

        const isApplication = item.type === "application";

        const markerStatus = getMarkerStatus(item);
        const markerColorClass =
          StatusColorClasses[markerStatus] || "bg-gray-500";

        return (
          <React.Fragment key={`item-${i}`}>
            {/* Parcel Geometry */}
            {hasGeometry && (
              <Polygon
                pathOptions={{
                  color: isPersonal ? "#9333ea" : MMDAColors[status] || "gray",
                  weight: isPersonal ? 3 : 2,
                  dashArray: isPersonal ? "5,5" : undefined,
                }}
                positions={item.parcel_geometry.coordinates[0].map(
                  ([lng, lat]: [number, number]) => [lat, lng],
                )}
              >
                <Tooltip sticky>
                  <div className="text-xs">
                    <div className="font-bold mb-1">
                      {isPersonal ? "⭐ " : ""}
                      {icons[status]} {item.project_name}
                    </div>
                    <div>Status: {item.status}</div>
                    <div>
                      Type:{" "}
                      {isApplication
                        ? item.permit_type?.name || "N/A"
                        : item.inspection_type?.name || "N/A"}
                    </div>
                    {isPersonal && (
                      <div className="text-purple-600">(Your Application)</div>
                    )}
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {/* Marker */}
            {markerPosition && (
              <Marker
                position={markerPosition as [number, number]}
                icon={L.divIcon({
                  className: "",
                  html: `
    <div class='${markerColorClass} text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center'>
      ${isPersonal ? "⭐" : isApplication ? "📄" : inspectionSvg}
    </div>
  `,
                })}
                eventHandlers={{
                  click: () =>
                    router.push(
                      isApplication
                        ? `/applications/${item.application_id || item.id}`
                        : isPersonal
                        ? `/my-applications/${item.id}`
                        : `/inspections/${item.id}`,
                    ),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-800">
                      {isPersonal ? "⭐ " : ""}
                      {item.project_name}
                    </div>
                    {isPersonal && (
                      <div className="text-purple-600 font-medium">
                        Your Application
                      </div>
                    )}
                    <div className="text-gray-600">
                      Status: <span className="capitalize">{item.status}</span>
                    </div>
                    <div className="text-gray-600">
                      Type:{" "}
                      {isApplication
                        ? item.permit_type?.name || "N/A"
                        : item.inspection_type?.name || "N/A"}
                    </div>
                    {!isApplication && item.scheduled_date && (
                      <div className="text-gray-600">
                        Scheduled:{" "}
                        {new Date(item.scheduled_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

function MMDABoundariesOverlay({ mmdas }: { mmdas: MMDA[] }) {
  return (
    <>
      {mmdas.map(
        (mmda, i) =>
          mmda.jurisdiction_boundaries?.type === "Polygon" &&
          (mmda.jurisdiction_boundaries as geoPoly).coordinates?.[0] && (
            <Polygon
              key={`mmda-${i}`}
              positions={(
                mmda.jurisdiction_boundaries as geoPoly
              ).coordinates.map((ring) =>
                ring.map(([lng, lat]) => [lat, lng] as [number, number]),
              )}
              pathOptions={{
                color: "#f97316",
                fillOpacity: 0.1,
                weight: 2,
                dashArray: "10,5",
              }}
            >
              <Tooltip sticky permanent direction="center" offset={[0, 0]}>
                <div className="text-xs space-y-1 bg-white/95 p-2 rounded shadow-md">
                  <div className="font-semibold text-gray-800">{mmda.name}</div>
                  <div className="text-gray-600">Region: {mmda.region}</div>
                  <div className="text-gray-600">Type: {mmda.type}</div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" /> {mmda.status_counts.pending}{" "}
                      Pending
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <CalendarCheck className="w-3 h-3" />{" "}
                      {mmda.status_counts.scheduled} Scheduled
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Clock className="w-3 h-3" />{" "}
                      {mmda.status_counts.in_progress} In Progress
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />{" "}
                      {mmda.status_counts.completed} Completed
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />{" "}
                      {mmda.status_counts.cancelled} Cancelled
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <FileText className="w-3 h-3" />{" "}
                      {mmda.status_counts.awaiting_inspection} Awaiting
                      Inspection
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 pt-1 border-t">
                    Total:{" "}
                    {Object.values(mmda.status_counts).reduce(
                      (a, b) => a + b,
                      0,
                    )}{" "}
                    inspections
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ),
      )}
    </>
  );
}

export default function InspectorDashboardMap({
  items,
  mmdas,
  inspectorMmdaId, // Add this prop to identify inspector's work MMDA
}: {
  items: PermitApplication[];
  mmdas: MMDA[];
  inspectorMmdaId?: number;
}) {
  // Calculate center based on inspector's work MMDA or work applications
  const calculateMapCenter = (): [number, number] => {
    // First priority: Use inspector's work MMDA boundaries if available
    if (inspectorMmdaId) {
      const inspectorMmda = mmdas.find(m => m.id === inspectorMmdaId);
      if (inspectorMmda?.jurisdiction_boundaries?.type === "Polygon") {
        try {
          const center = turf.center(inspectorMmda.jurisdiction_boundaries);
          return center.geometry.coordinates.slice().reverse() as [number, number];
        } catch (error) {
          console.warn("Error calculating MMDA center:", error);
        }
      }
    }

    // Second priority: Use work applications (non-personal) from inspector's MMDA
    const workApplications = items.filter(item => 
      !item.is_personal && item.mmda_id === inspectorMmdaId
    );
    
    if (workApplications.length > 0) {
      const validWorkApps = workApplications.filter(app => 
        app.latitude != null && app.longitude != null
      );
      
      if (validWorkApps.length > 0) {
        // Calculate average position of work applications
        const avgLat = validWorkApps.reduce((sum, app) => sum + (app.latitude || 0), 0) / validWorkApps.length;
        const avgLng = validWorkApps.reduce((sum, app) => sum + (app.longitude || 0), 0) / validWorkApps.length;
        return [avgLat, avgLng];
      }
    }

    // Third priority: Use any applications with coordinates
    const appsWithCoords = items.filter(item => 
      item.latitude != null && item.longitude != null
    );
    
    if (appsWithCoords.length > 0) {
      return [appsWithCoords[0].latitude!, appsWithCoords[0].longitude!];
    }

    // Fourth priority: Use any MMDA boundary center
    for (const mmda of mmdas) {
      if (mmda.jurisdiction_boundaries?.type === "Polygon") {
        try {
          const center = turf.center(mmda.jurisdiction_boundaries);
          return center.geometry.coordinates.slice().reverse() as [number, number];
        } catch (error) {
          continue;
        }
      }
    }

    // Default fallback: Ghana center
    return [5.6, -0.2];
  };

  const mapCenter = calculateMapCenter();
  
  // Calculate appropriate zoom level based on MMDA size
  const calculateZoom = (): number => {
    if (inspectorMmdaId) {
      const inspectorMmda = mmdas.find(m => m.id === inspectorMmdaId);
      if (inspectorMmda?.jurisdiction_boundaries?.type === "Polygon") {
        try {
          const bbox = turf.bbox(inspectorMmda.jurisdiction_boundaries);
          const [minLng, minLat, maxLng, maxLat] = bbox;
          
          // Calculate rough area to determine zoom
          const latDiff = maxLat - minLat;
          const lngDiff = maxLng - minLng;
          const maxDiff = Math.max(latDiff, lngDiff);
          
          // Adjust zoom based on area size
          if (maxDiff < 0.1) return 13; // Very small area
          if (maxDiff < 0.5) return 11; // Small area
          if (maxDiff < 1.0) return 10; // Medium area
          if (maxDiff < 2.0) return 9;  // Large area
          return 8; // Very large area
        } catch (error) {
          console.warn("Error calculating zoom level:", error);
        }
      }
    }
    return 10; // Default zoom
  };

  const mapZoom = calculateZoom();

  return (
    <div className="h-[75vh] rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{
          zIndex: 0,
          position: "relative",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <FeatureGroup>
          {/* Layer order: MMDA boundaries (bottom), then applications (top) */}
          <MMDABoundariesOverlay mmdas={mmdas} />
          <InspectionMapOverlay
            items={items.map((item) => ({
              ...item,
              type: "application",
            }))}
          />
        </FeatureGroup>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs z-[1000]">
        <div className="font-semibold mb-2">Inspection Map Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Pending Inspection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span>Awaiting Inspection / Your Personal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-orange-500"></div>
            <span>MMDA Boundaries</span>
          </div>
        </div>
      </div>
    </div>
  );
}