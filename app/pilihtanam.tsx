// pilihtanam.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const GREEN = "#2f6f1b";
const { width } = Dimensions.get("window");

type SoilType = "Liat" | "Lempung" | "Berpasir" | "Gambut" | "Campuran";
type PrevCrop = "Jagung" | "Padi" | "Cabai" | "Singkong" | "Kangkung" | "Tidak ada";
type Commodity = "Padi" | "Cabai" | "Jagung" | "Kangkung" | "Talas" | "Bayam Air";

type FieldProfile = {
  lokasi: string;
  luasHa: string; // keep string for input
  tanah: SoilType;
  tanamanSebelumnya: PrevCrop;
};

const SOIL_OPTIONS: SoilType[] = ["Liat", "Lempung", "Berpasir", "Gambut", "Campuran"];
const PREV_OPTIONS: PrevCrop[] = ["Jagung", "Padi", "Cabai", "Singkong", "Kangkung", "Tidak ada"];
const COMMODITY_OPTIONS: Commodity[] = ["Padi", "Cabai", "Jagung", "Kangkung", "Talas", "Bayam Air"];

function chipIcon(label: string) {
  if (label.includes("GPS")) return "crosshairs-gps";
  if (label.includes("Satelit")) return "satellite-variant";
  if (label.includes("Iklim")) return "database-outline";
  if (label.includes("Kelembaban")) return "water-percent";
  return "check-circle-outline";
}

function clampText(s: string, fallback: string) {
  const t = (s ?? "").trim();
  return t.length ? t : fallback;
}

export default function PilihTanamPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [field, setField] = useState<FieldProfile>({
    lokasi: "Blok A – dekat irigasi",
    luasHa: "0.8",
    tanah: "Liat",
    tanamanSebelumnya: "Jagung",
  });

  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [mode, setMode] = useState<"punya" | "tidak" | null>(null);
  const [commodity, setCommodity] = useState<Commodity>("Cabai");

  const [soilOpen, setSoilOpen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dataChips = useMemo(
    () => [
      { label: "GPS ✓", ok: true },
      { label: "Satelit ✓", ok: true },
      { label: "Iklim Nasional ✓", ok: true },
      { label: "Kelembaban Tanah ✓", ok: true },
    ],
    []
  );

  const syncPercent = useMemo(() => {
    const ok = dataChips.filter((c) => c.ok).length;
    return Math.round((ok / dataChips.length) * 100);
  }, [dataChips]);

  const onVerify = async () => {
    setVerifying(true);
    setVerified(false);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setVerified(true);
      setVerifying(false);
    }, 650);
  };

  const fieldSummary = useMemo(() => {
    const luas = clampText(field.luasHa, "—");
    return `${luas} ha • ${field.tanah} • Rotasi: ${field.tanamanSebelumnya}`;
  }, [field.luasHa, field.tanah, field.tanamanSebelumnya]);

  const openAnalysisPage = () => {
    const payload = {
      field: {
        lokasi: clampText(field.lokasi, "—"),
        luasHa: clampText(field.luasHa, "0"),
        tanah: field.tanah,
        tanamanSebelumnya: field.tanamanSebelumnya,
      },
      commodity,
      verified,
      outlook: {
        window: "30–90 hari",
        rainTrend: field.tanah === "Liat" ? "lebih tinggi" : "sedang",
        riskFlood: field.tanah === "Liat" ? "tinggi" : "sedang",
        humidity: "tinggi",
      },
    };

    router.push({
      pathname: "/(features)/pilihtanam/pilihtanam_result_analysis",
      params: { data: JSON.stringify(payload) },
    } as any);
  };

  const openRecommendationPage = () => {
    const payload = {
      field: {
        lokasi: clampText(field.lokasi, "—"),
        luasHa: clampText(field.luasHa, "0"),
        tanah: field.tanah,
        tanamanSebelumnya: field.tanamanSebelumnya,
      },
      verified,
      outlook: {
        window: "30–90 hari",
        rainTrend: field.tanah === "Liat" ? "lebih tinggi" : "sedang",
        humidity: "tinggi",
        pestsRisk: "meningkat",
      },
    };

    router.push({
      pathname: "/(features)/pilihtanam/pilihtanam_result_recommendation",
      params: { data: JSON.stringify(payload) },
    } as any);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top * 0.15, 4) }]}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.topTitle}>PilihTanam</Text>
              <Text style={styles.topSub}>AI Adaptive Planting • Outlook 30–90 hari</Text>
            </View>
            <View style={styles.topPill}>
              <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
              <Text style={styles.topPillText}>AI</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />

            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="leaf" size={14} color="#ffffff" />
                <Text style={styles.heroBadgeText}>Adaptif terhadap perubahan iklim</Text>
              </View>

              <View style={styles.heroMiniRight}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#d1d5db" />
                <Text style={styles.heroMiniRightText}>30–90 hari</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Rekomendasi tanam berbasis AI</Text>
            <Text style={styles.heroSub}>
              Menggabungkan GPS pertanian, citra satelit, dan basis data iklim nasional. Petani dapat
              verifikasi lapangan untuk meningkatkan akurasi.
            </Text>

            <View style={styles.syncCard}>
              <View style={styles.syncRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.syncTitle}>Data Sync</Text>
                  <Text style={styles.syncSub}>GPS • Satelit • Iklim Nasional • Kelembaban</Text>
                </View>
                <View style={styles.syncPill}>
                  <Text style={styles.syncPillText}>{syncPercent}%</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${syncPercent}%` }]} />
              </View>

              <View style={styles.chipRow}>
                {dataChips.map((c) => (
                  <View key={c.label} style={styles.chip}>
                    <MaterialCommunityIcons name={chipIcon(c.label) as any} size={14} color="#c8ff9d" />
                    <Text style={styles.chipText}>{c.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Quick strip */}
          <View style={styles.strip}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stripTitle}>Ringkasan Lahan</Text>
              <Text style={styles.stripText}>{fieldSummary}</Text>
              <Text style={styles.stripHint}>Lokasi: {clampText(field.lokasi, "—")}</Text>
            </View>

            <View style={[styles.stripBadge, verified ? styles.stripBadgeOk : styles.stripBadgeWarn]}>
              <MaterialCommunityIcons
                name={verified ? "check-decagram" : "alert-circle-outline"}
                size={16}
                color={verified ? "#16a34a" : "#f59e0b"}
              />
              <Text style={[styles.stripBadgeText, verified ? { color: "#166534" } : { color: "#92400e" }]}>
                {verified ? "Terverifikasi" : "Perlu verifikasi"}
              </Text>
            </View>
          </View>

          {/* Profil Lahan */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Profil Lahan</Text>
                <Text style={styles.cardHint}>
                  Tambahkan/ubah data lahan sebagai verifikasi lapangan.
                </Text>
              </View>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <FieldInput
                label="Lokasi spesifik"
                value={field.lokasi}
                placeholder="contoh: Blok A dekat irigasi"
                onChange={(v) => setField((p) => ({ ...p, lokasi: v }))}
              />

              <FieldInput
                label="Luas lahan (ha)"
                value={field.luasHa}
                placeholder="contoh: 0.8"
                keyboardType="decimal-pad"
                onChange={(v) => setField((p) => ({ ...p, luasHa: v }))}
              />

              <Pressable onPress={() => setSoilOpen(true)} style={styles.selectRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectLabel}>Jenis tanah</Text>
                  <Text style={styles.selectValue}>{field.tanah}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#9ca3af" />
              </Pressable>

              <Pressable onPress={() => setPrevOpen(true)} style={styles.selectRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectLabel}>Tanaman sebelumnya</Text>
                  <Text style={styles.selectValue}>{field.tanamanSebelumnya}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#9ca3af" />
              </Pressable>

              <Pressable
                onPress={onVerify}
                disabled={verifying}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  verifying && { opacity: 0.75 },
                  pressed && { transform: [{ scale: 0.99 }] },
                ]}
              >
                <MaterialCommunityIcons
                  name={verifying ? "progress-clock" : "check-decagram-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.primaryBtnText}>
                  {verifying ? "Memverifikasi..." : "Verifikasi Lapangan"}
                </Text>
              </Pressable>

              <View style={styles.divider} />
              <Text style={styles.microNote}>
                Catatan: verifikasi lapangan membantu sistem menyesuaikan rekomendasi terhadap mikro-iklim lokal.
              </Text>
            </View>
          </View>

          {/* Choose flow */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.sectionTitle}>Pilih Jalur Penggunaan</Text>
            <Text style={styles.sectionSub}>
              Jalur 1: analisis komoditas pilihanmu. Jalur 2: AI memberi rekomendasi terbaik.
            </Text>
          </View>

          {/* Route 1 */}
          <Pressable
            onPress={() => setMode("punya")}
            style={({ pressed }) => [
              styles.routeCard,
              mode === "punya" && styles.routeCardActive,
              pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
            ]}
          >
            <View style={styles.routeTop}>
              <View style={styles.routeIcon}>
                <MaterialCommunityIcons name="sprout-outline" size={20} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>Saya sudah punya komoditas</Text>
                <Text style={styles.routeSub}>
                  Dapatkan status kesesuaian, rasional penilaian, strategi adaptasi, dan rekomendasi alternatif.
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
            </View>

            {mode === "punya" ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <Pressable onPress={() => setCommOpen(true)} style={styles.selectRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectLabel}>Komoditas pilihan</Text>
                    <Text style={styles.selectValue}>{commodity}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#9ca3af" />
                </Pressable>

                <View style={styles.miniInfo}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={GREEN} />
                  <Text style={styles.miniInfoText}>
                    Analisis mempertimbangkan proyeksi hujan, kelembaban tanah, dan risiko penyakit jamur.
                  </Text>
                </View>

                <Pressable
                  onPress={openAnalysisPage}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.95 }]}
                >
                  <MaterialCommunityIcons name="chart-box-outline" size={18} color={GREEN} />
                  <Text style={styles.secondaryBtnText}>Lihat Analisis Kesesuaian</Text>
                </Pressable>
              </View>
            ) : null}
          </Pressable>

          {/* Route 2 */}
          <Pressable
            onPress={() => setMode("tidak")}
            style={({ pressed }) => [
              styles.routeCard,
              mode === "tidak" && styles.routeCardActive,
              pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
            ]}
          >
            <View style={styles.routeTop}>
              <View style={styles.routeIcon}>
                <MaterialCommunityIcons name="robot-outline" size={20} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>Saya tidak tahu, beri rekomendasi</Text>
                <Text style={styles.routeSub}>
                  AI memilih komoditas optimal + 4 justifikasi + strategi maksimisasi hasil + alternatif.
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
            </View>

            {mode === "tidak" ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <Pressable
                  onPress={openRecommendationPage}
                  style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.95 }]}
                >
                  <MaterialCommunityIcons name="magic-staff" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Dapatkan Rekomendasi AI</Text>
                </Pressable>

                <Text style={styles.noteText}>
                  Sistem tetap memberikan alternatif agar petani memiliki beberapa opsi yang layak.
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Picker Modals */}
        <PickerModal
          title="Pilih Jenis Tanah"
          open={soilOpen}
          onClose={() => setSoilOpen(false)}
          options={SOIL_OPTIONS}
          value={field.tanah}
          onPick={(v) => setField((p) => ({ ...p, tanah: v as SoilType }))}
        />

        <PickerModal
          title="Pilih Tanaman Sebelumnya"
          open={prevOpen}
          onClose={() => setPrevOpen(false)}
          options={PREV_OPTIONS}
          value={field.tanamanSebelumnya}
          onPick={(v) => setField((p) => ({ ...p, tanamanSebelumnya: v as PrevCrop }))}
        />

        <PickerModal
          title="Pilih Komoditas"
          open={commOpen}
          onClose={() => setCommOpen(false)}
          options={COMMODITY_OPTIONS}
          value={commodity}
          onPick={(v) => setCommodity(v as Commodity)}
        />
      </View>
    </SafeAreaView>
  );
}

function FieldInput({
  label,
  value,
  placeholder,
  onChange,
  keyboardType,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  keyboardType?: any;
}) {
  return (
    <View>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function PickerModal({
  title,
  open,
  onClose,
  options,
  value,
  onPick,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.pickerSheet}>
          <Text style={styles.pickerTitle}>{title}</Text>

          {options.map((opt) => {
            const active = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onPick(opt);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.pickerItem,
                  active && styles.pickerItemActive,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.pickerItemText, active && { color: GREEN }]}>{opt}</Text>
                {active ? (
                  <MaterialCommunityIcons name="check-circle" size={22} color={GREEN} />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
                )}
              </Pressable>
            );
          })}

          <Pressable onPress={onClose} style={styles.sheetClose}>
            <Text style={styles.sheetCloseText}>Tutup</Text>
          </Pressable>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 28 },

  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  topTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  topSub: { marginTop: 2, fontSize: 12, fontWeight: "800", color: MUTED },
  topPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: GREEN,
  },
  topPillText: { color: "#fff", fontWeight: "900" },

  hero: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#0b2a18",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  heroGlowA: {
    position: "absolute",
    top: -120,
    right: -160,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(200,255,157,0.35)",
  },
  heroGlowB: {
    position: "absolute",
    bottom: -140,
    left: -160,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(47,111,27,0.35)",
  },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: { color: "#e5e7eb", fontWeight: "900", fontSize: 12 },
  heroMiniRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroMiniRightText: { color: "#d1d5db", fontWeight: "900", fontSize: 12 },
  heroTitle: { marginTop: 10, fontSize: 18, fontWeight: "900", color: "#ffffff" },
  heroSub: { marginTop: 6, color: "#e5e7eb", fontWeight: "700", lineHeight: 18 },

  syncCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  syncTitle: { color: "#ffffff", fontWeight: "900" },
  syncSub: { marginTop: 4, color: "#d1d5db", fontWeight: "700", fontSize: 12 },
  syncPill: {
    backgroundColor: "rgba(200,255,157,0.18)",
    borderWidth: 1,
    borderColor: "rgba(200,255,157,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  syncPillText: { color: "#ffffff", fontWeight: "900" },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  progressFill: { height: 10, borderRadius: 999, backgroundColor: "#c8ff9d" },

  chipRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  chipText: { color: "#e5e7eb", fontWeight: "900", fontSize: 12 },

  strip: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  stripTitle: { fontSize: 12, color: MUTED, fontWeight: "900" },
  stripText: { marginTop: 2, fontSize: 13, fontWeight: "900", color: TEXT },
  stripHint: { marginTop: 6, fontSize: 12, color: MUTED, fontWeight: "700" },
  stripBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  stripBadgeOk: { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },
  stripBadgeWarn: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  stripBadgeText: { fontWeight: "900", fontSize: 12 },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  cardHint: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: "700", lineHeight: 18 },

  inputLabel: { fontSize: 12, fontWeight: "900", color: TEXT, marginBottom: 6 },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
    fontWeight: "800",
    color: TEXT,
  },

  selectRow: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectLabel: { fontSize: 12, color: MUTED, fontWeight: "800" },
  selectValue: { marginTop: 2, fontSize: 14, fontWeight: "900", color: TEXT },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.20)",
    backgroundColor: "rgba(47,111,27,0.06)",
  },
  secondaryBtnText: { color: GREEN, fontWeight: "900" },

  divider: { height: 1, backgroundColor: "rgba(17,24,39,0.06)", marginTop: 8 },
  microNote: { marginTop: 10, color: MUTED, fontWeight: "700", lineHeight: 18 },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sectionSub: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: "700", lineHeight: 18 },

  routeCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  routeCardActive: {
    borderColor: "rgba(47,111,27,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  routeTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  routeIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(47,111,27,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.18)",
  },
  routeTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  routeSub: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: "700", lineHeight: 18 },

  miniInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(47,111,27,0.06)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.18)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniInfoText: { flex: 1, color: MUTED, fontWeight: "800", lineHeight: 18 },

  noteText: { color: MUTED, fontWeight: "700", lineHeight: 18 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16 },
  pickerTitle: { fontSize: 16, fontWeight: "900", color: TEXT, marginBottom: 10 },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.03)",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickerItemActive: {
    backgroundColor: "rgba(47,111,27,0.08)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.25)",
  },
  pickerItemText: { fontSize: 14, fontWeight: "900", color: TEXT },
  sheetClose: { marginTop: 6, backgroundColor: GREEN, borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  sheetCloseText: { color: "#fff", fontWeight: "900" },
});
