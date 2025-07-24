"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;

interface CoordinatePoint {
  id: string;
  from: string;
  to: string;
  northing: number;
  easting: number;
  bearing?: number;
  distance?: number;
}

interface CoordinateParcelInputProps {
  value: string | null;
  onChange?: (value: string) => void;
  center: [number, number];
  referencePolygon?: string;
  readonly?: boolean;
}

// Custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized map components to prevent unnecessary re-renders
const MemoizedPolygon = React.memo(Polygon);
const MemoizedPolyline = React.memo(Polyline);
const MemoizedMarker = React.memo(Marker);

// Coordinate conversion utilities
const convertToLatLng = (
  northing: number,
  easting: number,
  coordinateSystem: string = "UTM",
): [number, number] => {
  if (coordinateSystem === "UTM") {
    const lat = (northing - 1000000) / 111320 + 9.0;
    const lng =
      ((easting - 500000) / 111320) * Math.cos((lat * Math.PI) / 180) - 1.0;
    return [lat, lng];
  }
  return [northing, easting];
};

const calculateBearingDistance = (
  point1: [number, number],
  point2: [number, number],
) => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    bearing: Math.round(bearing * 100) / 100,
    distance: Math.round(distance * 100) / 100,
  };
};

const CoordinateParcelInput: React.FC<CoordinateParcelInputProps> = ({
  value,
  onChange,
  center,
  referencePolygon,
  readonly = false,
}) => {
  const [coordinates, setCoordinates] = useState<CoordinatePoint[]>([]);
  const [coordinateSystem, setCoordinateSystem] = useState<
    "UTM" | "LOCAL" | "DECIMAL"
  >("UTM");
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  // Initialize with existing value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.coordinates?.[0]) {
          const points = parsed.coordinates[0].map(
            (coord: [number, number], index: number) => ({
              id: `point-${index}`,
              from: `P${index + 1}`,
              to: `P${index + 2}`,
              northing: coord[1],
              easting: coord[0],
            }),
          );
          setCoordinates(points.slice(0, -1));
          setIsPolygonClosed(true);
        }
      } catch (error) {
        console.error("Error parsing existing value:", error);
      }
    }
  }, [value]);

  // Convert coordinates to map points
  const mapPoints = coordinates.map((coord) => {
    return coordinateSystem === "DECIMAL"
      ? ([coord.northing, coord.easting] as [number, number])
      : convertToLatLng(coord.northing, coord.easting, coordinateSystem);
  });

  // Debounce the map points to prevent rapid updates
  const debouncedMapPoints = useDebounce(mapPoints, 300);

  // Calculate bearing and distance only when needed
  useEffect(() => {
    if (debouncedMapPoints.length > 1) {
      const lastIndex = debouncedMapPoints.length - 1;
      const { bearing, distance } = calculateBearingDistance(
        debouncedMapPoints[lastIndex - 1],
        debouncedMapPoints[lastIndex],
      );

      setCoordinates((prev) =>
        prev.map((coord, i) =>
          i === lastIndex - 1 ? { ...coord, bearing, distance } : coord,
        ),
      );
    }
  }, [debouncedMapPoints.length]);

  // Generate GeoJSON only when the polygon can be closed
  const canClosePolygon = debouncedMapPoints.length >= 3;
  useEffect(() => {
    if (canClosePolygon && onChange) {
      const closedPoints = [...debouncedMapPoints, debouncedMapPoints[0]];
      const geoJson = {
        type: "Polygon",
        coordinates: [closedPoints.map(([lat, lng]) => [lng, lat])],
      };
      onChange(JSON.stringify(geoJson));
      setIsPolygonClosed(true);
    } else {
      setIsPolygonClosed(false);
    }
  }, [debouncedMapPoints, canClosePolygon, onChange]);

  // Optimized coordinate update function
  const updateCoordinate = useCallback(
    (id: string, field: keyof CoordinatePoint, value: string | number) => {
      setCoordinates((prev) =>
        prev.map((coord) =>
          coord.id === id
            ? {
                ...coord,
                [field]:
                  typeof value === "number"
                    ? value
                    : ["northing", "easting"].includes(field)
                    ? parseFloat(value) || 0
                    : value,
              }
            : coord,
        ),
      );
    },
    [],
  );

  const addCoordinate = useCallback(() => {
    setCoordinates((prev) => [
      ...prev,
      {
        id: `point-${prev.length}`,
        from: `P${prev.length + 1}`,
        to: `P${prev.length + 2}`,
        northing: 0,
        easting: 0,
      },
    ]);
  }, []);

  const removeCoordinate = useCallback((id: string) => {
    setCoordinates((prev) => prev.filter((coord) => coord.id !== id));
  }, []);

  const polygonColor = isPolygonClosed ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-4">
      {!readonly && (
        <>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="UTM"
                checked={coordinateSystem === "UTM"}
                onChange={() => setCoordinateSystem("UTM")}
                className="rounded"
              />
              UTM Coordinates
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="DECIMAL"
                checked={coordinateSystem === "DECIMAL"}
                onChange={() => setCoordinateSystem("DECIMAL")}
                className="rounded"
              />
              Decimal Degrees
            </label>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-medium">Survey Plan Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-2 text-sm font-medium">From</th>
                    <th className="text-left p-2 text-sm font-medium">
                      {coordinateSystem === "DECIMAL" ? "Latitude" : "Northing"}
                    </th>
                    <th className="text-left p-2 text-sm font-medium">
                      {coordinateSystem === "DECIMAL" ? "Longitude" : "Easting"}
                    </th>
                    <th className="text-left p-2 text-sm font-medium">
                      BRG (°)
                    </th>
                    <th className="text-left p-2 text-sm font-medium">
                      DIST (m)
                    </th>
                    <th className="text-left p-2 text-sm font-medium">To</th>
                    <th className="text-left p-2 text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coordinates.map((coord) => (
                    <tr key={coord.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={coord.from}
                          onChange={(e) =>
                            updateCoordinate(coord.id, "from", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.northing}
                          onChange={(e) =>
                            updateCoordinate(
                              coord.id,
                              "northing",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.easting}
                          onChange={(e) =>
                            updateCoordinate(
                              coord.id,
                              "easting",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={coord.bearing || ""}
                          readOnly
                          className="w-full px-2 py-1 border rounded text-sm bg-gray-50"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={coord.distance || ""}
                          readOnly
                          className="w-full px-2 py-1 border rounded text-sm bg-gray-50"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={coord.to}
                          onChange={(e) =>
                            updateCoordinate(coord.id, "to", e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => removeCoordinate(coord.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50 border-t">
              <button
                type="button"
                onClick={addCoordinate}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Coordinate Point
              </button>
              {coordinates.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Points: {coordinates.length} | Status:{" "}
                  <span
                    className={
                      isPolygonClosed ? "text-green-600" : "text-red-600"
                    }
                  >
                    {isPolygonClosed
                      ? "Polygon Complete"
                      : canClosePolygon
                      ? "Ready to close"
                      : "Need minimum 3 points"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="h-96 w-full rounded-md overflow-hidden border">
        <MapContainer
          center={debouncedMapPoints[0] || center}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {referencePolygon && (
            <MemoizedPolygon
              positions={JSON.parse(referencePolygon).coordinates[0].map(
                ([lng, lat]: [number, number]) => [lat, lng],
              )}
              pathOptions={{
                color: "#64748b",
                dashArray: "5, 5",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          )}

          {debouncedMapPoints.map((point, index) => (
            <MemoizedMarker key={index} position={point}>
              <Popup>
                <div>
                  <strong>{coordinates[index]?.from}</strong>
                  <br />
                  {coordinateSystem === "DECIMAL" ? "Lat/Lng" : "N/E"}:{" "}
                  {point[0].toFixed(6)}, {point[1].toFixed(6)}
                  {coordinates[index]?.bearing && (
                    <>
                      <br />
                      Bearing: {coordinates[index].bearing}°
                      <br />
                      Distance: {coordinates[index].distance}m
                    </>
                  )}
                </div>
              </Popup>
            </MemoizedMarker>
          ))}

          {debouncedMapPoints.length > 1 && (
            <MemoizedPolyline
              positions={debouncedMapPoints}
              pathOptions={{
                color: polygonColor,
                weight: 2,
                dashArray: isPolygonClosed ? undefined : "5, 5",
              }}
            />
          )}

          {canClosePolygon && (
            <MemoizedPolyline
              positions={[
                debouncedMapPoints[debouncedMapPoints.length - 1],
                debouncedMapPoints[0],
              ]}
              pathOptions={{
                color: polygonColor,
                weight: 2,
                dashArray: isPolygonClosed ? undefined : "5, 5",
              }}
            />
          )}

          {isPolygonClosed && debouncedMapPoints.length >= 3 && (
            <MemoizedPolygon
              positions={debouncedMapPoints}
              pathOptions={{
                color: polygonColor,
                fillOpacity: 0.3,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default React.memo(CoordinateParcelInput);
