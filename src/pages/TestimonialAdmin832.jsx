import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Mic, Check, Loader2 } from "lucide-react";

const NAMES = ["Frederick", "Alex", "Shayan"];

export default function TestimonialAdmin832() {
  const [records, setRecords] = useState({});
  const [uploading, setUploading] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    base44.entities.TestimonialAudio.list().then(list => {
      const map = {};
      list.forEach(r => { map[r.name] = r; });
      setRecords(map);
    });
  }, []);

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
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-1">Testimonial Audios</h1>
          <p className="text-white/40 text-sm">MP3-Dateien für die Kundenstimmen auf der Website hochladen.</p>
        </div>

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