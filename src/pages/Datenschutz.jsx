import React from 'react';

const Section = ({ number, title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-semibold text-[#00416A] mb-3">{number}. {title}</h2>
    <div className="text-black/75 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00416A] mb-10">Datenschutzerklärung</h1>

        <Section number="1" title="Verantwortlicher">
          <p>Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
          <p>
            Fabian Aichem<br />
            Thüringer Str. 69<br />
            30179 Hannover<br />
            Deutschland
          </p>
          <p>E-Mail: <a href="mailto:contact@aichem.io" className="text-[#00416A] hover:underline">contact@aichem.io</a></p>
        </Section>

        <Section number="2" title="Allgemeines zur Datenverarbeitung">
          <p>Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Personenbezogene Daten werden auf dieser Website nur im erforderlichen Umfang verarbeitet und ausschließlich im Rahmen der gesetzlichen Vorschriften der DSGVO sowie des Bundesdatenschutzgesetzes (BDSG).</p>
        </Section>

        <Section number="3" title="Erhebung und Verarbeitung personenbezogener Daten">
          <div>
            <p className="font-medium text-black/90 mb-1">a) Beim Besuch der Website</p>
            <p>Beim Aufruf dieser Website werden automatisch Informationen durch den Browser Ihres Endgeräts an den Server der Website übermittelt. Diese Informationen werden temporär in sogenannten Server-Logfiles gespeichert.</p>
            <p className="mt-2">Erfasst werden insbesondere:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-black/70">
              <li>IP-Adresse</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Browsertyp und -version</li>
              <li>Betriebssystem</li>
              <li>Referrer-URL</li>
            </ul>
            <p className="mt-2">Die Verarbeitung erfolgt zur Gewährleistung eines reibungslosen Verbindungsaufbaus und der Systemsicherheit.</p>
            <p className="mt-1 text-black/50 text-sm">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</p>
          </div>
          <div className="mt-4">
            <p className="font-medium text-black/90 mb-1">b) Kontaktaufnahme & Analysegespräch</p>
            <p>Wenn Sie über die Website Kontakt aufnehmen (z. B. über Formulare) oder Ihre Kontaktdaten hinterlassen, werden folgende Daten verarbeitet:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-black/70">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer</li>
              <li>ggf. weitere freiwillige Angaben</li>
            </ul>
            <p className="mt-2">Die Daten werden ausschließlich zur Kontaktaufnahme, Terminvereinbarung und Durchführung eines Analysegesprächs verwendet.</p>
            <p className="mt-1 text-black/50 text-sm">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen)</p>
          </div>
        </Section>

        <Section number="4" title="Coaching-Leistungen & besondere Kategorien personenbezogener Daten">
          <p>Im Rahmen von Coaching-Leistungen verarbeite ich – sofern erforderlich – auch gesundheitsbezogene Daten im Sinne des Art. 9 DSGVO. Dazu zählen insbesondere:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-black/70">
            <li>Trainings- und Leistungsdaten</li>
            <li>Körperdaten (z. B. Gewicht, Körperzusammensetzung)</li>
            <li>Schlaf-, Stress- und Belastungsdaten</li>
            <li>Daten aus Wearables und Health-Trackern (z. B. Withings, WHOOP, Helio Strap)</li>
            <li>Ernährungsbezogene Angaben</li>
            <li>Angaben zu Verletzungen oder Beschwerden</li>
          </ul>
          <p>Diese Daten werden ausschließlich zur individuellen Coaching-Betreuung verarbeitet.</p>
          <div className="text-black/50 text-sm space-y-1">
            <p>Rechtsgrundlage:</p>
            <p>Art. 6 Abs. 1 lit. b DSGVO</p>
            <p>Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung)</p>
          </div>
          <p>Die Einwilligung erfolgt gesondert, insbesondere im Rahmen des Coachingvertrags, und kann jederzeit mit Wirkung für die Zukunft widerrufen werden.</p>
        </Section>

        <Section number="5" title="Einsatz von Drittanbietern & Tools">
          <p>Zur Durchführung meiner Leistungen setze ich externe Dienstleister ein:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-black/70">
            <li>Kommunikation: E-Mail, WhatsApp</li>
            <li>Terminbuchung: Calendly</li>
            <li>Zahlungsabwicklung: Stripe</li>
            <li>Dokumentation & Coaching: Google-Dienste, Nutrilize</li>
            <li>Health-Tracking: Anbieter von Wearables & Tracking-Software (z. B. Withings, WHOOP, Helio Strap)</li>
          </ul>
          <p>Dabei kann es zu einer Verarbeitung personenbezogener Daten außerhalb der Europäischen Union (z. B. USA) kommen. Die Anbieter sind nach Möglichkeit durch Standardvertragsklauseln oder vergleichbare Schutzmechanismen abgesichert.</p>
        </Section>

        <Section number="6" title="Zahlungsabwicklung">
          <p>Zahlungen erfolgen über den Zahlungsdienstleister Stripe. Die für den Zahlungsvorgang erforderlichen Daten werden direkt an Stripe übermittelt. Ich selbst speichere keine vollständigen Zahlungsdaten.</p>
          <p className="text-black/50 text-sm">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>
        </Section>

        <Section number="7" title="Speicherdauer">
          <p>Personenbezogene Daten werden nur so lange gespeichert, wie dies für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.</p>
          <p>Daten aus Analysegesprächen ohne anschließende Zusammenarbeit werden regelmäßig gelöscht, sofern keine gesetzlichen Pflichten entgegenstehen.</p>
        </Section>

        <Section number="8" title="Rechte der betroffenen Personen">
          <p>Sie haben jederzeit das Recht:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-black/70">
            <li>auf Auskunft über Ihre gespeicherten Daten</li>
            <li>auf Berichtigung unrichtiger Daten</li>
            <li>auf Löschung oder Einschränkung der Verarbeitung</li>
            <li>auf Datenübertragbarkeit</li>
            <li>auf Widerruf erteilter Einwilligungen</li>
            <li>auf Beschwerde bei einer zuständigen Aufsichtsbehörde</li>
          </ul>
        </Section>

        <Section number="9" title="Widerruf von Einwilligungen">
          <p>Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden. Der Widerruf kann dazu führen, dass bestimmte Leistungen nicht oder nicht mehr erbracht werden können.</p>
        </Section>

        <Section number="10" title="Kontakt bei Datenschutzfragen">
          <p>Bei Fragen zum Datenschutz wenden Sie sich bitte an: <a href="mailto:contact@aichem.io" className="text-[#00416A] hover:underline">contact@aichem.io</a></p>
        </Section>

        <Section number="11" title="Stand">
          <p>Stand: März 2026</p>
        </Section>
      </div>
    </div>
  );
}