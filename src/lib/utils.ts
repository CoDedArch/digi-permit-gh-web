import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as turf from "@turf/turf";
import { Geometry } from "geojson";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import booleanContains from "@turf/boolean-contains";
import type { Position } from "geojson";
import type { Feature, Point } from "geojson";
// type Position = [number, number] | [number, number, number];

function isPolygon(geom: GeoJSON.Geometry): geom is GeoJSON.Polygon {
  return geom.type === "Polygon";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils.ts

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getVertexCount(geometry: Geometry): number {
  switch (geometry.type) {
    case "Point":
      return 1;

    case "LineString":
    case "MultiPoint":
      return geometry.coordinates.length;

    case "Polygon":
      // Sum all rings (exterior + any interior/holes)
      return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);

    case "MultiLineString":
      return geometry.coordinates.reduce((sum, line) => sum + line.length, 0);

    case "MultiPolygon":
      return geometry.coordinates.reduce(
        (sum, polygon) =>
          sum + polygon.reduce((ringSum, ring) => ringSum + ring.length, 0),
        0,
      );

    case "GeometryCollection":
      return geometry.geometries.reduce(
        (sum, geom) => sum + getVertexCount(geom),
        0,
      );

    default:
      // TypeScript should catch this with never type, but just in case
      console.warn(`Unhandled geometry type: ${(geometry as any).type}`);
      return 0;
  }
}

export function calculateArea(geometry: Geometry | undefined): string {
  if (!geometry) return "N/A";

  try {
    let areaInSqM = 0;
    let isLinear = false;

    switch (geometry.type) {
      case "Polygon":
      case "MultiPolygon":
        areaInSqM = turf.area(turf.feature(geometry));
        break;

      case "LineString":
        isLinear = true;
        areaInSqM = turf.length(turf.lineString(geometry.coordinates), {
          units: "meters",
        });
        break;

      case "MultiLineString":
        isLinear = true;
        areaInSqM = turf.length(turf.multiLineString(geometry.coordinates), {
          units: "meters",
        });
        break;

      case "GeometryCollection":
        areaInSqM = geometry.geometries.reduce((sum, geom) => {
          if (geom.type === "LineString") {
            isLinear = true;
            return (
              sum +
              turf.length(turf.lineString(geom.coordinates), {
                units: "meters",
              })
            );
          }
          if (geom.type === "MultiLineString") {
            isLinear = true;
            return (
              sum +
              turf.length(turf.multiLineString(geom.coordinates), {
                units: "meters",
              })
            );
          }
          return (
            sum +
            (["Point", "MultiPoint"].includes(geom.type)
              ? 0
              : turf.area(turf.feature(geom)))
          );
        }, 0);
        break;

      case "Point":
      case "MultiPoint":
        return "0 m²";

      default:
        return "N/A";
    }

    if (isLinear) {
      // Format linear features
      if (areaInSqM >= 1000) {
        return `${(areaInSqM / 1000).toFixed(2)} km`;
      }
      return `${areaInSqM.toFixed(2)} m`;
    } else {
      // Format area features
      if (areaInSqM >= 1000000) {
        return `${(areaInSqM / 1000000).toFixed(2)} km²`;
      } else if (areaInSqM >= 10000) {
        return `${(areaInSqM / 10000).toFixed(2)} ha`;
      }
      return `${areaInSqM.toFixed(2)} m²`;
    }
  } catch (error) {
    console.error("Error calculating area:", error);
    return "N/A";
  }
}

export function calculatePerimeter(geometry: Geometry): string {
  try {
    let perimeterInMeters = 0;

    switch (geometry.type) {
      case "Polygon":
        // Sum the lengths of all rings (exterior + holes)
        perimeterInMeters = geometry.coordinates.reduce((sum, ring) => {
          return sum + turf.length(turf.lineString(ring), { units: "meters" });
        }, 0);
        break;

      case "MultiPolygon":
        // Sum perimeters of all polygons
        perimeterInMeters = geometry.coordinates.reduce((sum, polygon) => {
          return (
            sum +
            polygon.reduce((ringSum, ring) => {
              return (
                ringSum +
                turf.length(turf.lineString(ring), { units: "meters" })
              );
            }, 0)
          );
        }, 0);
        break;

      case "LineString":
        perimeterInMeters = turf.length(turf.lineString(geometry.coordinates), {
          units: "meters",
        });
        break;

      case "MultiLineString":
        perimeterInMeters = geometry.coordinates.reduce((sum, line) => {
          return sum + turf.length(turf.lineString(line), { units: "meters" });
        }, 0);
        break;

      case "GeometryCollection":
        perimeterInMeters = geometry.geometries.reduce((sum, geom) => {
          if (geom.type === "Polygon") {
            return (
              sum +
              geom.coordinates.reduce((ringSum, ring) => {
                return (
                  ringSum +
                  turf.length(turf.lineString(ring), { units: "meters" })
                );
              }, 0)
            );
          } else if (geom.type === "MultiPolygon") {
            return (
              sum +
              geom.coordinates.reduce((polySum, polygon) => {
                return (
                  polySum +
                  polygon.reduce((ringSum, ring) => {
                    return (
                      ringSum +
                      turf.length(turf.lineString(ring), { units: "meters" })
                    );
                  }, 0)
                );
              }, 0)
            );
          } else if (geom.type === "LineString") {
            return (
              sum +
              turf.length(turf.lineString(geom.coordinates), {
                units: "meters",
              })
            );
          } else if (geom.type === "MultiLineString") {
            return (
              sum +
              geom.coordinates.reduce((lineSum, line) => {
                return (
                  lineSum +
                  turf.length(turf.lineString(line), { units: "meters" })
                );
              }, 0)
            );
          }
          return sum; // Points have no perimeter
        }, 0);
        break;

      case "Point":
      case "MultiPoint":
        return "0 m"; // Points have no perimeter

      default:
        return "N/A";
    }

    // Format the output appropriately
    if (perimeterInMeters >= 1000) {
      return `${(perimeterInMeters / 1000).toFixed(2)} km`;
    }
    return `${perimeterInMeters.toFixed(2)} m`;
  } catch (error) {
    console.error("Error calculating perimeter:", error);
    return "N/A";
  }
}

export function getSampleCoordinates(
  geometry: GeoJSON.Geometry,
): [number, number][] {
  try {
    switch (geometry.type) {
      case "Point":
        return [[geometry.coordinates[0], geometry.coordinates[1]]];

      case "LineString":
        return getEquallySpacedSamples(geometry.coordinates, 5);

      case "Polygon":
        return geometry.coordinates.length > 0
          ? getEquallySpacedSamples(geometry.coordinates[0], 5)
          : [];

      case "MultiPoint":
        return geometry.coordinates
          .slice(0, 5)
          .map((coord) => [coord[0], coord[1]] as [number, number]);

      case "MultiLineString":
        return geometry.coordinates.length > 0
          ? getEquallySpacedSamples(geometry.coordinates[0], 5)
          : [];

      case "MultiPolygon":
        return geometry.coordinates.length > 0 &&
          geometry.coordinates[0].length > 0
          ? getEquallySpacedSamples(geometry.coordinates[0][0], 5)
          : [];

      case "GeometryCollection":
        for (const geom of geometry.geometries) {
          const samples = getSampleCoordinates(geom);
          if (samples.length > 0) return samples;
        }
        return [];

      default:
        const _exhaustiveCheck: never = geometry;
        return [];
    }
  } catch (error) {
    console.error("Error getting sample coordinates:", error);
    return [];
  }
}

function getEquallySpacedSamples(
  coordinates: GeoJSON.Position[],
  maxSamples: number,
): [number, number][] {
  if (coordinates.length <= maxSamples) {
    return coordinates.map((coord) => [coord[0], coord[1]] as [number, number]);
  }

  const step = Math.max(1, Math.floor(coordinates.length / maxSamples));
  const samples: [number, number][] = [];

  for (
    let i = 0;
    i < coordinates.length && samples.length < maxSamples;
    i += step
  ) {
    samples.push([coordinates[i][0], coordinates[i][1]] as [number, number]);
  }

  if (samples.length < maxSamples && coordinates.length > 0) {
    const lastCoord = coordinates[coordinates.length - 1];
    if (!samples.some((c) => c[0] === lastCoord[0] && c[1] === lastCoord[1])) {
      samples.push([lastCoord[0], lastCoord[1]] as [number, number]);
    }
  }

  return samples.slice(0, maxSamples);
}

export function parseParkingRequirement(
  req?: string | null,
  constructionArea?: number,
): number | null {
  if (!req) return null;

  // Handle "X spaces per Y units"
  const perUnitMatch = req.match(/(\d+)\s*space.*per\s*(\d+)\s*unit/i);
  if (perUnitMatch) {
    return Number(perUnitMatch[1]) / Number(perUnitMatch[2]);
  }

  // Handle "X space per Y m²"
  const perAreaMatch = req.match(/(\d+)\s*space.*per\s*(\d+)m²/i);
  if (perAreaMatch && constructionArea) {
    return (
      (Number(perAreaMatch[1]) / Number(perAreaMatch[2])) * constructionArea
    );
  }

  // Handle simple numbers
  const simpleNumber = req.match(/(\d+)/);
  if (simpleNumber) return Number(simpleNumber[1]);

  return null;
}

function getCenterPoint(
  geometry: GeoJSON.Geometry | undefined,
): Feature<Point> | null {
  if (!geometry) return null;

  try {
    // For points, use directly
    if (geometry.type === "Point") {
      return turf.point(geometry.coordinates);
    }

    // For other geometries, calculate center
    return turf.center(turf.feature(geometry));
  } catch (error) {
    console.error("Error calculating center point:", error);
    return null;
  }
}

function getFirstCoordinate(
  geometry: GeoJSON.Geometry | undefined,
): Position | null {
  if (!geometry) return null;

  try {
    switch (geometry.type) {
      case "Point":
        return geometry.coordinates;
      case "LineString":
      case "MultiPoint":
        return geometry.coordinates[0];
      case "Polygon":
      case "MultiLineString":
        return geometry.coordinates[0][0];
      case "MultiPolygon":
        return geometry.coordinates[0][0][0];
      default:
        return null;
    }
  } catch (error) {
    console.error("Error getting first coordinate:", error);
    return null;
  }
}

// Check if project location is near parcel geometry
export function isLocationNearParcel(
  parcelGeometry: GeoJSON.Geometry | undefined,
  projectLocation: GeoJSON.Geometry | undefined,
  maxDistanceMeters = 100,
): boolean {
  if (!parcelGeometry || !projectLocation) return false;

  try {
    // Get representative points for comparison
    const parcelPoint =
      getCenterPoint(parcelGeometry) ||
      turf.point(getFirstCoordinate(parcelGeometry)!);
    const projectPoint =
      getCenterPoint(projectLocation) ||
      turf.point(getFirstCoordinate(projectLocation)!);

    const distance = turf.distance(
      parcelPoint.geometry.coordinates,
      projectPoint.geometry.coordinates,
      { units: "meters" },
    );
    return distance <= maxDistanceMeters;
  } catch (error) {
    console.error("Error checking location proximity:", error);
    return false;
  }
}

export function isParcelContained(
  parcelGeometry: GeoJSON.Geometry | undefined,
  spatialData: GeoJSON.Geometry | undefined,
): boolean {
  if (!parcelGeometry || !spatialData) return false;
  try {
    // Handle Polygon-to-Polygon comparison
    if (isPolygon(parcelGeometry) && isPolygon(spatialData)) {
      console.log("Is Polygon");
      console.log("Parcel Geometry is", parcelGeometry.coordinates);
      console.log("Spatial Geometry is", spatialData.coordinates);
      return booleanContains(
        turf.polygon(spatialData.coordinates),
        turf.polygon(parcelGeometry.coordinates),
      );
    }

    // Handle Point-in-Polygon check
    if (parcelGeometry.type === "Point" && isPolygon(spatialData)) {
      console.log("in Point");
      return booleanPointInPolygon(
        turf.point(parcelGeometry.coordinates),
        turf.polygon(spatialData.coordinates),
      );
    }

    // For other geometry types, check if centroid is within boundary
    const centroid = turf.centroid(turf.feature(parcelGeometry));
    if (isPolygon(spatialData)) {
      return booleanPointInPolygon(
        centroid,
        turf.polygon(spatialData.coordinates),
      );
    }

    return false;
  } catch (error) {
    console.error("Error checking spatial containment:", error);
    return false;
  }
}
