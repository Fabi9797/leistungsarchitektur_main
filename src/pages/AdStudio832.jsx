import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Users } from "lucide-react";
import AdGenerator from "../components/adstudio/AdGenerator";
import AdScriptList from "../components/adstudio/AdScriptList";
import TestimonialManager from "../components/adstudio/TestimonialManager";

export default function AdStudio832() {
  const [tab, setTab] = useState("studio"); // "studio" | "testimonials"
  const [ads, setAds] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);

  const loadAds = async () => {
    setLoadingAds(true);
    const data = await base44.entities.AdScript.list("-created_date");
    setAds(data);
    setLoadingAds(false);
  };

  const loadTestimonials = async () => {
    const data = await base44.entities.Testimonial.list("-created_date");
    setTestimonials(data);
  };

  useEffect(() => {
    loadAds();
    loadTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#00416A]">Ad Studio</h1>
          <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Instagram · Werbeanzeigen Generierung</p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1 bg-black/5 rounded-xl p-1 w-fit mb-8">
          <button onClick={() => setTab("studio")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "studio" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}>
            <Megaphone className="w-4 h-4" /> Ad Studio
          </button>
          <button onClick={() => setTab("testimonials")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "testimonials" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}>
            <Users className="w-4 h-4" /> Testimonials
            {testimonials.length > 0 && (
              <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#00416A]/10 text-[#00416A]">{testimonials.length}</span>
            )}
          </button>
        </div>

        {tab === "studio" && (
          <>
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
          </>
        )}

        {tab === "testimonials" && (
          <div className="bg-[#F0EAD6]/50 rounded-2xl p-1">
            <TestimonialManager testimonials={testimonials} onRefresh={loadTestimonials} />
          </div>
        )}
      </div>
    </div>
  );
}