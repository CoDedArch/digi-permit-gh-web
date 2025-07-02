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
  onChange: (value: string) => void;
  center: [number, number]; // [latitude, longitude]
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
}: SpatialPolygonInputProps) {
  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
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
        <FeatureGroup>
          {value && (
            <Polygon
              positions={JSON.parse(value).coordinates[0].map(
                ([lng, lat]: [number, number]) => [lat, lng],
              )}
              pathOptions={{ color: "#4f46e5" }}
            />
          )}
        </FeatureGroup>
        <GeomanHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}
