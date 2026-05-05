import React from "react";
import {
  Wifi,
  Waves,
  Bath,
  Sun,
  Wind,
  Users,
  Utensils,
  Tv,
  Star,
  Shield,
  Baby,
  Coffee,
  Car,
  Key,
  Thermometer,
  Heart,
  Accessibility,
  Globe,
} from "lucide-react";
import { normalizeText } from "@/lib/amenities";

const AmenityIcon = ({ label = "", className = "w-4 h-4" }) => {
  const n = normalizeText(label);

  // universal, easily-recognizable mappings
  if (n.includes("wifi") || n.includes("internet")) return <Wifi className={className} />;
  if (n.includes("piscine") || n.includes("pool")) return <Waves className={className} />;
  if (n.includes("spa") || n.includes("hammam") || n.includes("jacuzzi")) return <Bath className={className} />;
  if (n.includes("terrasse") || n.includes("roof") || n.includes("rooftop") || n.includes("solarium")) return <Sun className={className} />;
  if (n.includes("clim") || n.includes("ac") || n.includes("air condition")) return <Wind className={className} />;
  if (n.includes("famille") || n.includes("family") || n.includes("kids") || n.includes("children")) return <Users className={className} />;
  if (n.includes("restaurant") || n.includes("hotes") || n.includes("dining") || n.includes("kitchen")) return <Utensils className={className} />;
  if (n.includes("tv") || n.includes("television") || n.includes("smart tv")) return <Tv className={className} />;
  if (n.includes("video") || n.includes("surveillance") || n.includes("cctv") || n.includes("security")) return <Shield className={className} />;
  if (n.includes("bebe") || n.includes("baby") || n.includes("crib") || n.includes("cot")) return <Baby className={className} />;

  if (n.includes("breakfast") || n.includes("petit") || n.includes("cafe") || n.includes("coffee")) return <Coffee className={className} />;
  if (n.includes("parking") || n.includes("garage") || n.includes("car")) return <Car className={className} />;
  if (n.includes("concierge") || n.includes("key") || n.includes("reception") || n.includes("front desk")) return <Key className={className} />;
  if (n.includes("chauffage") || n.includes("heating") || n.includes("therm")) return <Thermometer className={className} />;
  if (n.includes("romant") || n.includes("couple") || n.includes("honeymoon")) return <Heart className={className} />;
  if (n.includes("accessible") || n.includes("Accessibility") || n.includes("disabled")) return <Accessibility className={className} />;

  // fallback to globe to indicate generic amenity (international symbol)
  if (n.length > 0) return <Globe className={className} />;

  return <Star className={className} />;
};

export default AmenityIcon;
