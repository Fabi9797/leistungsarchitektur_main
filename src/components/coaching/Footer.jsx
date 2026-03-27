import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69b064c89953b727c5202e21/4e221e904_DesignohneTitel16.png"
                alt="Logo"
                className="w-9 h-9 object-contain rounded-lg"
              />
            </div>
            <span className="text-xs font-bold tracking-widest text-white/70 leading-tight uppercase">
              LEISTUNGS<br/>
              <span className="font-light tracking-widest">ARCHITEKTUR</span>
            </span>
          </a>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="/impressum" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Impressum
            </a>
            <a href="/datenschutz" className="text-sm text-white/30 hover:text-white/60 transition-colors">
              Datenschutz
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