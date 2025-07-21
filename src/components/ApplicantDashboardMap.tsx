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
import { MMDA, Permit } from "./UseApplicationDashboardMap";
import type { Polygon as geoPoly } from "geojson";
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
  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
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
                pathOptions={{ color: MMDAColors[permit.status] || "gray" }}
                positions={permit.parcel_geometry.coordinates[0].map(
                  ([lng, lat]: [number, number]) => [lat, lng],
                )}
              >
                <Tooltip sticky>
                  <div className="text-xs">
                    <div className="font-bold mb-1">
                      {icons[permit.status]} {permit.project_name}
                    </div>
                    <div>Status: {permit.status}</div>
                    <div>Type: {permit.permit_type?.name}</div>
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {/* Marker: Either geometry center or lat/lng fallback */}
            {markerPosition && (
              <Marker
                position={markerPosition as [number, number]}
                icon={L.divIcon({
                  className: "text-indigo-600",
                  html: `
        <div class='bg-indigo-600 text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center'>
          ${fileTextSvg}
        </div>
      `,
                })}
                eventHandlers={{
                  click: () => router.push(`/my-applications/${permit.id}`),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-800">
                      {permit.project_name}
                    </div>
                    <div className="text-gray-600">
                      Status:{" "}
                      <span className="capitalize">{permit.status}</span>
                    </div>
                    <div className="text-gray-600">
                      Type: {permit.permit_type?.name || "N/A"}
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
          mmda.jurisdiction_boundaries.type === "Polygon" &&
          (mmda.jurisdiction_boundaries as geoPoly).coordinates[0] && (
            <Polygon
              key={`mmda-${i}`}
              positions={(
                mmda.jurisdiction_boundaries as geoPoly
              ).coordinates.map(
                (ring) =>
                  ring.map(([lng, lat]) => [lat, lng] as [number, number]), // convert each ring
              )}
              pathOptions={{ color: "orange", fillOpacity: 0.2 }}
            >
              <Tooltip sticky permanent direction="center" offset={[0, 0]}>
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-gray-800">{mmda.name}</div>
                  <div className="text-gray-600">Region: {mmda.region}</div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-indigo-600">
                      <CircleDot className="w-3 h-3" />{" "}
                      {mmda.status_counts.submitted} Submitted
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Hourglass className="w-3 h-3" />{" "}
                      {mmda.status_counts.under_review} Under Review
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />{" "}
                      {mmda.status_counts.approved} Approved
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <ShieldX className="w-3 h-3" />{" "}
                      {mmda.status_counts.rejected} Rejected
                    </div>
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          ),
      )}
    </>
  );
}

export default function ApplicantDashboardMap({
  permits,
  mmdas,
}: {
  permits: Permit[];
  mmdas: MMDA[];
}) {
  const defaultCenter: [number, number] = permits.length
    ? [permits[0].latitude || 5.6, permits[0].longitude || -0.2]
    : [5.6, -0.2];

  return (
    <div className="h-[75vh] rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={11}
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
          <PermitMapOverlay permits={permits} />
          <MMDABoundariesOverlay mmdas={mmdas} />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
