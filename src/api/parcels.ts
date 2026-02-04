import type { Filters } from "../types/filter";
import type { Parcel } from "../types/parcel";

export async function fetchParcels(
  filters: Filters & { limit?: number },
  token?: string
): Promise<Parcel[]> {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const url = new URL("/parcels", base);

  // query params (filters)
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  const res = await fetch(url.toString(), {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load parcels (${res.status}) ${text}`);
  }

  const json = await res.json();

  const parcels: Parcel[] = Array.isArray(json)
    ? json
    : (json?.data ?? []);

  return parcels;
}

/**
 * Generate CSV export URL
 */
export function buildExportCsvUrl(
  filters: Filters,
  token?: string
): string {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const url = new URL("/parcels/export.csv", base);

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}
