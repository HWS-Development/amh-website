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

const GooglePlaceMap = ({ position, query, fallbackQuery, title }) => {
  const containerRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const latitude = Number(position?.[0]);
  const longitude = Number(position?.[1]);
  const fallbackMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery || query)}&z=14&output=embed`;

  useEffect(() => {
    if (apiKey) return;

    let disposed = false;
    fetch("/api/config")
      .then((response) => response.ok ? response.json() : null)
      .then((config) => {
        if (!disposed && config?.googleMapsApiKey) setApiKey(config.googleMapsApiKey);
      })
      .catch(() => {});

    return () => {
      disposed = true;
    };
  }, [apiKey]);

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
          zoom: hasPosition ? 15 : 9,
          minZoom: 9,
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
          const center = typeof location.toJSON === "function" ? location.toJSON() : location;
          marker = new maps.Marker({ map, position: location, title });
          map.setCenter(location);
          map.setZoom(15);
          map.setOptions({
            restriction: {
              latLngBounds: {
                north: center.lat + 1.5,
                south: center.lat - 1.5,
                east: center.lng + 1.5,
                west: center.lng - 1.5,
              },
              strictBounds: true,
            },
          });
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
      <iframe
        title={title}
        src={fallbackMapUrl}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return <div ref={containerRef} className="h-full w-full" role="region" aria-label={title} />;
};

export default GooglePlaceMap;
