import React, { useState } from "react";
import { Lock } from "lucide-react";

const PASSWORD = "4802";
const STORAGE_KEY = "backoffice_auth_expiry";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function isAuthValid() {
  const expiry = localStorage.getItem(STORAGE_KEY);
  return expiry && Date.now() < parseInt(expiry, 10);
}

export default function BackofficeGuard({ children }) {
  const [authed, setAuthed] = useState(() => isAuthValid());
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authed) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + SEVEN_DAYS));
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f5f5f5] flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col items-center gap-5"
      >
        <div className="w-12 h-12 bg-[#00416A] rounded-full flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-black">Backoffice</h2>
          <p className="text-sm text-black/40 mt-1">Passwort eingeben</p>
        </div>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="••••"
          autoFocus
          className={`w-full border rounded-xl px-4 py-3 text-center text-lg tracking-widest outline-none transition ${
            error ? "border-red-400 bg-red-50" : "border-black/15 focus:border-[#00416A]"
          }`}
        />
        {error && <p className="text-red-500 text-sm -mt-2">Falsches Passwort</p>}
        <button
          type="submit"
          className="w-full bg-[#00416A] text-white rounded-xl py-3 font-semibold hover:bg-[#003356] transition"
        >
          Zugang
        </button>
      </form>
    </div>
  );
}