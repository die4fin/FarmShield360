// pilihtanam_result_recommendation.tsx
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
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

type Payload = {
  field: {
    lokasi: string;
    luasHa: string;
    tanah: SoilType;
    tanamanSebelumnya: PrevCrop;
  };
  verified: boolean;
  outlook: {
    window: string;
    rainTrend: string;
    humidity: string;
    pestsRisk: string;
  };
};

export default function PilihTanamResultRecommendation() {
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
    field: { lokasi: "—", luasHa: "0.0", tanah: "Liat" as SoilType, tanamanSebelumnya: "Tidak ada" as PrevCrop },
    verified: false,
    outlook: { window: "30–90 hari", rainTrend: "lebih tinggi", humidity: "tinggi", pestsRisk: "meningkat" },
  };

  // Main recommendation (dummy but aligned with your narrative)
  const main = useMemo(() => {
    // If soil is clay & rain higher, padi becomes a very strong recommendation
    return {
      name: "Padi",
      rank: "Sangat Cocok",
      justifications: [
        "Prediksi curah hujan tinggi ideal untuk budidaya padi.",
        "Tanah liat dapat dimanfaatkan optimal untuk sistem sawah (menahan air).",
        `Rotasi yang baik setelah ${safe.field.tanamanSebelumnya.toLowerCase()} untuk keseimbangan agronomi.`,
        "Potensi hasil panen tinggi pada kondisi ini bila drainase dan pemupukan diatur.",
      ],
      strategy: [
        "Pilih varietas padi yang tahan penyakit khas musim hujan.",
        "Terapkan pupuk dalam dosis terpisah (split dosing) agar nutrisi lebih efisien.",
        "Perkuat monitoring: buat drainase luapan untuk mencegah kelebihan air.",
        "Pantau hama musiman saat kelembaban tinggi dan lakukan tindakan dini.",
      ],
      alternatives: [
        { name: "Bayam Air", rank: "Cocok", note: "Toleran kelembaban tinggi dan siklus panen cepat." },
        { name: "Talas", rank: "Cocok", note: "Adaptif pada lahan lembap dan tanah berat." },
      ],
    };
  }, [safe.field.tanamanSebelumnya]);

  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    Alert.alert("Rekomendasi tersimpan", "Hasil rekomendasi disimpan untuk perencanaan musim tanam berikutnya.");
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
            <Text style={styles.topTitle}>Rekomendasi AI</Text>
            <Text style={styles.topSub}>
              Outlook {safe.outlook.window} • Hujan {safe.outlook.rainTrend} • Hama {safe.outlook.pestsRisk}
            </Text>
          </View>

          <View style={[styles.topPill, saved && { backgroundColor: "#16a34a" }]}>
            <MaterialCommunityIcons name={saved ? "content-save-check-outline" : "content-save-outline"} size={16} color="#fff" />
            <Text style={styles.topPillText}>{saved ? "Saved" : "Save"}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />

            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="robot-happy-outline" size={16} color="#fff" />
              <Text style={styles.heroBadgeText}>Rekomendasi Utama</Text>
            </View>

            <Text style={styles.heroTitle}>
              {main.name} — {main.rank}
            </Text>

            <Text style={styles.heroSub}>
              {safe.field.luasHa} ha • {safe.field.tanah} • Rotasi: {safe.field.tanamanSebelumnya}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#e5e7eb" />
                <Text style={styles.metaChipText}>{safe.field.lokasi}</Text>
              </View>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name={safe.verified ? "check-decagram" : "alert-circle-outline"} size={16} color="#e5e7eb" />
                <Text style={styles.metaChipText}>{safe.verified ? "Terverifikasi" : "Belum verifikasi"}</Text>
              </View>
            </View>
          </View>

          {/* Justification (4) */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Justifikasi (4 poin)</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {main.justifications.map((t, i) => (
                <View key={i} style={styles.justItem}>
                  <View style={styles.numPill}>
                    <Text style={styles.numText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.cardText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Strategy */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="target" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Strategi Maksimisasi Hasil</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {main.strategy.map((t, i) => (
                <View key={i} style={styles.bulletRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={GREEN} />
                  <Text style={styles.cardText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Alternatives */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="swap-horizontal" size={18} color={GREEN} />
              <Text style={styles.cardTitle}>Alternatif yang Layak</Text>
            </View>

            <View style={{ marginTop: 10, gap: 10 }}>
              {main.alternatives.map((a, i) => (
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
          <Pressable onPress={onSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.95 }]}>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Simpan Rekomendasi</Text>
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

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 10,
  },
  heroBadgeText: { color: "#fff", fontWeight: "900" },

  heroTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
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

  justItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  numPill: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(47,111,27,0.12)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numText: { color: GREEN, fontWeight: "900" },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },

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
