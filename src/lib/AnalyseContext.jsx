import React, { createContext, useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AnalyseModal from "@/components/coaching/AnalyseModal";

const AnalyseContext = createContext(null);

export function AnalyseProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <AnalyseContext.Provider value={{ openAnalyse: () => setOpen(true) }}>
      {children}
      <AnimatePresence>
        {open && <AnalyseModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </AnalyseContext.Provider>
  );
}

export function useAnalyse() {
  return useContext(AnalyseContext);
}