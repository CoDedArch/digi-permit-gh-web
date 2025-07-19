import { calculateArea, isParcelContained } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";
import { useMap } from "react-leaflet";
interface ComplianceMapProps {
  parcelGeometry: GeoJSON.Geometry | null | undefined;
  spatialData?: GeoJSON.Geometry | null;
  constructionArea?: number | null;
  maxCoverage?: number | null;
  center: [number, number];
  locationNear?: boolean;
}

function VisibilityWarning({
  center,
  parcelCoords,
  locationNear,
}: {
  center: [number, number];
  parcelCoords: [number, number][];
  locationNear?: boolean;
}) {
  const map = useMap();
  const [bothVisible, setBothVisible] = useState(true);

  useEffect(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const parcelInView = parcelCoords.some(([lat, lng]) =>
      bounds.contains([lat, lng]),
    );
    const centerInView = bounds.contains(center);

    setBothVisible(parcelInView && centerInView);
  }, [map, center, parcelCoords]);

  if (locationNear || bothVisible) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-yellow-200 text-yellow-900 px-4 py-2 rounded-md shadow-md text-sm border border-yellow-300">
      <AlertTriangle className="w-4 h-4 text-yellow-700" />
      <span>
        <strong>Warning:</strong> Project location does not align with parcel
        boundary.
      </span>
    </div>
  );
}

export default function ComplianceMap({
  parcelGeometry,
  spatialData,
  constructionArea,
  maxCoverage,
  center,
  locationNear,
}: ComplianceMapProps) {
  const parcelCoords = parcelGeometry
    ? getPolygonCoordinates(parcelGeometry)
    : [];

  if (!parcelGeometry) {
    return (
      <div className="h-64 w-full rounded-md border flex items-center justify-center">
        <p className="text-muted-foreground">
          No parcel boundary data available
        </p>
      </div>
    );
  }

  // Calculate compliance statuses
  const isCoverageCompliant =
    constructionArea && maxCoverage
      ? constructionArea / parseFloat(calculateArea(parcelGeometry)) <=
        maxCoverage
      : false;

  const isContainmentCompliant = spatialData
    ? isParcelContained(parcelGeometry, spatialData)
    : false;

  // Determine colors based on compliance
  const parcelColor = isCoverageCompliant ? "#22c55e" : "#ef4444"; // Green/Red
  const spatialColor = isContainmentCompliant ? "#22c55e" : "#ef4444"; // Green/Red

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border relative">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <VisibilityWarning
          center={center}
          parcelCoords={parcelCoords}
          locationNear={locationNear}
        />

        <Polygon
          positions={getPolygonCoordinates(parcelGeometry)}
          pathOptions={{
            color: parcelColor,
            fillColor: parcelColor,
            fillOpacity: 0.4,
            weight: 3,
          }}
        />

        {spatialData && (
          <Polygon
            positions={getPolygonCoordinates(spatialData)}
            pathOptions={{
              color: spatialColor,
              fillColor: spatialColor,
              dashArray: "5, 5",
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white p-2 rounded-md shadow-md text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span>Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span>Non-compliant</span>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}

// Helper to extract polygon coordinates (handles MultiPolygon)
function getPolygonCoordinates(geometry: GeoJSON.Geometry): [number, number][] {
  if (geometry.type === "Polygon")
    return geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
  return [];
}
