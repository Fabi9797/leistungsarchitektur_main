import React from "react";
import { Download, Image, Type, Palette, Copy, Check } from "lucide-react";
import { useState } from "react";

const LOGO_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a128f5dab_ChatGPTImage19Marz202616_44_51.png";

const COLORS = [
  { name: "Indigo (Hauptfarbe)", hex: "#00416A", label: "text-white" },
  { name: "Eggshell", hex: "#F0EAD6", label: "text-black" },
  { name: "Weiß", hex: "#FFFFFF", label: "text-black border border-gray-200" },
  { name: "Schwarz", hex: "#000000", label: "text-white" },
];

const FONTS = [
  { name: "Inter Light", weight: "font-light", sample: "Leistungsarchitektur" },
  { name: "Inter Regular", weight: "font-normal", sample: "Leistungsarchitektur" },
  { name: "Inter Medium", weight: "font-medium", sample: "Leistungsarchitektur" },
  { name: "Inter SemiBold", weight: "font-semibold", sample: "Leistungsarchitektur" },
  { name: "Inter Bold", weight: "font-bold", sample: "Leistungsarchitektur" },
  { name: "Inter ExtraBold", weight: "font-extrabold", sample: "Leistungsarchitektur" },
];

const LOGOS = [
  {
    label: "Logo + Schriftzug",
    description: "Für Navbar, Dokumente, Präsentationen",
    preview: (
      <div className="flex items-center gap-3">
        <img src={LOGO_URL} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
        <div>
          <p className="text-xs font-bold tracking-widest text-[#00416A] leading-tight uppercase">LEISTUNGS</p>
          <p className="text-xs font-light tracking-widest text-[#00416A] leading-tight uppercase">ARCHITEKTUR</p>
        </div>
      </div>
    ),
    downloadUrl: LOGO_URL,
    filename: "leistungsarchitektur-logo-mit-schriftzug.png",
  },
  {
    label: "Logo (Icon only)",
    description: "Für Social Media Profilbild, Favicon",
    preview: (
      <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
    ),
    downloadUrl: LOGO_URL,
    filename: "leistungsarchitektur-logo.png",
  },
];

const SIGNATURE_LINES = [
  { label: "Name", value: "Leistungsarchitektur" },
  { label: "Website", value: "leistungsarchitektur.de" },
  { label: "Instagram", value: "@leistungsarchitektur" },
  { label: "E-Mail", value: "info@leistungsarchitektur.de" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#00416A]"
      title="Kopieren"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-[#00416A] flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#00416A] tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function BrandAssets832() {
  const downloadFile = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadLogoWithText = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");

    // Background white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw logo icon with rounded rect
      const iconSize = 120;
      const iconX = 30;
      const iconY = 30;
      const radius = 20;
      ctx.beginPath();
      ctx.moveTo(iconX + radius, iconY);
      ctx.lineTo(iconX + iconSize - radius, iconY);
      ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + radius);
      ctx.lineTo(iconX + iconSize, iconY + iconSize - radius);
      ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - radius, iconY + iconSize);
      ctx.lineTo(iconX + radius, iconY + iconSize);
      ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - radius);
      ctx.lineTo(iconX, iconY + radius);
      ctx.quadraticCurveTo(iconX, iconY, iconX + radius, iconY);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      ctx.restore();

      // Draw text
      ctx.fillStyle = "#00416A";
      ctx.font = "bold 36px Inter, Arial, sans-serif";
      ctx.letterSpacing = "8px";
      ctx.fillText("LEISTUNGS", 180, 80);
      ctx.font = "300 36px Inter, Arial, sans-serif";
      ctx.fillText("ARCHITEKTUR", 180, 125);

      // Download
      const link = document.createElement("a");
      link.download = "leistungsarchitektur-logo-mit-schriftzug.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = LOGO_URL;
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6]/30 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xs font-bold tracking-widest text-[#00416A] uppercase">LEISTUNGSARCHITEKTUR</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#00416A] tracking-tight mt-4">Brand Assets</h1>
          <p className="text-gray-500 mt-1">Alle Markenelemente, Farben und Logos auf einen Blick.</p>
        </div>

        {/* Logos */}
        <Section icon={Image} title="Logos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LOGOS.map((logo) => (
              <div key={logo.label} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex-1 flex items-center justify-center min-h-[80px]">
                  {logo.preview}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{logo.label}</p>
                  <p className="text-sm text-gray-400">{logo.description}</p>
                </div>
                <button
                  onClick={() => downloadFile(logo.downloadUrl, logo.filename)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Farben */}
        <Section icon={Palette} title="Corporate Identity – Farben">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COLORS.map((color) => (
              <div key={color.hex} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-20" style={{ backgroundColor: color.hex }} />
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800">{color.name}</p>
                  <div className="flex items-center mt-1">
                    <code className="text-xs text-gray-500 font-mono">{color.hex}</code>
                    <CopyButton text={color.hex} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Schriften */}
        <Section icon={Type} title="Typografie – Inter">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {FONTS.map((font) => (
              <div key={font.name} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{font.name}</p>
                  <p className={`text-lg text-[#00416A] ${font.weight}`}>{font.sample}</p>
                </div>
                <CopyButton text={font.name} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Google Font: <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noreferrer" className="underline hover:text-[#00416A]">fonts.google.com/specimen/Inter</a>
          </p>
        </Section>

        {/* E-Mail Signatur */}
        <Section icon={Copy} title="E-Mail Signatur">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* Preview */}
            <div className="border border-dashed border-gray-200 rounded-lg p-5 mb-5 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#00416A] uppercase leading-tight">LEISTUNGS</p>
                  <p className="text-xs font-light tracking-widest text-[#00416A] uppercase leading-tight">ARCHITEKTUR</p>
                </div>
              </div>
              <div className="w-16 h-px bg-[#00416A]/30 mb-3" />
              {SIGNATURE_LINES.map((line) => (
                <p key={line.label} className="text-sm text-gray-600">
                  <span className="text-gray-400 mr-2">{line.label}:</span>{line.value}
                </p>
              ))}
            </div>
            {/* Copy all */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 flex-1">Signaturtext kopieren und in E-Mail-Client einfügen</p>
              <CopyButton
                text={`Leistungsarchitektur\n\n${SIGNATURE_LINES.map((l) => `${l.label}: ${l.value}`).join("\n")}`}
              />
            </div>
          </div>
        </Section>

        {/* Einzelne Signaturelemente */}
        <Section icon={Copy} title="Signatur-Elemente">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {SIGNATURE_LINES.map((line) => (
              <div key={line.label} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs text-gray-400">{line.label}</p>
                  <p className="text-sm font-medium text-gray-800">{line.value}</p>
                </div>
                <CopyButton text={line.value} />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}