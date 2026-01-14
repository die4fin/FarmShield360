// pilihtanam_result_analysis.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const GREEN = "#2f6f1b";

type SoilType = "Liat" | "Lempung" | "Berpasir" | "Gambut" | "Campuran";
type PrevCrop = "Jagung" | "Padi" | "Cabai" | "Singkong" | "Kangkung" | "Tidak ada";
type Commodity = "Padi" | "Cabai" | "Jagung" | "Kangkung" | "Talas" | "Bayam Air";

type Payload = {
  field: {
    lokasi: string;
    luasHa: string;
    tanah: SoilType;
    tanamanSebelumnya: PrevCrop;
  };
  commodity: Commodity;
  verified: boolean;
  outlook: {
    window: string;
    rainTrend: string;
    riskFlood: string;
    humidity: string;
  };
};

function toneForStatus(status: "Sangat Sesuai" | "Cocok" | "Tidak Sesuai") {
  if (status === "Sangat Sesuai") {
    return { bg: "#ecfdf5", border: "#bbf7d0", color: "#166534", icon: "shield-check-outline" as const };
  }
  if (status === "Tidak Sesuai") {
    return { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "alert-octagon-outline" as const };
  }
  return { bg: "#fffbeb", border: "#fde68a", color: "#92400e", icon: "alert-circle-outline" as const };
}

export default function PilihTanamResultAnalysis() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ data?: string }>();

  const payload: Payload = useMemo(() => {
    try {
      return params?.data ? (JSON.parse(params.data) as Payload) : (null as any);
    } catch {
      return null as any;
    }
  }, [params?.data]);

  const safe = payload ?? {
    field: { lokasi: "—", luasHa: "0.0", tanah: "Liat", tanamanSebelumnya: "Tidak ada" as PrevCrop },
    commodity: "Cabai" as Commodity,
    verified: false,
    outlook: { window: "30–90 hari", rainTrend: "sedang", riskFlood: "sedang", humidity: "tinggi" },
  };

  const status = useMemo<"Sangat Sesuai" | "Cocok" | "Tidak Sesuai">(() => {
    // Dummy expert rules aligned with your narrative
    if (safe.commodity === "Cabai" && safe.field.tanah === "Liat") return "Tidak Sesuai";
    if (safe.commodity === "Padi") return "Sangat Sesuai";
    if (safe.commodity === "Kangkung" || safe.commodity === "Talas") return "Cocok";
    return "Cocok";
  }, [safe.commodity, safe.field.tanah]);

  const tone = toneForStatus(status);

  const rational = useMemo(() => {
    if (safe.commodity === "Cabai" && safe.field.tanah === "Liat") {
      return [
        "Risiko genangan air meningkat karena drainase tanah liat cenderung buruk.",
        "Kelembaban tinggi meningkatkan risiko penyakit jamur (daun & batang).",
        `Outlook ${safe.outlook.window}: tren hujan ${safe.outlook.rainTrend} dengan risiko banjir ${safe.outlook.riskFlood}.`,
      ];
    }
    if (safe.commodity === "Padi") {
      return [
        "Curah hujan lebih tinggi justru mendukung sistem sawah dan pasokan air stabil.",
        "Tanah liat bisa dimanfaatkan optimal untuk menahan air pada petak sawah.",
        `Outlook ${safe.outlook.window}: kelembaban ${safe.outlook.humidity} — monitoring hama tetap diperlukan.`,
      ];
    }
    return [
      "Kondisi lahan saat ini masih dalam rentang aman untuk komoditas pilihan.",
      `Outlook ${safe.outlook.window}: tren hujan ${safe.outlook.rainTrend}.`,
      "Perlu pemantauan drainase & kelembaban untuk mencegah penyakit musiman.",
    ];
  }, [safe.commodity, safe.field.tanah, safe.outlook.window, safe.outlook.rainTrend, safe.outlook.riskFlood, safe.outlook.humidity]);

  const adapt = useMemo(() => {
    if (safe.commodity === "Cabai" && safe.field.tanah === "Liat") {
      return [
        "Gali saluran drainase utama + parit sekunder agar aliran air lebih baik.",
        "Tinggikan bedengan dan gunakan mulsa untuk mengurangi percikan tanah ke daun.",
        "Pilih varietas cabai yang lebih toleran lembap/basah; perketat monitoring jamur.",
        "Jadwalkan penyiraman/pemupukan lebih adaptif (hindari saat tanah jenuh air).",
      ];
    }
    return [
      "Periksa saluran air minimal 2×/minggu saat curah hujan meningkat.",
      "Terapkan pemupukan bertahap agar nutrisi tidak mudah tercuci.",
      "Gunakan pengamatan daun bawah untuk deteksi dini jamur/hama musiman.",
      "Siapkan rencana darurat: terpal, pompa kecil, atau drainase luapan.",
    ];
  }, [safe.commodity, safe.field.tanah]);

  const alternatives = useMemo(() => {
    // narrative examples
    if (safe.commodity === "Cabai" && safe.field.tanah === "Liat") {
      return [
        { name: "Padi", rank: "Sangat Cocok", note: "Hujan tinggi + tanah liat mendukung sistem sawah." },
        { name: "Kangkung", rank: "Cocok", note: "Lebih toleran kondisi basah; cocok dekat aliran air." },
        { name: "Talas", rank: "Cocok", note: "Tahan lembap dan dapat tumbuh baik pada tanah berat." },
      ];
    }
    return [
      { name: "Kangkung", rank: "Cocok", note: "Adaptif untuk kelembaban tinggi." },
      { name: "Talas", rank: "Cocok", note: "Stabil pada tanah berat/lembap." },
      { name: "Jagung", rank: "Cocok", note: "Butuh manajemen drainase bila hujan meningkat." },
    ];
  }, [safe.commodity, safe.field.tanah]);

  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    Alert.alert("Analisis tersimpan", "Hasil analisis disimpan untuk referensi musim tanam berikutnya.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top * 0.15, 4) }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.topTitle}>Analisis Kesesuaian</Text>
            <Text style={styles.topSub}>
              {safe.commodity} • {safe.field.luasHa} ha • {safe.field.tanah}
            </Text>
          </View>

          <View style={[styles.topPill, saved && { backgroundColor: "#16a34a" }]}>
            <MaterialCommunityIcons name={saved ? "content-save-check-outline" : "content-save-outline"} size={16} color="#fff" />
            <Text style={styles.topPillText}>{saved ? "Saved" : "Save"}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Status Hero */}
          <View style={styles.hero}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />

            <View style={[styles.statusBadge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
              <MaterialCommunityIcons name={tone.icon} size={18} color={tone.color} />
              <Text style={[styles.statusText, { color: tone.color }]}>{status}</Text>
            </View>

            <Text style={styles.heroTitle}>{safe.commodity}</Text>
            <Text style={styles.heroSub}>
              Outlook {safe.outlook.window} • Tren hujan {safe.outlook.rainTrend} • Risiko banjir {safe.outlook.riskFlood}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#e5e7eb" />
                <Text style={styles.metaChipText}>{safe.field.lokasi}</Text>
              </View>
              <View style={[styles.metaChip, safe.verified ? styles.metaChipOk : styles.metaChipWarn]}>
                <MaterialCommunityIcons name={safe.verified ? "check-decagram" : "alert-circle-outline"} size={16} color="#e5e7eb" />
                <Text style={styles.metaChipText}>{safe.verified ? "Terverifikasi" : "Belum verifikasi"}</Text>
              </View>
            </View>
          </View>

          {/* Rasional */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Rasional Penilaian</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {rational.map((t, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.cardText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Adaptasi */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="shield-sun-outline" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Strategi Adaptasi</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {adapt.map((t, i) => (
                <View key={i} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={GREEN} />
                  <Text style={styles.cardText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Alternatif */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="swap-horizontal" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Rekomendasi Alternatif</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {alternatives.map((a, i) => (
                <View key={i} style={styles.altItem}>
                  <View style={styles.altLeft}>
                    <Text style={styles.altName}>{a.name}</Text>
                    <Text style={styles.altNote}>{a.note}</Text>
                  </View>
                  <View style={styles.altRankPill}>
                    <Text style={styles.altRank}>{a.rank}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Save CTA */}
          <Pressable
            onPress={onSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.95 }]}
          >
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Simpan Analisis</Text>
          </Pressable>

          <View style={{ height: 22 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 24 },

  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, paddingHorizontal: 16 },
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
    backgroundColor: "rgba(200,255,157,0.30)",
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

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  statusText: { fontWeight: "900" },

  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  heroSub: { marginTop: 6, color: "#e5e7eb", fontWeight: "700", lineHeight: 18 },

  metaRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    maxWidth: "100%",
  },
  metaChipOk: {},
  metaChipWarn: {},
  metaChipText: { color: "#e5e7eb", fontWeight: "800" },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  cardText: { flex: 1, color: MUTED, fontWeight: "700", lineHeight: 18 },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "rgba(47,111,27,0.35)", marginTop: 6 },

  altItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.03)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  altLeft: { flex: 1 },
  altName: { fontSize: 13, fontWeight: "900", color: TEXT },
  altNote: { marginTop: 4, color: MUTED, fontWeight: "700", lineHeight: 18 },
  altRankPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(47,111,27,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.20)",
  },
  altRank: { color: GREEN, fontWeight: "900" },

  saveBtn: {
    marginTop: 14,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "900" },
});
