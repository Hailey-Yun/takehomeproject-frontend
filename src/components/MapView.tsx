import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Parcel } from "../types/parcel";
import { getLatLng } from "../types/parcel";

type Props = { parcels: Parcel[] };

const SOURCE_ID = "parcels-src";
const LAYER_ID = "parcels-layer";

export default function MapView({ parcels }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [status, setStatus] = useState("init");

  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const points = useMemo(() => {
    const mapped = parcels.map((p) => {
      const ll = getLatLng(p);
      return ll ? { ...ll, raw: p } : null;
    });

    const valid = mapped.filter(Boolean) as { lat: number; lng: number; raw: Parcel }[];

    console.log("[MapView] parcels:", parcels.length);
    console.log("[MapView] valid points:", valid.length);
    console.log("[MapView] sample parcel:", parcels[0]);
    console.log("[MapView] sample latlng:", parcels[0] && getLatLng(parcels[0]));

    return valid;
  }, [parcels]);

  // 1) init map once
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    if (!token) {
      setStatus("VITE_MAPBOX_TOKEN missing (restart dev server)");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-96.8, 32.8],
      zoom: 9,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      setStatus("Map loaded");

      // add empty source + layer once
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-radius": 6,
            "circle-color": "#2563eb",     
            "circle-opacity": 0.85,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#1e40af", 
          },
        });
      }
    });

    map.on("error", (e) => {
      console.error("Mapbox error:", e);
      setStatus("Map error (check console)");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // 2) update points whenever parcels changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const src = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat],
        },
        properties: {
          sl_uuid: p.raw.sl_uuid ?? "",
          address: p.raw.address ?? "",
          county: p.raw.county ?? "",
          total_value: p.raw.total_value ?? "",
        },
      })),
    };

    src.setData(geojson);

    // optional: fit bounds on first load (when points appear)
    if (points.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      for (const p of points) bounds.extend([p.lng, p.lat]);
      map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 500 });
    }
  }, [points]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "white",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          padding: "6px 10px",
          fontSize: 12,
        }}
      >
        {status} / points: {points.length}
      </div>
    </div>
  );
}
