import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Mic, Check, Loader2, Link2 } from "lucide-react";

const NAMES = ["Frederick", "Alex", "Shayan"];

export default function TestimonialAdmin832() {
  const [records, setRecords] = useState({});
  const [uploading, setUploading] = useState({});
  const [saved, setSaved] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [igHandles, setIgHandles] = useState({});
  const [igSaving, setIgSaving] = useState({});

  useEffect(() => {
    base44.entities.TestimonialAudio.list().then(list => {
      const map = {};
      list.forEach(r => { map[r.name] = r; });
      setRecords(map);
    });

    base44.entities.Testimonial.list().then(list => {
      setTestimonials(list || []);
      const handles = {};
      (list || []).forEach(t => {
        if (t.client_name && t.instagram_handle) handles[t.client_name] = t.instagram_handle;
      });
      setIgHandles(handles);
    });
  }, []);

  const saveIgHandle = async (name, handle) => {
    setIgSaving(s => ({ ...s, [name]: true }));
    const testimonial = testimonials.find(t => t.client_name === name);
    if (testimonial) {
      await base44.entities.Testimonial.update(testimonial.id, { instagram_handle: handle });
    }
    setIgSaving(s => ({ ...s, [name]: false }));
    setSaved(s => ({ ...s, [`ig_${name}`]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [`ig_${name}`]: false })), 2000);
  };

  const handleUpload = async (name, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [name]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = records[name];
      let updated;
      if (existing) {
        updated = await base44.entities.TestimonialAudio.update(existing.id, { audio_url: file_url });
      } else {
        updated = await base44.entities.TestimonialAudio.create({ name, audio_url: file_url });
      }
      setRecords(r => ({ ...r, [name]: updated }));
      setSaved(s => ({ ...s, [name]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [name]: false })), 2000);
    } finally {
      setUploading(u => ({ ...u, [name]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Testimonial Audios</h1>
            <p className="text-white/40 text-sm">MP3-Dateien für die Kundenstimmen auf der Website hochladen.</p>
          </div>
          <button
            onClick={() => setShowMapping(!showMapping)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Zuordnungen
          </button>
        </div>

        {showMapping && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Zuordnungen zu Startseite</h2>
            <p className="text-white/40 text-sm mb-4">Wähle ein Testimonial für jeden Namen auf der Startseite:</p>
            <div className="space-y-3">
              {NAMES.map(name => (
                <div key={name} className="bg-[#1a1a1a] rounded-lg p-4 border border-white/5">
                  <p className="text-white/60 text-sm mb-2">{name}</p>
                  <select
                    value={
                      testimonials.find(t => t.client_name === name)?.id || ""
                    }
                    onChange={e => {
                      const testId = e.target.value;
                      if (!testId) return;
                      const testimonial = testimonials.find(t => t.id === testId);
                      if (testimonial && testimonial.client_name !== name) {
                        base44.entities.Testimonial.update(testId, { client_name: name }).then(() => {
                          base44.entities.Testimonial.list().then(list => {
                            setTestimonials(list);
                          });
                        });
                      }
                    }}
                    className="w-full bg-[#0f0f0f] text-white border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">– Kein Testimonial –</option>
                    {testimonials.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.client_name || "(Namenlos)"} {t.id === testimonials.find(x => x.client_name === name)?.id ? "✓" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
           {NAMES.map(name => {
            const rec = records[name];
            const isUploading = uploading[name];
            const isSaved = saved[name];
            return (
              <div key={name} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{name}</p>
                      <p className="text-white/30 text-xs">
                        {rec?.audio_url ? "Audio vorhanden ✓" : "Noch kein Audio"}
                      </p>
                    </div>
                  </div>
                  {isSaved && (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <Check className="w-3 h-3" /> Gespeichert
                    </span>
                  )}
                </div>

                {/* Instagram Handle */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.4" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={igHandles[name] || ""}
                      onChange={e => setIgHandles(h => ({ ...h, [name]: e.target.value }))}
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
                    />
                  </div>
                  <button
                    onClick={() => saveIgHandle(name, igHandles[name] || "")}
                    disabled={igSaving[name]}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                  >
                    {igSaving[name] ? <Loader2 className="w-3 h-3 animate-spin" /> : saved[`ig_${name}`] ? <Check className="w-3 h-3 text-green-400" /> : "Speichern"}
                  </button>
                </div>

                {rec?.audio_url && (
                  <audio controls src={rec.audio_url} className="w-full mb-4 rounded-lg" style={{ height: 36 }} />
                )}

                <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm font-medium
                  ${isUploading ? "border-amber-400/30 text-amber-400/50" : "border-white/10 text-white/40 hover:border-amber-400/40 hover:text-amber-400"}`}>
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> MP3 hochladen</>
                  )}
                  <input type="file" accept="audio/mp3,audio/*" className="hidden"
                    disabled={isUploading}
                    onChange={e => handleUpload(name, e.target.files[0])} />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}