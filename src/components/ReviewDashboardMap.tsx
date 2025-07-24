// components/ReviewerDashboardMap.tsx
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
import { CheckCircle, Hourglass, ShieldX, CircleDot } from "lucide-react";
import L from "leaflet";
import type { Polygon as geoPoly } from "geojson";
import { MMDA, Permit } from "./UseReviewerDashboard";

const MMDAColors = {
  submitted: "#4f46e5",
  under_review: "#facc15",
  approved: "#22c55e",
  rejected: "#ef4444",
};

const icons = {
  submitted: <CircleDot className="h-4 w-4 text-indigo-600" />,
  under_review: <Hourglass className="h-4 w-4 text-yellow-500" />,
  approved: <CheckCircle className="h-4 w-4 text-green-600" />,
  rejected: <ShieldX className="h-4 w-4 text-red-600" />,
};

const fileTextSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
`;

function PermitMapOverlay({ permits }: { permits: Permit[] }) {
  const router = useRouter();

  return (
    <>
      {permits.map((permit, i) => {
        const hasGeometry = permit.parcel_geometry?.type === "Polygon";
        const hasLatLng = permit.latitude != null && permit.longitude != null;
        const isPersonal = permit.is_personal;

        const markerPosition = hasGeometry
          ? turf
              .center(permit.parcel_geometry)
              .geometry.coordinates.slice()
              .reverse()
          : hasLatLng
          ? [permit.latitude, permit.longitude]
          : null;

        return (
          <React.Fragment key={`permit-${i}`}>
            {/* Parcel Geometry */}
            {hasGeometry && (
              <Polygon
                pathOptions={{
                  color: isPersonal
                    ? "#9333ea"
                    : MMDAColors[permit.status] || "gray",
                  weight: isPersonal ? 3 : 2,
                  dashArray: isPersonal ? "5,5" : undefined,
                  fillOpacity: 0.3,
                }}
                positions={permit.parcel_geometry.coordinates[0].map(
                  ([lng, lat]: [number, number]) => [lat, lng],
                )}
              >
                <Tooltip sticky>
                  <div className="text-xs space-y-1">
                    <div className="font-bold">
                      {isPersonal ? "⭐ " : ""}
                      {icons[permit.status]} {permit.project_name}
                    </div>
                    <div>Status: {permit.status}</div>
                    <div>Type: {permit.permit_type?.name || "N/A"}</div>
                    <div>MMDA ID: {permit.mmda_id}</div>
                    {isPersonal && (
                      <div className="text-purple-600 font-medium">
                        (Your Property)
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {/* Permit Marker */}
            {markerPosition && (
              <Marker
                position={markerPosition as [number, number]}
                icon={L.divIcon({
                  className: "",
                  html: `
                    <div class='${
                      isPersonal
                        ? "bg-purple-600"
                        : {
                            submitted: "bg-indigo-600",
                            under_review: "bg-yellow-500",
                            approved: "bg-green-600",
                            rejected: "bg-red-600",
                          }[permit.status] || "bg-gray-500"
                    } text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white'>
                      ${isPersonal ? "⭐" : fileTextSvg}
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                })}
                eventHandlers={{
                  click: () =>
                    router.push(
                      isPersonal
                        ? `/my-applications/${permit.id}`
                        : `/review/permit/${permit.id}`,
                    ),
                }}
              >
                <Tooltip direction="top" offset={[0, -15]} opacity={1}>
                  <div className="text-xs space-y-1 min-w-48">
                    <div className="font-semibold text-gray-800">
                      {isPersonal ? "⭐ " : ""}
                      {permit.project_name}
                    </div>
                    {isPersonal && (
                      <div className="text-purple-600 font-medium">
                        Your Property
                      </div>
                    )}
                    <div className="text-gray-600">
                      Status:{" "}
                      <span className="capitalize font-medium">{permit.status}</span>
                    </div>
                    <div className="text-gray-600">
                      Type: {permit.permit_type?.name || "N/A"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      MMDA: {permit.mmda_id} | ID: {permit.id}
                    </div>
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
                    <div className="flex items-center gap-1 text-indigo-600">
                      <CircleDot className="w-3 h-3" />{" "}
                      {mmda.status_counts.submitted} Submitted
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Hourglass className="w-3 h-3" />{" "}
                      {mmda.status_counts.under_review} Under Review
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />{" "}
                      {mmda.status_counts.approved} Approved
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ShieldX className="w-3 h-3" />{" "}
                      {mmda.status_counts.rejected} Rejected
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 pt-1 border-t">
                    Total:{" "}
                    {Object.values(mmda.status_counts).reduce(
                      (a, b) => a + b,
                      0,
                    )}{" "}
                    permits
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ),
      )}
    </>
  );
}

export default function ReviewerDashboardMap({
  permits,
  mmdas,
  reviewerMmdaId, // Add this prop to identify reviewer's work MMDA
}: {
  permits: Permit[];
  mmdas: MMDA[];
  reviewerMmdaId?: number; // Optional prop for reviewer's current MMDA
}) {
  // Calculate center based on reviewer's work MMDA or work permits
  const calculateMapCenter = (): [number, number] => {
    // First priority: Use reviewer's work MMDA boundaries if available
    if (reviewerMmdaId) {
      const reviewerMmda = mmdas.find(m => m.id === reviewerMmdaId);
      if (reviewerMmda?.jurisdiction_boundaries?.type === "Polygon") {
        try {
          const center = turf.center(reviewerMmda.jurisdiction_boundaries);
          return center.geometry.coordinates.slice().reverse() as [number, number];
        } catch (error) {
          console.warn("Error calculating MMDA center:", error);
        }
      }
    }

    // Second priority: Use work permits (non-personal) from reviewer's MMDA
    const workPermits = permits.filter(p => !p.is_personal && p.mmda_id === reviewerMmdaId);
    if (workPermits.length > 0) {
      const validWorkPermits = workPermits.filter(p => 
        p.latitude != null && p.longitude != null
      );
      
      if (validWorkPermits.length > 0) {
        // Calculate average position of work permits
        const avgLat = validWorkPermits.reduce((sum, p) => sum + (p.latitude || 0), 0) / validWorkPermits.length;
        const avgLng = validWorkPermits.reduce((sum, p) => sum + (p.longitude || 0), 0) / validWorkPermits.length;
        return [avgLat, avgLng];
      }
    }

    // Third priority: Use any permits with coordinates
    const permitsWithCoords = permits.filter(p => 
      p.latitude != null && p.longitude != null
    );
    
    if (permitsWithCoords.length > 0) {
      return [permitsWithCoords[0].latitude!, permitsWithCoords[0].longitude!];
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
    if (reviewerMmdaId) {
      const reviewerMmda = mmdas.find(m => m.id === reviewerMmdaId);
      if (reviewerMmda?.jurisdiction_boundaries?.type === "Polygon") {
        try {
          const bbox = turf.bbox(reviewerMmda.jurisdiction_boundaries);
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
          {/* Layer order: MMDA boundaries (bottom), then permits (top) */}
          <MMDABoundariesOverlay mmdas={mmdas} />
          <PermitMapOverlay permits={permits} />
        </FeatureGroup>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs z-[1000]">
        <div className="font-semibold mb-2">Map Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span>Submitted Permits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span>Your Personal Property</span>
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