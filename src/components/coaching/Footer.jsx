import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">PA</span>
            </div>
            <span className="text-sm text-white/40 font-medium">Performance Architecture</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Impressum
            </a>
            <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Datenschutz
            </a>
            <a href="#analyse" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Strategiegespräch
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-white/20 max-w-xl mx-auto">
            Körperliche Form ist kein Zufall, sondern das Ergebnis richtiger Architektur.
          </p>
        </div>
      </div>
    </footer>
  );
}