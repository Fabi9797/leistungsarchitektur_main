import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Methode", href: "#methode" },
  { label: "Ergebnisse", href: "#ergebnisse" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <img
                  src="https://media.base44.com/images/public/69b064c89953b727c5202e21/0890b8689_DesignohneTitel15.png"
                  alt="Logo"
                  className="w-9 h-9 object-contain rounded-lg"
                />
              </div>
              <span className="text-xs font-bold tracking-widest text-[#00416A] leading-tight uppercase">
                LEISTUNGS<br/>
                <span className="font-light tracking-widest">ARCHITEKTUR</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-black/60 hover:text-[#00416A] transition-colors duration-300 tracking-wide uppercase"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:block">
              <a
                href="#analyse"
                className="inline-flex items-center px-6 py-2.5 bg-[#00416A] text-white text-sm font-medium rounded-lg hover:bg-[#003356] transition-all duration-300 tracking-wide"
              >
                Analyse starten
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#00416A]"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6"
          >
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-semibold text-[#00416A] tracking-tight"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#analyse"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex items-center justify-center px-8 py-4 bg-[#00416A] text-white text-base font-medium rounded-lg"
              >
                Analyse starten
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}