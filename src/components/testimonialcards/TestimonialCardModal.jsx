import React, { useRef, useState } from "react";
import { X, Download, FileImage } from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function TestimonialCardModal({ testimonial, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#F0EAD6",
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `testimonial-${testimonial.client_name?.replace(/\s+/g,"-") || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("PNG-Download fehlgeschlagen: " + e.message);
    }
    setDownloading(false);
  };

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#F0EAD6",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pxToMm = (px) => (px * 25.4) / 96;
      const w = pxToMm(canvas.width / 2);
      const h = pxToMm(canvas.height / 2);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [w, h] });
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`testimonial-${testimonial.client_name?.replace(/\s+/g,"-") || "card"}.pdf`);
    } catch (e) {
      alert("PDF-Download fehlgeschlagen: " + e.message);
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative flex flex-col items-center gap-6 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition">
          <X className="w-4 h-4 text-black/50" />
        </button>

        {/* Card */}
        <div style={{ filter: "drop-shadow(0 8px 40px rgba(0,65,106,0.18))" }}>
          <TestimonialCard testimonial={testimonial} cardRef={cardRef} />
        </div>

        {/* Download buttons */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={downloadPNG}
            disabled={downloading}
            style={{
              background: "#00416A", color: "#fff",
              borderRadius: 12, padding: "14px 24px",
              border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <FileImage size={18} />
            {downloading ? "Wird erstellt..." : "Als PNG herunterladen"}
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            style={{
              background: "#fff", color: "#00416A",
              borderRadius: 12, padding: "14px 24px",
              border: "2px solid #00416A", cursor: "pointer",
              fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
              opacity: downloading ? 0.6 : 1,
            }}
          >
            <Download size={18} />
            Als PDF herunterladen
          </button>
        </div>
      </div>
    </div>
  );
}