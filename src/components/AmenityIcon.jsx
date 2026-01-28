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
} from "lucide-react";
import { normalizeText } from "@/lib/amenities";

const AmenityIcon = ({ label = "", className = "w-4 h-4" }) => {
  const n = normalizeText(label);

  if (n.includes("wifi") || n.includes("internet")) return <Wifi className={className} />;
  if (n.includes("piscine") || n.includes("pool")) return <Waves className={className} />;
  if (n.includes("spa") || n.includes("hammam")) return <Bath className={className} />;
  if (n.includes("terrasse") || n.includes("roof") || n.includes("solarium")) return <Sun className={className} />;
  if (n.includes("clim")) return <Wind className={className} />;
  if (n.includes("famille") || n.includes("family")) return <Users className={className} />;
  if (n.includes("restaurant") || n.includes("hotes")) return <Utensils className={className} />;
  if (n.includes("tv") || n.includes("television")) return <Tv className={className} />;
  if (n.includes("video") || n.includes("surveillance")) return <Shield className={className} />;
  if (n.includes("bebe") || n.includes("baby")) return <Baby className={className} />;

  return <Star className={className} />;
};

export default AmenityIcon;
