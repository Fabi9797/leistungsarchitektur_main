import React from "react";

const TYPE_COLORS = {
  "Reden": "bg-blue-100 text-blue-700",
  "B-Roll": "bg-orange-100 text-orange-700",
  "Slideshow": "bg-purple-100 text-purple-700",
  "Reel": "bg-pink-100 text-pink-700",
  "Story": "bg-yellow-100 text-yellow-700",
  "Carousel": "bg-indigo-100 text-indigo-700",
};

const CAT_COLORS = {
  "Training": "bg-red-100 text-red-700",
  "Ernährung": "bg-green-100 text-green-700",
  "Supplements": "bg-violet-100 text-violet-700",
  "Steuerung": "bg-slate-100 text-slate-700",
};

const STATUS_COLORS = {
  "Idee": "bg-gray-100 text-gray-500",
  "In Planung": "bg-blue-50 text-blue-500",
  "Gedreht": "bg-yellow-50 text-yellow-600",
  "Geschnitten": "bg-orange-50 text-orange-600",
  "Veröffentlicht": "bg-green-100 text-green-700",
};

export function TypeBadge({ type }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[type] || "bg-gray-100 text-gray-500"}`}>
      {type}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[category] || "bg-gray-100 text-gray-500"}`}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}