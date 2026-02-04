const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(
  path: string,
  body: any,
  params?: Record<string, any>
): Promise<T> {
  const url = new URL(path, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return (await res.json()) as T;
}
