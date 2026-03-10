import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Methode", href: "#methode" },
  { label: "Ergebnisse", href: "#ergebnisse" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "FAQ", href: "#faq" },
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
            <a href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#00416A] rounded-lg flex items-center justify-center overflow-hidden">
                <img src="https://media.base44.com/images/public/69b064c89953b727c5202e21/25b63ccc5_generated_image.png" alt="Logo" className="w-full h-full object-contain p-1 brightness-0 invert" />
              </div>
              <span className="hidden sm:block text-sm font-semibold tracking-tight text-[#00416A]">
                PERFORMANCE<br className="leading-none" />
                <span className="font-light">ARCHITECTURE</span>
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