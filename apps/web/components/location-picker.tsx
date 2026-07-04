import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Search } from "lucide-react";

// Fix default marker icon (Leaflet + bundlers)
const markerIcon = L.divIcon({
  className: "custom-map-marker",
  html: `<div style="
    width: 32px; height: 32px; transform: translate(-50%, -100%);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="oklch(0.55 0.22 264)" stroke="white" stroke-width="1.5">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
  value: string;
  onChange: (address: string, coords?: LatLng) => void;
}

function RecenterMap({ coords }: { coords: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 14, { duration: 0.8 });
  }, [coords, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (c: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Forward geocode (address -> coords) via Nominatim
  const forwardGeocode = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } },
      );
      const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
      if (data && data[0]) {
        const next = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setCoords(next);
        onChange(data[0].display_name, next);
        setQuery(data[0].display_name);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  // Reverse geocode (coords -> address)
  const reverseGeocode = useCallback(async (c: LatLng) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}`,
        { headers: { Accept: "application/json" } },
      );
      const data: { display_name?: string } = await res.json();
      const addr = data.display_name ?? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
      setQuery(addr);
      onChange(addr, c);
    } catch {
      setQuery(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
      onChange(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`, c);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const handleInputChange = (v: string) => {
    setQuery(v);
    onChange(v, coords ?? undefined);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => forwardGeocode(v), 700);
  };

  const handleMapPick = (c: LatLng) => {
    setCoords(c);
    reverseGeocode(c);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search for a venue or click the map"
            className="h-11 rounded-xl pl-10 pr-10"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{ height: 320 }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handleMapPick} />
          <RecenterMap coords={coords} />
          {coords && <Marker position={[coords.lat, coords.lng]} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: type an address or click anywhere on the map to set the location.
      </p>
    </div>
  );
}
