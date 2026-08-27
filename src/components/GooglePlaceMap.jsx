import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-javascript-api";
let googleMapsPromise;

const loadGoogleMaps = (apiKey) => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google.maps), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&region=MA`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

const GooglePlaceMap = ({ position, query, title, mapsUrl }) => {
  const containerRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const latitude = Number(position?.[0]);
  const longitude = Number(position?.[1]);

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let disposed = false;
    let marker;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (disposed || !containerRef.current) return;

        const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);
        const initialCenter = hasPosition
          ? { lat: latitude, lng: longitude }
          : { lat: 31.7917, lng: -7.0926 };
        const map = new maps.Map(containerRef.current, {
          center: initialCenter,
          zoom: hasPosition ? 15 : 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        const setMarker = (location) => {
          marker = new maps.Marker({ map, position: location, title });
          map.setCenter(location);
          map.setZoom(15);
        };

        if (hasPosition) {
          setMarker(initialCenter);
          return;
        }

        new maps.Geocoder().geocode({ address: query, region: "MA" }, (results, status) => {
          if (disposed) return;
          if (status === "OK" && results?.[0]) {
            setMarker(results[0].geometry.location);
          } else {
            setHasError(true);
          }
        });
      })
      .catch(() => {
        if (!disposed) setHasError(true);
      });

    return () => {
      disposed = true;
      marker?.setMap(null);
    };
  }, [apiKey, latitude, longitude, query, title]);

  if (!apiKey || hasError) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-full items-center justify-center bg-brand-beige/30 px-8 text-center font-montserrat text-sm text-brand-ink/60 transition-colors hover:bg-brand-beige/50"
      >
        {title}
      </a>
    );
  }

  return <div ref={containerRef} className="h-full w-full" role="region" aria-label={title} />;
};

export default GooglePlaceMap;
