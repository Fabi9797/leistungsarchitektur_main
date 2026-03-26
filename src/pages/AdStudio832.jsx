import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone } from "lucide-react";
import AdGenerator from "../components/adstudio/AdGenerator";
import AdScriptList from "../components/adstudio/AdScriptList";

export default function AdStudio832() {
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);

  const loadAds = async () => {
    setLoadingAds(true);
    const data = await base44.entities.AdScript.list("-created_date");
    setAds(data);
    setLoadingAds(false);
  };

  useEffect(() => {
    loadAds();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#00416A]">Ad Studio</h1>
          <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Instagram · Werbeanzeigen Generierung</p>
        </div>

        <AdGenerator onSaved={loadAds} />

        {/* Saved ads */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#00416A]">Gespeicherte Ads</h2>
            {ads.length > 0 && (
              <span className="text-xs text-black/30 font-semibold">{ads.length} Ads</span>
            )}
          </div>
          {loadingAds ? (
            <p className="text-center py-10 text-black/25 text-sm">Laden...</p>
          ) : (
            <AdScriptList ads={ads} onRefresh={loadAds} />
          )}
        </div>
      </div>
    </div>
  );
}