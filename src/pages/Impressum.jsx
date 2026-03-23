import React from 'react';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00416A] mb-10">Impressum</h1>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-3">Angaben gemäß § 5 TMG</h2>
          <p className="text-black/80 leading-relaxed">
            Fabian Aichem<br />
            Thüringer Str. 69<br />
            30179 Hannover<br />
            Deutschland
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-3">Kontakt</h2>
          <p className="text-black/80">
            E-Mail:{' '}
            <a href="mailto:contact@aichem.io" className="text-[#00416A] hover:underline">
              contact@aichem.io
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-3">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p className="text-black/80 leading-relaxed">
            Fabian Aichem<br />
            Thüringer Str. 69<br />
            30179 Hannover
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-3">
            Alternative Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO und § 36 VSBG
          </h2>
          <p className="text-black/80 leading-relaxed mb-2">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00416A] hover:underline break-all"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p className="text-black/80 leading-relaxed">
            Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}