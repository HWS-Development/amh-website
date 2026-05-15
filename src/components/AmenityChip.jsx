import {
  Sun,
  Snowflake,
  Bath,
  ShowerHead,
  Star,
} from "lucide-react";

const iconMap = (label = "") => {
  const l = label.toLowerCase();

  if (l.includes("terrasse")) return Sun;
  if (l.includes("clim")) return Snowflake;
  if (l.includes("bain")) return Bath;
  if (l.includes("douche")) return ShowerHead;

  return Star;
};

const AmenityChip = ({ label }) => {
  const Icon = iconMap(label);

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs uppercase font-medium bg-gray-100 border border-gray-200 text-gray-800">
      <Icon className="w-4 h-4 text-gray-600" />
      {label}
    </span>
  );
};

export default AmenityChip;
