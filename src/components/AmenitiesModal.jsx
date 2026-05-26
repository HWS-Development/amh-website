import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, Grid3X3 } from "lucide-react";
import AmenityIcon from "@/components/AmenityIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import gsap from "gsap";
import { gsapEase, duration as MD } from "@/lib/motion";

const AmenitiesModal = ({
  open,
  onOpenChange,
  amenities = [],
  riadName = "",
}) => {
  const { t } = useLanguage();
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const tl = gsap.timeline();
    if (backdropRef.current) {
      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: MD.fast, ease: gsapEase.silk },
        0
      );
    }
    if (panelRef.current) {
      tl.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: MD.slow, ease: gsapEase.editorial },
        0.05
      );
    }
    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll("[data-amenity-item]");
      if (items.length) {
        tl.from(
          items,
          {
            opacity: 0,
            y: 12,
            duration: 0.35,
            stagger: 0.025,
            ease: gsapEase.silk,
          },
          0.25
        );
      }
    }
    return () => tl.kill();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return amenities;
    return amenities.filter((a) => a && a.toLowerCase().includes(q));
  }, [amenities, query]);

  const sorted = useMemo(() => {
    return filtered
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [filtered]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="amenities-modal-title"
    >
      <div
        ref={backdropRef}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-brand-ink/70 backdrop-blur-sm"
        aria-hidden
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="shrink-0 px-6 md:px-10 pt-6 md:pt-8 pb-5 border-b border-brand-ink/8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-brand-action" />
                <span className="font-montserrat uppercase tracking-[0.32em] text-[0.6rem] text-brand-action font-semibold">
                  {t("amenities")}
                </span>
              </div>
              <h2
                id="amenities-modal-title"
                className="mt-2 font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-tight tracking-tight text-brand-ink"
              >
                {t("allAmenities") || "All amenities"}
              </h2>
              {riadName && (
                <p className="mt-1 font-montserrat text-[0.75rem] text-brand-ink/45">
                  {riadName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-brand-beige">
                <Grid3X3 className="w-3 h-3 text-brand-action" />
                <span className="font-montserrat text-[0.65rem] font-semibold text-brand-ink/60 tracking-wide">
                  {filtered.length}{query ? ` / ${amenities.length}` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label={t("close") || "Close"}
                className="w-9 h-9 grid place-items-center text-brand-ink/40 hover:text-brand-action hover:bg-brand-ink/5 transition-all duration-300 rounded-full"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {amenities.length > 6 && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-brand-ink/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchAmenities") || "Search amenities..."}
                className="w-full pl-9 pr-3 py-2.5 bg-brand-beige/50 border-0 text-sm text-brand-ink placeholder-brand-ink/35 focus:outline-none focus:ring-1 focus:ring-brand-action/30 transition-all font-montserrat"
              />
            </div>
          )}
        </div>

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8"
        >
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="font-display italic text-brand-ink/20 text-4xl">—</span>
              <p className="mt-3 font-montserrat text-sm text-brand-ink/45">
                {query
                  ? t("noAmenitiesMatch") || "No amenities match your search."
                  : t("noAmenities") || "No amenities listed."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
              {sorted.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  data-amenity-item
                  className="flex items-center gap-3 py-2.5 border-b border-brand-ink/5 last:border-0"
                >
                  <span className="shrink-0 w-8 h-8 grid place-items-center bg-brand-beige/70 text-brand-action">
                    <AmenityIcon label={label} className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-montserrat text-[0.82rem] text-brand-ink/75 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 md:px-10 py-4 border-t border-brand-ink/8 bg-brand-beige/30 flex items-center justify-between gap-4">
          <span className="font-montserrat text-[0.65rem] uppercase tracking-[0.2em] text-brand-ink/40">
            {amenities.length} {t("amenitiesCount") || "amenities"}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-2 bg-brand-ink text-white px-5 py-2.5 font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.25em] hover:bg-brand-action transition-all duration-500"
          >
            <Check className="w-3 h-3" />
            {t("close") || "Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AmenitiesModal;
