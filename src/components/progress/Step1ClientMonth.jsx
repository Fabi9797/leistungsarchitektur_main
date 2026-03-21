import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const MONTHS = [
  "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember"
];

export default function Step1ClientMonth({ data, update }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    base44.entities.ClientProfile.list().then(setClients);
  }, []);

  const handleMonthChange = (val) => {
    const [year, month] = val.split("-");
    const label = `${MONTHS[parseInt(month) - 1]} ${year}`;
    update({ report_month: val, report_label: label });
  };

  const handleClient = (id) => {
    const c = clients.find(x => x.id === id);
    update({ client_id: id, client_name: c?.name || "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/60 mb-2">Klient auswählen</label>
        <select
          value={data.client_id}
          onChange={e => handleClient(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 outline-none"
        >
          <option value="">— Klient wählen —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-2">Berichtsmonat</label>
        <input
          type="month"
          value={data.report_month}
          onChange={e => handleMonthChange(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 outline-none"
        />
      </div>
      {data.report_label && (
        <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <p className="text-amber-400 font-semibold">{data.report_label}</p>
          {data.client_name && <p className="text-white/60 text-sm mt-1">für {data.client_name}</p>}
        </div>
      )}
    </div>
  );
}