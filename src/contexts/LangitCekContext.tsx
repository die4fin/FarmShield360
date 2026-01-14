import React, { createContext, useContext, useMemo, useState } from "react";

export type DesaProfile = {
  label: string;
  hint: string;
  categories: {
    tempC: number;      // suhu saat ini (dummy)
    tempPeakC: number;  // suhu puncak siang (dummy) -> dipakai heatwave
    windKmh: number;
    rainMm: number;
    condition: string;
  };
};

type DesaBase = {
  label: string;
  hint: string;
  base: {
    tempC: number;
    windKmh: number;
    rainMm: number;
    condition: string;
  };
};

const DESA_BASE: DesaBase[] = [
  {
    label: "Desa Anggrek",
    hint: "Dataran rendah • Sawah irigasi",
    base: { tempC: 34, windKmh: 12, rainMm: 0.6, condition: "Cerah" },
  },
  {
    label: "Desa Melati",
    hint: "Perbukitan • Kebun campuran",
    base: { tempC: 29, windKmh: 18, rainMm: 2.4, condition: "Berawan" },
  },
  {
    label: "Desa Padi",
    hint: "Lembah • Lahan basah",
    base: { tempC: 31, windKmh: 9, rainMm: 6.8, condition: "Hujan" },
  },
];

// jitter helper: bikin angka terasa hidup tapi tetap masuk akal
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const jitter = (base: number, range: number) => base + (Math.random() * 2 - 1) * range;

function makeLiveProfile(d: DesaBase): DesaProfile {
  const tempNow = Math.round(jitter(d.base.tempC, 1.2));               // ±1.2°C
  const tempPeak = clamp(tempNow + Math.round(jitter(4, 2.0)), 25, 45); // puncak = now + (2..6) kira-kira
  const wind = Math.max(0, Math.round(jitter(d.base.windKmh, 4)));     // ±4 km/j
  const rain = clamp(Number(jitter(d.base.rainMm, 2).toFixed(1)), 0, 60);

  // condition dummy yang menyesuaikan rain + temp
  let condition = d.base.condition;
  if (rain >= 8) condition = "Hujan Lebat";
  else if (rain >= 3) condition = "Hujan Ringan";
  else if (tempPeak >= 38) condition = "Panas Terik";
  else if (wind >= 25) condition = "Berangin";
  // else pakai default

  return {
    label: d.label,
    hint: d.hint,
    categories: {
      tempC: tempNow,
      tempPeakC: tempPeak,
      windKmh: wind,
      rainMm: rain,
      condition,
    },
  };
}

type Ctx = {
  desaList: DesaProfile[];            // versi “live” (label/hint sama, angka bisa berubah)
  selectedDesa: DesaProfile;
  setSelectedDesa: (d: DesaProfile) => void;

  // opsional tapi berguna buat demo: refresh angka desa terpilih (biar terasa realtime)
  refreshSelected: () => void;
};

const LangitCekContext = createContext<Ctx | null>(null);

export function LangitCekProvider({ children }: { children: React.ReactNode }) {
  // bikin list live pertama kali
  const [desaLive, setDesaLive] = useState<DesaProfile[]>(
    DESA_BASE.map((d) => makeLiveProfile(d))
  );
  const [selectedLabel, setSelectedLabel] = useState<string>(DESA_BASE[0].label);

  const selectedDesa = useMemo(() => {
    return desaLive.find((d) => d.label === selectedLabel) ?? desaLive[0];
  }, [desaLive, selectedLabel]);

  const setSelectedDesa = (d: DesaProfile) => {
    setSelectedLabel(d.label);

    // saat pindah desa, “re-roll” angka biar kerasa beda per desa (tapi tetap dummy)
    setDesaLive((prev) =>
      prev.map((x) =>
        x.label === d.label
          ? makeLiveProfile(DESA_BASE.find((b) => b.label === d.label)!)
          : x
      )
    );
  };

  const refreshSelected = () => {
    setDesaLive((prev) =>
      prev.map((x) =>
        x.label === selectedLabel
          ? makeLiveProfile(DESA_BASE.find((b) => b.label === selectedLabel)!)
          : x
      )
    );
  };

  return (
    <LangitCekContext.Provider
      value={{
        desaList: desaLive,
        selectedDesa,
        setSelectedDesa,
        refreshSelected,
      }}
    >
      {children}
    </LangitCekContext.Provider>
  );
}

export function useLangitCek() {
  const ctx = useContext(LangitCekContext);
  if (!ctx) throw new Error("useLangitCek must be used inside LangitCekProvider");
  return ctx;
}
