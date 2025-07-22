"use client";
import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import { center } from "@turf/turf";

// Fix for default markers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

interface CoordinatePoint {
  id: string;
  from: string;
  to: string;
  northing: number;
  easting: number;
  bearing?: number; // BRG in degrees
  distance?: number; // DIST in meters
}

interface CoordinateParcelInputProps {
  value: string | null;
  onChange?: (value: string) => void;
  center: [number, number];
  referencePolygon?: string;
  readonly?: boolean;
}

// Coordinate system conversion utilities
const convertToLatLng = (northing: number, easting: number, coordinateSystem: string = 'UTM') => {
  // For demonstration, assuming UTM Zone 30N (Ghana region)
  // In production, you'd use a proper projection library like proj4js
  
  if (coordinateSystem === 'UTM') {
    // Simplified UTM to WGS84 conversion for Ghana region (approximate)
    const lat = (northing - 1000000) / 111320 + 9.0; // Rough approximation
    const lng = (easting - 500000) / 111320 * Math.cos(lat * Math.PI / 180) - 1.0;
    return [lat, lng] as [number, number];
  } else if (coordinateSystem === 'LOCAL') {
    // For local coordinate systems, you might need a base point
    // This is a placeholder - implement based on your local system
    return [center[0] + northing / 111320, center[1] + easting / 111320] as [number, number];
  }
  
  // Default: treat as decimal degrees
  return [northing, easting] as [number, number];
};

// Calculate bearing and distance between two points
const calculateBearingDistance = (point1: [number, number], point2: [number, number]) => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  // Calculate distance using Haversine formula
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return { bearing: Math.round(bearing * 100) / 100, distance: Math.round(distance * 100) / 100 };
};

export default function CoordinateParcelInput({
  value,
  onChange,
  center,
  referencePolygon,
  readonly = false,
}: CoordinateParcelInputProps) {
  const [coordinates, setCoordinates] = useState<CoordinatePoint[]>([]);
  const [coordinateSystem, setCoordinateSystem] = useState<'UTM' | 'LOCAL' | 'DECIMAL'>('UTM');
  const [isPolygonClosed, setIsPolygonClosed] = useState(false);

  // Initialize with existing value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.coordinates && parsed.coordinates[0]) {
          // Convert back from GeoJSON to coordinate points
          const points = parsed.coordinates[0].map((coord: [number, number], index: number) => ({
            id: `point-${index}`,
            from: `P${index + 1}`,
            to: `P${index + 2}`,
            northing: coord[1], // lat
            easting: coord[0], // lng
          }));
          setCoordinates(points.slice(0, -1)); // Remove duplicate last point
          setIsPolygonClosed(true);
        }
      } catch (error) {
        console.error('Error parsing existing value:', error);
      }
    }
  }, [value]);

  const addCoordinate = () => {
    const newPoint: CoordinatePoint = {
      id: `point-${coordinates.length}`,
      from: `P${coordinates.length + 1}`,
      to: `P${coordinates.length + 2}`,
      northing: 0,
      easting: 0,
    };
    setCoordinates([...coordinates, newPoint]);
  };

  const updateCoordinate = (id: string, field: keyof CoordinatePoint, value: string | number) => {
    setCoordinates(coords => 
      coords.map(coord => 
        coord.id === id 
          ? { ...coord, [field]: field === 'northing' || field === 'easting' || field === 'bearing' || field === 'distance' 
              ? parseFloat(value as string) || 0 
              : value }
          : coord
      )
    );
  };

  const removeCoordinate = (id: string) => {
    setCoordinates(coords => coords.filter(coord => coord.id !== id));
  };

  // Convert coordinates to map points and generate polygon
  const mapPoints = coordinates.map(coord => {
    if (coordinateSystem === 'DECIMAL') {
      return [coord.northing, coord.easting] as [number, number];
    }
    return convertToLatLng(coord.northing, coord.easting, coordinateSystem);
  });

  // Check if polygon can be closed (minimum 3 points)
  const canClosePolygon = coordinates.length >= 3;
  
  // Auto-calculate bearing and distance for each segment
  // Extracted dependency for useEffect
  const mapPointsKey = mapPoints.map(p => p.join(',')).join('|');

  useEffect(() => {
    if (mapPoints.length > 1) {
      const updatedCoords = coordinates.map((coord, index) => {
        if (index < mapPoints.length - 1) {
          const { bearing, distance } = calculateBearingDistance(mapPoints[index], mapPoints[index + 1]);
          return { ...coord, bearing, distance };
        }
        return coord;
      });
      
      // Only update if there are actual changes to prevent infinite loops
      const hasChanges = updatedCoords.some((coord, index) => 
        coord.bearing !== coordinates[index]?.bearing || 
        coord.distance !== coordinates[index]?.distance
      );
      
      if (hasChanges) {
        setCoordinates(updatedCoords);
      }
    }
  }, [mapPointsKey, coordinates, mapPoints]);

  // Generate GeoJSON and update parent
  useEffect(() => {
    if (canClosePolygon && onChange) {
      // Close the polygon by adding the first point at the end
      const closedPoints = [...mapPoints, mapPoints[0]];
      const geoJsonCoords = closedPoints.map(([lat, lng]) => [lng, lat]); // GeoJSON uses [lng, lat]
      
      const geoJson = {
        type: "Polygon",
        coordinates: [geoJsonCoords]
      };
      
      onChange(JSON.stringify(geoJson));
      setIsPolygonClosed(true);
    } else {
      setIsPolygonClosed(false);
    }
  }, [mapPoints, canClosePolygon, onChange]);

  const polygonColor = isPolygonClosed ? "#22c55e" : "#ef4444"; // Green if closed, red if incomplete

  return (
    <div className="space-y-4">
      {!readonly && (
        <>
          {/* Coordinate System Selection */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="UTM"
                checked={coordinateSystem === 'UTM'}
                onChange={(e) => setCoordinateSystem(e.target.value as 'UTM' | 'LOCAL' | 'DECIMAL')}
                className="rounded"
              />
              UTM Coordinates
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="LOCAL"
                checked={coordinateSystem === 'LOCAL'}
                onChange={(e) => setCoordinateSystem(e.target.value as 'UTM' | 'LOCAL' | 'DECIMAL')}
                className="rounded"
              />
              Local Grid
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="DECIMAL"
                checked={coordinateSystem === 'DECIMAL'}
                onChange={(e) => setCoordinateSystem(e.target.value as 'UTM' | 'LOCAL' | 'DECIMAL')}
                className="rounded"
              />
              Decimal Degrees
            </label>
          </div>

          {/* Coordinate Input Table */}
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
                      {coordinateSystem === 'DECIMAL' ? 'Latitude' : 'Northing'}
                    </th>
                    <th className="text-left p-2 text-sm font-medium">
                      {coordinateSystem === 'DECIMAL' ? 'Longitude' : 'Easting'}
                    </th>
                    <th className="text-left p-2 text-sm font-medium">BRG (°)</th>
                    <th className="text-left p-2 text-sm font-medium">DIST (m)</th>
                    <th className="text-left p-2 text-sm font-medium">To</th>
                    <th className="text-left p-2 text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coordinates.map((coord) => (
                    <tr key={coord.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="text"
                          value={coord.from}
                          onChange={(e) => updateCoordinate(coord.id, 'from', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="P1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.northing}
                          onChange={(e) => updateCoordinate(coord.id, 'northing', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder={coordinateSystem === 'DECIMAL' ? '5.6037' : '620000'}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.easting}
                          onChange={(e) => updateCoordinate(coord.id, 'easting', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder={coordinateSystem === 'DECIMAL' ? '-0.1870' : '750000'}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={coord.bearing || ''}
                          readOnly
                          className="w-full px-2 py-1 border rounded text-sm bg-gray-50"
                          placeholder="Auto"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={coord.distance || ''}
                          readOnly
                          className="w-full px-2 py-1 border rounded text-sm bg-gray-50"
                          placeholder="Auto"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={coord.to}
                          onChange={(e) => updateCoordinate(coord.id, 'to', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="P2"
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
                  Points: {coordinates.length} | 
                  Status: <span className={isPolygonClosed ? "text-green-600" : "text-red-600"}>
                    {isPolygonClosed ? "Polygon Complete" : canClosePolygon ? "Ready to close" : "Need minimum 3 points"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Map Display */}
      <div className="h-96 w-full rounded-md overflow-hidden border">
        <MapContainer
          center={mapPoints.length > 0 ? mapPoints[0] : center}
          zoom={16}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ zIndex: 0, position: "relative" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {/* Reference Polygon (Zoning District) */}
          {referencePolygon && (
            <Polygon
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

          {/* Plot coordinate points as markers */}
          {mapPoints.map((point, index) => (
            <Marker key={index} position={point}>
              <Popup>
                <div>
                  <strong>{coordinates[index]?.from}</strong><br />
                  {coordinateSystem === 'DECIMAL' ? 'Lat/Lng' : 'N/E'}: {point[0].toFixed(6)}, {point[1].toFixed(6)}
                  {coordinates[index]?.bearing && (
                    <>
                      <br />Bearing: {coordinates[index].bearing}°
                      <br />Distance: {coordinates[index].distance}m
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Draw lines between points */}
          {mapPoints.length > 1 && (
            <Polyline
              positions={mapPoints}
              pathOptions={{
                color: polygonColor,
                weight: 2,
                dashArray: isPolygonClosed ? undefined : "5, 5",
              }}
            />
          )}

          {/* Draw closing line if polygon is complete */}
          {canClosePolygon && (
            <Polyline
              positions={[mapPoints[mapPoints.length - 1], mapPoints[0]]}
              pathOptions={{
                color: polygonColor,
                weight: 2,
                dashArray: isPolygonClosed ? undefined : "5, 5",
              }}
            />
          )}

          {/* Draw filled polygon if complete */}
          {isPolygonClosed && mapPoints.length >= 3 && (
            <Polygon
              positions={mapPoints}
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
}