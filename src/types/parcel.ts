// src/types/parcel.ts

export type Parcel = Record<string, any> & {
  id?: number;
  county?: string;

  address?: string;
  city?: string;
  state?: string;
  zip?: string;

  price?: number;
  size?: number;

  // 어떤 데이터는 latitude/longitude가 number가 아닐 수도 있어서 optional + any로 둠
  latitude?: any;
  longitude?: any;
  lat?: any;
  lng?: any;
  lon?: any;
};

/**
 * 다양한 필드명(latitude/longitude, lat/lng 등)을 지원하고
 * 뒤집힌 좌표도 자동 복구해서 {lat,lng} 반환
 */
export function getLatLng(p: Parcel): { lat: number; lng: number } | null {
  const candidates = [
    { lat: p.latitude, lng: p.longitude },
    { lat: p.lat, lng: p.lng },
    { lat: p.lat, lng: p.lon },
    { lat: p.Latitude, lng: p.Longitude },
    { lat: p.LATITUDE, lng: p.LONGITUDE },
    { lat: p.y, lng: p.x }, // 혹시 x/y로 오는 케이스
  ];

  for (const c of candidates) {
    const lat = toNum(c.lat);
    const lng = toNum(c.lng);
    if (lat == null || lng == null) continue;

    // 정상
    if (isValidLatLng(lat, lng)) return { lat, lng };
    // 뒤집힘 보정
    if (isValidLatLng(lng, lat)) return { lat: lng, lng: lat };
  }

  return null;
}

function toNum(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : null;
}

function isValidLatLng(lat: number, lng: number) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
