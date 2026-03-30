import React, { createContext, useContext, useState } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [playingId, setPlayingId] = useState(null);
  return (
    <AudioContext.Provider value={{ playingId, setPlayingId }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}