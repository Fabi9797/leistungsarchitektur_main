import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Paperclip, Upload, Trash2, ExternalLink, Loader2, FileText } from "lucide-react";

export default function ClientDocuments({ client, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const docs = client.documents || [];

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newDoc = {
      name: file.name,
      url: file_url,
      type: file.type,
      uploaded_at: new Date().toISOString(),
    };
    const updated = [...docs, newDoc];
    await base44.entities.ClientProfile.update(client.id, { documents: updated });
    onUpdate();
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(idx) {
    const updated = docs.filter((_, i) => i !== idx);
    await base44.entities.ClientProfile.update(client.id, { documents: updated });
    onUpdate();
  }

  return (
    <div className="mt-3 border-t border-black/5 pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-1">
          <Paperclip className="w-3 h-3" /> Dokumente ({docs.length})
        </p>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00416A]/8 hover:bg-[#00416A]/15 text-[#00416A] rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? "Hochladen…" : "Hochladen"}
          </button>
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="text-xs text-black/25 italic">Noch keine Dokumente.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#F0EAD6]/80 border border-black/8 rounded-lg px-3 py-1.5 text-xs">
              <FileText className="w-3 h-3 text-[#00416A] flex-shrink-0" />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00416A] font-medium hover:underline max-w-[160px] truncate"
              >
                {doc.name}
              </a>
              <ExternalLink className="w-3 h-3 text-black/25 flex-shrink-0" />
              <button onClick={() => handleDelete(i)} className="text-black/25 hover:text-red-500 transition ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}