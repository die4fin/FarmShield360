import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// sesuaikan path
import SeedLoadingOverlay from "../../../components/SeedLoadingOverlay";
// kalau kamu sudah pakai shared context desa, aktifkan ini:
// import { useLangitCek } from "../../../src/contexts/LangitCekContext";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const CARD = "#ffffff";
const MUTED = "#6b7280";

type RiskLevel = "Rendah" | "Sedang" | "Tinggi";

export default function ExtremePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // optional: kalau mau baca desa dari context
  // const { selectedDesa } = useLangitCek();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  // Dummy data untuk demo (deadline-safe)
  const summary = useMemo(() => {
    // kalau pakai context, kamu bisa ganti angka berikut pakai selectedDesa.categories
    const tempNow = 34 + Math.floor(Math.random() * 4);
    const tempPeak = tempNow + 3;
    const windKmh = 32;
    const rainMm = 8.4;

    const heatRisk: RiskLevel =
      tempPeak >= 38 ? "Tinggi" : tempPeak >= 35 ? "Sedang" : "Rendah";
    const windRisk: RiskLevel =
      windKmh >= 35 ? "Tinggi" : windKmh >= 25 ? "Sedang" : "Rendah";
    const stormRisk: RiskLevel =
      rainMm >= 12 ? "Tinggi" : rainMm >= 6 ? "Sedang" : "Rendah";

    const overall: RiskLevel =
      heatRisk === "Tinggi" || windRisk === "Tinggi" || stormRisk === "Tinggi"
        ? "Tinggi"
        : heatRisk === "Sedang" || windRisk === "Sedang" || stormRisk === "Sedang"
        ? "Sedang"
        : "Rendah";

    return {
      locationLabel: "Desa Anggrek", // ganti: selectedDesa.label
      conditionLabel: "Panas • Berangin",
      tempNow,
      tempPeak,
      windKmh,
      rainMm,
      heatRisk,
      windRisk,
      stormRisk,
      overall,
    };
  }, []);

  // ✅ Heatwave banner muncul kalau suhu puncak > 38
  const isHeatwave = summary.tempPeak > 38;

  const badgeStyle = (level: RiskLevel) => {
    if (level === "Tinggi") return styles.badgeHigh;
    if (level === "Sedang") return styles.badgeMid;
    return styles.badgeLow;
  };

  const badgeTextStyle = (level: RiskLevel) => {
    if (level === "Tinggi") return styles.badgeTextHigh;
    if (level === "Sedang") return styles.badgeTextMid;
    return styles.badgeTextLow;
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.root}>
        <SeedLoadingOverlay visible={loading} />
        <View style={styles.bgDecor} pointerEvents="none">
          <View style={styles.bgBlob} />
          <View style={styles.bgBlobTwo} />
          <View style={styles.bgRing} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.back}
              hitSlop={12}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={GREEN}
              />
            </Pressable>
            <View style={styles.headerAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Potensi Cuaca Ekstrem</Text>
              <Text style={styles.subtitle}>
                Early warning untuk angin kencang, badai, dan heatwave (demo safe).
              </Text>
            </View>
          </View>

          {/* Strip lokasi */}
          <View style={styles.strip}>
            <View style={styles.stripLeft}>
              <MaterialCommunityIcons name="map-marker" size={18} color={GREEN} />
              <Text style={styles.stripText}>
                <Text style={styles.stripBold}>{summary.locationLabel}</Text> •{" "}
                {summary.conditionLabel}
              </Text>
            </View>
          </View>

          {/* ✅ Heatwave Banner (AUTO) */}
          {isHeatwave && (
            <View style={styles.heatwaveBanner}>
              <View style={styles.heatwaveIcon}>
                <MaterialCommunityIcons
                  name="weather-sunny-alert"
                  size={26}
                  color="#b45309"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heatwaveTitle}>Heatwave Risk Terdeteksi</Text>
                <Text style={styles.heatwaveText}>
                  Suhu puncak diperkirakan mencapai{" "}
                  <Text style={{ fontWeight: "900" }}>{summary.tempPeak}°C</Text>.
                  Risiko stres panas tinggi pada tanaman dan pekerja lapangan.
                </Text>
              </View>
            </View>
          )}

          {/* Ringkasan cepat */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <MaterialCommunityIcons name="radar" size={24} color={GREEN} />
              <Text style={styles.cardTitle}>Ringkasan Risiko Hari Ini</Text>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpi}>
                <Text style={styles.kpiValue}>{summary.tempNow}°C</Text>
                <Text style={styles.kpiLabel}>Suhu sekarang</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.kpiValue}>{summary.tempPeak}°C</Text>
                <Text style={styles.kpiLabel}>Puncak (siang)</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.kpiValue}>{summary.windKmh} km/j</Text>
                <Text style={styles.kpiLabel}>Angin</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.riskRow}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Heatwave</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.heatRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.heatRisk),
                    ]}
                  >
                    {summary.heatRisk}
                  </Text>
                </View>
              </View>

              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Angin Kencang</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.windRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.windRisk),
                    ]}
                  >
                    {summary.windRisk}
                  </Text>
                </View>
              </View>

              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Badai / Hujan Lebat</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.stormRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.stormRisk),
                    ]}
                  >
                    {summary.stormRisk}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Catatan</Text>
              <Text style={styles.noteText}>
                Ini halaman demo (deadline-safe). Nanti skor risiko bisa dihitung dari data cuaca
                real-time dan histori lokasi.
              </Text>
            </View>
          </View>

          {/* Early Warning */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color={GREEN}
              />
              <Text style={styles.cardTitle}>Early Warning</Text>
            </View>

            <View style={styles.alertBox}>
              <View style={styles.alertTop}>
                <Text style={styles.alertTitle}>⚠️ Potensi Angin Kencang (6–24 jam)</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.windRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.windRisk),
                    ]}
                  >
                    {summary.windRisk}
                  </Text>
                </View>
              </View>
              <Text style={styles.alertText}>
                Perhatikan pohon rapuh, atap ringan, dan lahan terbuka. Jika ada penyemprotan,
                pertimbangkan jadwal ulang agar droplet tidak terbawa angin.
              </Text>

              <View style={styles.actionList}>
                <Text style={styles.actionTitle}>Yang disarankan:</Text>
                <Text style={styles.actionItem}>• Amankan mulsa/terpal dan peralatan ringan.</Text>
                <Text style={styles.actionItem}>• Cek ajir tanaman & pengikat (staking).</Text>
                <Text style={styles.actionItem}>• Hindari pembakaran lahan saat angin tinggi.</Text>
              </View>
            </View>

            <View style={styles.alertBox}>
              <View style={styles.alertTop}>
                <Text style={styles.alertTitle}>⛈️ Indikasi Hujan Lebat Lokal</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.stormRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.stormRisk),
                    ]}
                  >
                    {summary.stormRisk}
                  </Text>
                </View>
              </View>
              <Text style={styles.alertText}>
                Periksa saluran air, drainase bedengan, dan area rawan genangan. Siapkan jalur
                pembuangan air supaya akar tidak terendam terlalu lama.
              </Text>

              <View style={styles.actionList}>
                <Text style={styles.actionTitle}>Checklist cepat:</Text>
                <Text style={styles.actionItem}>• Bersihkan sumbatan drainase.</Text>
                <Text style={styles.actionItem}>
                  • Pastikan gudang pupuk/kontroler aman dari rembes.
                </Text>
                <Text style={styles.actionItem}>
                  • Siapkan penutup kompos/hasil panen sementara.
                </Text>
              </View>
            </View>
          </View>

          {/* Heatwave Risk */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <MaterialCommunityIcons
                name="weather-sunny-alert"
                size={24}
                color={GREEN}
              />
              <Text style={styles.cardTitle}>Heatwave Risk</Text>
            </View>

            <View style={styles.heatCard}>
              <View style={styles.heatTop}>
                <Text style={styles.heatTitle}>🔥 Risiko Gelombang Panas</Text>
                <View style={[styles.badgeSm, badgeStyle(summary.heatRisk)]}>
                  <Text
                    style={[
                      styles.badgeTextSm,
                      badgeTextStyle(summary.heatRisk),
                    ]}
                  >
                    {summary.heatRisk}
                  </Text>
                </View>
              </View>

              <Text style={styles.heatText}>
                Suhu puncak diperkirakan mencapai{" "}
                <Text style={styles.strong}>{summary.tempPeak}°C</Text>. Kondisi ini dapat
                meningkatkan stres tanaman, mempercepat penguapan, dan memicu layu pada siang hari.
              </Text>

              <View style={styles.actionList}>
                <Text style={styles.actionTitle}>Saran tindakan:</Text>
                <Text style={styles.actionItem}>• Prioritaskan penyiraman pagi (05:00–08:00).</Text>
                <Text style={styles.actionItem}>• Tambahkan mulsa untuk menahan kelembapan tanah.</Text>
                <Text style={styles.actionItem}>• Pertimbangkan paranet/naungan sementara.</Text>
                <Text style={styles.actionItem}>
                  • Pantau gejala: daun menggulung, layu, tepi kering.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer spacer */}
          <View style={{ height: 18 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  bgDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgBlob: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(59,130,246,0.10)",
    top: -90,
    right: -110,
  },
  bgBlobTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(251,191,36,0.14)",
    bottom: -110,
    left: -90,
  },
  bgRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.15)",
    top: 120,
    left: -60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerAccent: {
    width: 4,
    height: 34,
    borderRadius: 4,
    backgroundColor: "rgba(47,111,27,0.25)",
  },
  title: { fontSize: 18, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 2, color: MUTED, fontWeight: "600", fontSize: 12 },

  strip: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginBottom: 12,
  },
  stripLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  stripText: { color: "#111827", fontWeight: "800" },
  stripBold: { fontWeight: "900" },

  // ✅ Heatwave Banner styles
  heatwaveBanner: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(251, 191, 36, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.45)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    marginBottom: 12,
  },
  heatwaveIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heatwaveTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#92400e",
    marginBottom: 2,
  },
  heatwaveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    lineHeight: 16,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    marginBottom: 12,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111827", flex: 1 },

  kpiRow: { flexDirection: "row", gap: 10 },
  kpi: { flex: 1, backgroundColor: "rgba(47,111,27,0.06)", borderRadius: 16, padding: 12 },
  kpiValue: { fontSize: 18, fontWeight: "900", color: GREEN },
  kpiLabel: { marginTop: 2, color: MUTED, fontWeight: "700", fontSize: 12 },

  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginVertical: 12 },

  riskRow: { gap: 10 },
  riskItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  riskLabel: { color: "#111827", fontWeight: "800" },

  noteBox: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  noteTitle: { fontWeight: "900", color: "#111827", marginBottom: 4 },
  noteText: { color: MUTED, fontWeight: "600", lineHeight: 18 },

  alertBox: {
    marginTop: 10,
    backgroundColor: "rgba(47,111,27,0.06)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.10)",
  },
  alertTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  alertTitle: { fontWeight: "900", color: "#111827", flex: 1 },
  alertText: { marginTop: 6, color: MUTED, fontWeight: "600", lineHeight: 18 },

  actionList: { marginTop: 10 },
  actionTitle: { fontWeight: "900", color: "#111827", marginBottom: 6 },
  actionItem: { color: MUTED, fontWeight: "600", lineHeight: 18 },

  heatCard: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.22)",
  },
  heatTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  heatTitle: { fontWeight: "900", color: "#111827", flex: 1 },
  heatText: { marginTop: 6, color: MUTED, fontWeight: "600", lineHeight: 18 },
  strong: { fontWeight: "900", color: "#111827" },

  tipRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  tipText: { color: MUTED, fontWeight: "600", flex: 1, lineHeight: 18 },

  badge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeText: { fontWeight: "900", fontSize: 12 },

  badgeSm: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  badgeTextSm: { fontWeight: "900", fontSize: 12 },

  badgeHigh: { backgroundColor: "rgba(239, 68, 68, 0.14)" },
  badgeMid: { backgroundColor: "rgba(245, 158, 11, 0.16)" },
  badgeLow: { backgroundColor: "rgba(34, 197, 94, 0.16)" },

  badgeTextHigh: { color: "#ef4444" },
  badgeTextMid: { color: "#f59e0b" },
  badgeTextLow: { color: "#22c55e" },
});
