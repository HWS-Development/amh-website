import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";

export default function PropertySearchModal({ open, onClose, riads, locale = "fr" }) {
  const norm = (s) => (s || "")
  .normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const data = useMemo(() => riads.map(r => ({
    ...r,
    // fallback chain + normalization for search
    searchName: norm(r?.name_tr?.[locale] || r?.name_tr?.en || r?.name_tr?.fr || r?.name),
  })), [riads, locale]);

  const fuse = useMemo(() => new Fuse(data, {
    threshold: 0.28,
    ignoreLocation: true,
    keys: ["searchName", "city", "quartier"],
  }), [data]);

  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef(null);

  const results = q.trim()
    ? fuse.search(q).slice(0, 20).map(r => r.item)
    : riads.slice(0, 12);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 10); }, [open]);
  useEffect(() => { setI(0); }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setI(x => Math.min(x + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setI(x => Math.max(x - 1, 0)); }
      if (e.key === "Enter" && results[i]) window.location.href = `/riads/${results[i].id}`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, i, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center h-screen">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[720px] max-w-[92vw] rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-3 rounded-xl border px-3">
          <svg className="h-5 w-5 opacity-60" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="1.5"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un riad, ville, quartier…"
            className="h-12 w-full bg-transparent outline-none"
          />
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-black">Esc</button>
        </div>

        <ul className="mt-4 max-h-[60vh] space-y-3 overflow-auto">
          {results.map((r, idx) => (
            <li
              key={r.id}
              onMouseEnter={() => setI(idx)}
              onClick={() => (window.location.href = `/riad/${r.id}`)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${i===idx ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
            >
              <img src={r.image_urls?.[0]} alt="" className="h-14 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                {/* <div className="truncate font-semibold">{r.name}</div> */}
                <div className="truncate font-semibold">{r?.name_tr?.[locale] || r?.name_tr?.en || r?.name_tr?.fr || r?.name || ""}</div>
                <div className="truncate text-sm text-neutral-500">{r.city} · {r.quartier}</div>
              </div>
              <span className="rounded-lg bg-black px-3 py-1.5 text-xs text-white">Ouvrir</span>
            </li>
          ))}
          {q && results.length === 0 && (
            <li className="rounded-xl border p-6 text-center text-neutral-500">Aucun résultat</li>
          )}
        </ul>
      </div>
    </div>
  );
}
