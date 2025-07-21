"use client";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet";
import { useEffect } from "react";

interface SpatialPolygonInputProps {
  value: string | null;
  onChange?: (value: string) => void; // Made optional
  center: [number, number];
  referencePolygon?: string;
  readonly?: boolean; // Added new prop
}

function GeomanHandler({ onChange }: { onChange: (geojson: string) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawMarker: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawRectangle: false,
    });

    map.on("pm:create", (e: any) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      onChange(JSON.stringify(geojson.geometry));
    });

    map.on("pm:edit", (e: any) => {
      e.layers.eachLayer((layer: any) => {
        const geojson = layer.toGeoJSON();
        onChange(JSON.stringify(geojson.geometry));
      });
    });

    return () => {
      map.off("pm:create");
      map.off("pm:edit");
    };
  }, [map, onChange]);

  return null;
}

export default function SpatialPolygonInput({
  value,
  onChange,
  center,
  referencePolygon,
  readonly = false, // Default to false
}: SpatialPolygonInputProps) {
  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
      <MapContainer
        center={center}
        zoom={16}
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

        {/* Parcel Boundary (primary) */}
        {value && (
          <Polygon
            positions={JSON.parse(value).coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng],
            )}
            pathOptions={{
              color: "#4f46e5",
              fillOpacity: 0.4,
              weight: 2,
            }}
          />
        )}

        {/* Zoning District (reference) */}
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

        {/* Only show editing controls if not readonly */}
        {!readonly && onChange && <GeomanHandler onChange={onChange} />}
      </MapContainer>
    </div>
  );
}
