import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

import MapView from "./components/MapView";
import FilterPanel from "./components/FilterPanel";
import type { Filters } from "./types/filter";
import type { Parcel } from "./types/parcel";
import { fetchParcels } from "./api/parcels";
import { saveFilters, loadFilters } from "./api/savedFilters";

export default function Home() {
  const auth = useAuth();

  const [filters, setFilters] = useState<Filters>({});
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const token = auth.user?.access_token;

  /** login user ID (Cognito sub) */
  const getUserId = () => {
    const sub = auth.user?.profile?.sub;
    return sub ? String(sub) : "";
  };

  /** Logout: remove local section + Cognito Hosted UI logout */
  const handleLogout = async () => {
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN as string;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string;
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI as string;

    // 1) react-oidc-context remove local session
    await auth.removeUser();

    // 2) Cognito move to /logout
    const u = new URL("/logout", cognitoDomain);
    u.searchParams.set("client_id", clientId);
    u.searchParams.set("logout_uri", logoutUri);

    window.location.assign(u.toString());
  };

  /** parcels load */
  const load = async (f: Filters) => {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchParcels({ ...f, limit: 2000 }, token);
      setParcels(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  /** Filter Save */
  const handleSave = async () => {
    const userId = getUserId();

    // guest → localStorage
    if (!userId) {
      localStorage.setItem("savedFilters_guest", JSON.stringify(filters));
      return;
    }

    await saveFilters(userId, filters);
  };

  /** Filter Load */
  const handleLoad = async () => {
    const userId = getUserId();

    // guest → localStorage
    if (!userId) {
      const raw = localStorage.getItem("savedFilters_guest");
      const loaded = raw ? JSON.parse(raw) : {};
      setFilters(loaded);
      await load(loaded);
      return;
    }

    const loaded = await loadFilters(userId);
    setFilters(loaded);
    await load(loaded);
  };

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "320px 1fr" }}>
      {/* LEFT PANEL */}
      <div style={{ padding: 16, borderRight: "1px solid rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>DFW Parcel Explorer</div>

          {auth.isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12 }}>{auth.user?.profile?.email}</div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button onClick={() => auth.signinRedirect()}>Login</button>
          )}
        </div>

        <FilterPanel
          value={filters}
          onChange={setFilters}
          onApply={() => load(filters)}
          onSave={handleSave}
          onLoad={handleLoad}
          loading={loading}
          token={token}   
        />

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          Points: {parcels.length.toLocaleString()}
        </div>

        {err && <div style={{ marginTop: 10, color: "crimson", fontSize: 12 }}>{err}</div>}
      </div>

      {/* MAP */}
      <div style={{ position: "relative", height: "100%", minWidth: 600, overflow: "hidden" }}>
        <MapView parcels={parcels} />
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "white",
              padding: "6px 10px",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
