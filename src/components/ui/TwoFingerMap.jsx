import React, { useEffect, useRef, useState } from 'react';
import { MapContainer } from 'react-leaflet';

/**
 * Wrapper around react-leaflet `MapContainer` that, on touch devices,
 * requires two fingers to pan the map (so single-finger page scroll keeps
 * working through the map area). Mouse / trackpad behaviour is unchanged.
 *
 * Displays a short hint overlay when the user touches with one finger.
 *
 * Props are forwarded to `MapContainer`. Children are rendered inside.
 */
export default function TwoFingerMap({ children, ...mapProps }) {
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);
  const hintTimerRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(typeof window !== 'undefined' && 'ontouchstart' in window);
  }, []);

  // Toggle dragging based on touch count
  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap || !isTouchDevice) return;

    const onTouchStart = (e) => {
      const map = mapRef.current;
      if (!map) return;
      if (e.touches.length >= 2) {
        map.dragging?.enable();
        setShowHint(false);
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      } else {
        map.dragging?.disable();
        setShowHint(true);
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
        hintTimerRef.current = setTimeout(() => setShowHint(false), 1400);
      }
    };

    const onTouchEnd = () => {
      const map = mapRef.current;
      if (!map) return;
      // Always reset to disabled after touch sequence ends; next two-finger
      // touchstart will re-enable.
      map.dragging?.disable();
    };

    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchend', onTouchEnd);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [isTouchDevice]);

  // Disable dragging at mount on touch devices
  const handleMapCreate = (map) => {
    mapRef.current = map;
    if (isTouchDevice) map.dragging?.disable();
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <MapContainer
        {...mapProps}
        whenCreated={handleMapCreate}
        ref={(instance) => {
          // react-leaflet v4: the ref is the map instance directly
          if (instance && !mapRef.current) handleMapCreate(instance);
        }}
      >
        {children}
      </MapContainer>

      {/* Hint overlay — only visible briefly on single-finger touch */}
      {isTouchDevice && (
        <div
          className={`pointer-events-none absolute inset-0 z-[400] flex items-center justify-center transition-opacity duration-200 ${
            showHint ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-black/60 text-white text-xs font-montserrat tracking-wide px-4 py-2 rounded-full">
            Utilisez deux doigts pour déplacer la carte
          </div>
        </div>
      )}
    </div>
  );
}
