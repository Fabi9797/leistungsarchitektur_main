import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Mic, Check, Loader2, Save, User, ChevronDown, ChevronUp } from "lucide-react";

const DEFAULT = {
  headline: "Warum ich das mache",
  text_1: "",
  text_2: "",
  text_3: "",
  text_4: "",
  foto_url: "",
  voice_url: "",
  voice_label: "Persönliche Nachricht von Fabian",
  years_experience: "+14",
  studio_link_text: "FITTER in Bad Harzburg",
  studio_link_url: "https://fitter.jetzt/badharzburg/",
};

function Field({ label, value, onChange, textarea, placeholder }) {
  const cls = "w-full bg-[#0f0f0f] text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-amber-400/50 placeholder-white/20 resize-none";
  return (
    <div>
      <p className="text-white/40 text-xs mb-1 font-medium">{label}</p>
      {textarea
        ? <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} rows={3} />
        : <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

export default function AboutSectionAdmin() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {
    base44.entities.CoachProfile.list().then(list => {
      if (list && list.length > 0) {
        setProfile(list[0]);
        setDraft({ ...DEFAULT, ...list[0] });
      }
    });
  }, []);

  const set = (field, value) => setDraft(d => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    if (profile) {
      await base44.entities.CoachProfile.update(profile.id, draft);
    } else {
      const created = await base44.entities.CoachProfile.create(draft);
      setProfile(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const uploadVoice = async (file) => {
    if (!file) return;
    setUploadingVoice(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("voice_url", file_url);
    setUploadingVoice(false);
  };

  const uploadFoto = async (file) => {
    if (!file) return;
    setUploadingFoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("foto_url", file_url);
    setUploadingFoto(false);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#00416A]/30">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className="w-12 h-12 rounded-full bg-[#00416A]/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-[#00416A]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Über Mich – Startseite</p>
          <p className="text-white/40 text-xs">Texte, Foto & persönliche Audio-Nachricht</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-green-400 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Gespeichert</span>}
          {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-4">
          {/* Texte */}
          <Field label="Überschrift" value={draft.headline} onChange={v => set("headline", v)} placeholder="Warum ich das mache" />
          <Field label="Absatz 1" value={draft.text_1} onChange={v => set("text_1", v)} textarea placeholder="Erster Absatz..." />
          <Field label="Absatz 2" value={draft.text_2} onChange={v => set("text_2", v)} textarea placeholder="Zweiter Absatz..." />
          <Field label="Absatz 3" value={draft.text_3} onChange={v => set("text_3", v)} textarea placeholder="Dritter Absatz..." />
          <Field label="Absatz 4" value={draft.text_4} onChange={v => set("text_4", v)} textarea placeholder="Vierter Absatz..." />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Studio-Link Text" value={draft.studio_link_text} onChange={v => set("studio_link_text", v)} placeholder="FITTER in Bad Harzburg" />
            <Field label="Studio-Link URL" value={draft.studio_link_url} onChange={v => set("studio_link_url", v)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Erfahrungs-Badge (z.B. +14)" value={draft.years_experience} onChange={v => set("years_experience", v)} />
            <Field label="Audio-Label" value={draft.voice_label} onChange={v => set("voice_label", v)} />
          </div>

          {/* Foto Upload */}
          <div>
            <p className="text-white/40 text-xs mb-2 font-medium">Profilfoto</p>
            <div className="flex gap-2 items-center">
              <input type="text" value={draft.foto_url || ""} onChange={e => set("foto_url", e.target.value)}
                placeholder="https://... oder Datei hochladen"
                className="flex-1 bg-[#0f0f0f] text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-amber-400/50 placeholder-white/20" />
              <label className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs font-medium transition-colors
                ${uploadingFoto ? "border-amber-400/30 text-amber-400/50" : "border-white/20 text-white/40 hover:border-amber-400/40 hover:text-amber-400"}`}>
                {uploadingFoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploadingFoto}
                  onChange={e => uploadFoto(e.target.files[0])} />
              </label>
            </div>
            {draft.foto_url && (
              <img src={draft.foto_url} alt="Vorschau" className="mt-2 w-20 h-20 rounded-xl object-cover object-top border border-white/10" />
            )}
          </div>

          {/* Voice Upload */}
          <div>
            <p className="text-white/40 text-xs mb-2 font-medium">🎙️ Persönliche Audio-Nachricht</p>
            {draft.voice_url && (
              <audio controls src={draft.voice_url} className="w-full mb-2 rounded-lg" style={{ height: 36 }} />
            )}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm font-medium
              ${uploadingVoice ? "border-amber-400/30 text-amber-400/50" : "border-white/10 text-white/40 hover:border-amber-400/40 hover:text-amber-400"}`}>
              {uploadingVoice ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</>
                : <><Mic className="w-4 h-4" /> MP3 hochladen / ersetzen</>}
              <input type="file" accept="audio/*" className="hidden" disabled={uploadingVoice}
                onChange={e => uploadVoice(e.target.files[0])} />
            </label>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00416A] hover:bg-[#003356] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Änderungen speichern
          </button>
        </div>
      )}
    </div>
  );
}