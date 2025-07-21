// components/AdminDashboardMap.tsx
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
  CheckCircle,
  Hourglass,
  ShieldX,
  CircleDot,
  Building2,
  Users,
} from "lucide-react";
import L from "leaflet";
import type { Polygon as geoPoly } from "geojson";

export interface PermitType {
  id: string;
  name: string;
}

export interface Permit {
  id: number;
  project_name: string;
  status: string;
  permit_type: PermitType | null;
  mmda_id: number;
  parcel_geometry: any;
  latitude: number | null;
  longitude: number | null;
  is_personal: boolean;
  applicant_name: string;
  department_id?: number;
}

export interface Department {
  id: number;
  name: string;
  mmda_id: number;
  staff_count: number;
  active_applications: number;
}

export interface MMDA {
  id: number;
  name: string;
  region: string;
  type: string;
  jurisdiction_boundaries: any;
  status_counts: {
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

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

const buildingSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9v.01" />
    <path d="M9 12v.01" />
    <path d="M9 15v.01" />
    <path d="M9 18v.01" />
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
                    <div>Applicant: {permit.applicant_name}</div>
                    <div>
                      Status:{" "}
                      <span className="capitalize">{permit.status}</span>
                    </div>
                    <div>Type: {permit.permit_type?.name || "N/A"}</div>
                    <div>MMDA ID: {permit.mmda_id}</div>
                    {permit.department_id && (
                      <div>Dept ID: {permit.department_id}</div>
                    )}
                    {isPersonal && (
                      <div className="text-purple-600 font-medium">
                        (Personal Property)
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
                  click: () => router.push(`/admin/permits/${permit.id}`),
                }}
              >
                <Tooltip direction="top" offset={[0, -15]} opacity={1}>
                  <div className="text-xs space-y-1 min-w-48">
                    <div className="font-semibold text-gray-800">
                      {isPersonal ? "⭐ " : ""}
                      {permit.project_name}
                    </div>
                    <div className="text-gray-600">
                      Applicant: {permit.applicant_name}
                    </div>
                    {isPersonal && (
                      <div className="text-purple-600 font-medium">
                        Personal Property
                      </div>
                    )}
                    <div className="text-gray-600">
                      Status:{" "}
                      <span className="capitalize font-medium">
                        {permit.status}
                      </span>
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

function DepartmentMapOverlay({
  departments,
  mmdas,
}: {
  departments: Department[];
  mmdas: MMDA[];
}) {
  const router = useRouter();

  return (
    <>
      {departments.map((dept, i) => {
        // Find the corresponding MMDA to get boundaries
        const mmda = mmdas.find((m) => m.id === dept.mmda_id);
        if (!mmda || mmda.jurisdiction_boundaries?.type !== "Polygon")
          return null;

        // Calculate center of MMDA for department marker placement
        const center = turf.center(mmda.jurisdiction_boundaries);
        const markerPosition = center.geometry.coordinates
          .slice()
          .reverse() as [number, number];

        // Offset multiple departments within same MMDA
        const deptIndex = departments
          .filter((d) => d.mmda_id === dept.mmda_id)
          .indexOf(dept);
        const offset = deptIndex * 0.01; // Small offset for multiple departments

        const finalPosition: [number, number] = [
          markerPosition[0] + offset,
          markerPosition[1] + offset,
        ];

        // Truncate long department names for the label
        const displayName =
          dept.name.length > 20
            ? dept.name.substring(0, 17) + "..."
            : dept.name;

        return (
          <Marker
            key={`dept-${i}`}
            position={finalPosition}
            icon={L.divIcon({
              className: "",
              html: `
                <div class='flex flex-col items-center gap-1 pointer-events-auto'>
                  <!-- Department Icon -->
                  <div class='bg-blue-600 text-white w-12 h-12 rounded-lg shadow-lg flex items-center justify-center border-2 border-white hover:bg-blue-700 transition-colors cursor-pointer'>
                    ${buildingSvg}
                  </div>
                  <!-- Department Name Label -->
                  <div class='bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-md shadow-md border border-gray-200 text-xs font-medium whitespace-nowrap max-w-32 text-center'>
                    ${displayName}
                  </div>
                </div>
              `,
              iconSize: [120, 80], // Wider to accommodate label
              iconAnchor: [60, 40], // Center the combined element
            })}
            eventHandlers={{
              click: () => router.push(`/admin/departments/${dept.id}`),
            }}
          >
            {/* Detailed tooltip on hover */}
            <Tooltip direction="top" offset={[0, -40]} opacity={1}>
              <div className="text-xs space-y-1 min-w-40">
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {dept.name}
                </div>
                <div className="text-gray-600 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Staff: {dept.staff_count}
                </div>
                <div className="text-gray-600">
                  Active Apps: {dept.active_applications}
                </div>
                <div className="text-gray-500 text-xs">MMDA: {mmda.name}</div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}

function MMDABoundariesOverlay({ mmdas }: { mmdas: MMDA[] }) {
  // const router = useRouter();

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
              // eventHandlers={{
              //   click: () => router.push(`/admin/mmdas/${mmda.id}`),
              // }}
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

export default function AdminDashboardMap({
  permits,
  mmdas,
  departments,
}: {
  permits: Permit[];
  mmdas: MMDA[];
  departments: Department[];
}) {
  // Calculate center based on all permits or default to Ghana center
  const defaultCenter: [number, number] =
    permits.length > 0
      ? [permits[0].latitude || 5.6, permits[0].longitude || -0.2]
      : [5.6, -0.2]; // Ghana center

  return (
    <div className="h-[75vh] rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={10}
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
          {/* Layer order: MMDA boundaries (bottom), then permits, then departments (top) */}
          <MMDABoundariesOverlay mmdas={mmdas} />
          <PermitMapOverlay permits={permits} />
          <DepartmentMapOverlay departments={departments} mmdas={mmdas} />
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
            <span>Personal Property</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-lg bg-blue-600"></div>
            <span>Departments</span>
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
