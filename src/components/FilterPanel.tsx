import { useState } from "react";
import type { Filters } from "../types/filter";
import { buildExportCsvUrl } from "../api/parcels";
import { downloadUrl } from "../utils/download";

type Props = {
  value: Filters;
  onChange: (v: Filters) => void;
  onApply: () => void;
  onSave?: () => Promise<void> | void;
  onLoad?: () => Promise<void> | void;
  loading?: boolean;
  
  token?: string;
};

function toNum(v: string): number | undefined {
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function FilterPanel({
  value,
  onChange,
  onApply,
  onSave,
  onLoad,
  loading,
  token,
}: Props) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const exportCsv = () => {
    const url = buildExportCsvUrl(value, token);
    downloadUrl(url, `parcels_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleSaveClick = async () => {
    if (!onSave) return;
    setBusy(true);
    setMsg("");
    try {
      await onSave();
      setMsg("Saved.");
    } catch (e: any) {
      setMsg(e?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleLoadClick = async () => {
    if (!onLoad) return;
    setBusy(true);
    setMsg("");
    try {
      await onLoad();
      setMsg("Loaded.");
    } catch (e: any) {
      setMsg(e?.message ?? "Load failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 800 }}>Filters</div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12 }}>Min Price</span>
        <input
          value={value.minPrice ?? ""}
          onChange={(e) => onChange({ ...value, minPrice: toNum(e.target.value) })}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12 }}>Max Price</span>
        <input
          value={value.maxPrice ?? ""}
          onChange={(e) => onChange({ ...value, maxPrice: toNum(e.target.value) })}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12 }}>Min Sqft</span>
        <input
          value={value.minSqft ?? ""}
          onChange={(e) => onChange({ ...value, minSqft: toNum(e.target.value) })}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12 }}>Max Sqft</span>
        <input
          value={value.maxSqft ?? ""}
          onChange={(e) => onChange({ ...value, maxSqft: toNum(e.target.value) })}
        />
      </label>

      <button onClick={onApply} disabled={!!loading || busy}>
        {loading ? "Loading..." : "Apply"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={handleSaveClick} disabled={busy || !onSave}>
          Save
        </button>
        <button onClick={handleLoadClick} disabled={busy || !onLoad}>
          Load
        </button>
      </div>

      <button onClick={exportCsv}>Export CSV</button>

      {msg && <div style={{ fontSize: 12, opacity: 0.8 }}>{msg}</div>}
    </div>
  );
}
