import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import SeedLoadingOverlay from "../../../components/SeedLoadingOverlay";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const CARD = "#ffffff";
const MUTED = "#6b7280";

type RiskLevel = "Rendah" | "Sedang" | "Tinggi";

function AnimatedCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(520).delay(delay)}>
      {children}
    </Animated.View>
  );
}

export default function PestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // decorative pulse (subtle) — bikin halaman ga flat
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withTiming(1, { duration: 700 });
  }, [pulse]);

  const decoStyle = useAnimatedStyle(() => {
    const t = pulse.value;
    return {
      transform: [{ translateY: (1 - t) * 6 }],
      opacity: 0.45 + t * 0.55,
    };
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Dummy data (deadline-safe, korelatif cuaca)
  const data = useMemo(() => {
    const humidity = 78; // %
    const rainMm = 6.2;
    const tempC = 34;

    const pestRisk: RiskLevel =
      humidity >= 80 || rainMm >= 8 ? "Tinggi" : humidity >= 70 ? "Sedang" : "Rendah";

    // extra: highlight (lebih “rame” tapi masih relevan)
    const highlights = [
      {
        icon: "water-percent",
        title: "Kelembapan Tinggi",
        desc: "Kondisi lembap mendukung perkembangan telur & larva lebih cepat.",
      },
      {
        icon: "weather-rainy",
        title: "Hujan Ringan Berulang",
        desc: "Daun lebih sering basah, memicu peningkatan populasi beberapa hama.",
      },
      {
        icon: "thermometer-high",
        title: "Suhu Hangat",
        desc: "Mempercepat siklus hidup dan aktivitas makan pada hama tertentu.",
      },
    ];

    return {
      location: "Desa Anggrek",
      humidity,
      rainMm,
      tempC,
      pestRisk,
      highlights,
      dominantPests: [
        { name: "Wereng", reason: "Kelembapan tinggi & suhu hangat", risk: "Tinggi" as RiskLevel },
        { name: "Ulat Daun", reason: "Curah hujan ringan berulang", risk: "Sedang" as RiskLevel },
        { name: "Kutu Daun", reason: "Cuaca panas & angin rendah", risk: "Sedang" as RiskLevel },
        { name: "Thrips", reason: "Cuaca panas-kering sela lembap", risk: "Sedang" as RiskLevel },
      ],
    };
  }, []);

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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
            </Pressable>
            <View style={styles.headerAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Risiko Hama</Text>
              <Text style={styles.subtitle}>
                Highlight potensi hama dari pola cuaca untuk tindakan pencegahan dini
              </Text>
            </View>
          </View>

          {/* Decorative subtle (biar ga boring) */}
          <Animated.View style={[styles.decoRow, decoStyle]}>
            <View style={styles.decoDot} />
            <View style={[styles.decoDot, { opacity: 0.6 }]} />
            <View style={[styles.decoDot, { opacity: 0.35 }]} />
            <Text style={styles.decoText}>Monitoring • Early Awareness • Preventive</Text>
          </Animated.View>

          {/* Lokasi & risiko */}
          <AnimatedCard delay={80}>
            <View style={styles.strip}>
              <View style={styles.stripLeft}>
                <MaterialCommunityIcons name="map-marker" size={18} color={GREEN} />
                <Text style={styles.stripText}>
                  <Text style={styles.stripBold}>{data.location}</Text> • Lembab & Panas
                </Text>
              </View>

              <View style={styles.badgeWrap}>
                <View style={[styles.badge, badgeStyle(data.pestRisk)]}>
                  <Text style={[styles.badgeText, badgeTextStyle(data.pestRisk)]}>
                    Risiko {data.pestRisk}
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* Faktor Cuaca */}
          <AnimatedCard delay={140}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name="weather-cloudy" size={22} color={GREEN} />
                <Text style={styles.cardTitle}>Faktor Cuaca Pemicu</Text>
                <MaterialCommunityIcons name="leaf" size={16} color="rgba(47,111,27,0.35)" />
              </View>

              <View style={styles.kpiRow}>
                <View style={styles.kpi}>
                  <Text style={styles.kpiValue}>{data.tempC}°C</Text>
                  <Text style={styles.kpiLabel}>Suhu</Text>
                </View>
                <View style={styles.kpi}>
                  <Text style={styles.kpiValue}>{data.humidity}%</Text>
                  <Text style={styles.kpiLabel}>Kelembapan</Text>
                </View>
                <View style={styles.kpi}>
                  <Text style={styles.kpiValue}>{data.rainMm} mm</Text>
                  <Text style={styles.kpiLabel}>Hujan</Text>
                </View>
              </View>

              <Text style={styles.desc}>
                Kondisi lembap + suhu hangat biasanya meningkatkan aktivitas hama dan mempercepat
                siklus hidupnya. Gunakan info ini sebagai “early awareness”, bukan diagnosis final.
              </Text>
            </View>
          </AnimatedCard>

          {/* Highlight cards (lebih WOW tapi masih relevan) */}
          <AnimatedCard delay={200}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name="lightbulb-on" size={22} color={GREEN} />
                <Text style={styles.cardTitle}>Highlight Pola Cuaca</Text>
              </View>

              <View style={{ gap: 10 }}>
                {data.highlights.map((h, idx) => (
                  <View key={idx} style={styles.highlightItem}>
                    <View style={styles.highlightIcon}>
                      <MaterialCommunityIcons
                        name={h.icon as any}
                        size={20}
                        color={GREEN}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.highlightTitle}>{h.title}</Text>
                      <Text style={styles.highlightDesc}>{h.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedCard>

          {/* Daftar Hama (tap micro-motion) */}
          <AnimatedCard delay={260}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name="bug-outline" size={22} color={GREEN} />
                <Text style={styles.cardTitle}>Hama yang Berpotensi Muncul</Text>
              </View>

              {data.dominantPests.map((p, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.pestItem,
                    pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
                    i === data.dominantPests.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.pestName}>{p.name}</Text>
                    <Text style={styles.pestReason}>{p.reason}</Text>
                  </View>

                  <View style={[styles.badgeSm, badgeStyle(p.risk)]}>
                    <Text style={[styles.badgeTextSm, badgeTextStyle(p.risk)]}>{p.risk}</Text>
                  </View>
                </Pressable>
              ))}

              <Text style={styles.smallHint}>
                Tip: tap item untuk melihat micro-motion (demo).
              </Text>
            </View>
          </AnimatedCard>

          {/* Saran Pencegahan */}
          <AnimatedCard delay={320}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <MaterialCommunityIcons name="shield-check-outline" size={22} color={GREEN} />
                <Text style={styles.cardTitle}>Saran Pencegahan Dini</Text>
              </View>

              <View style={styles.actionRow}>
                <MaterialCommunityIcons name="magnify" size={18} color={GREEN} />
                <Text style={styles.actionItem}>
                  Lakukan pengamatan rutin (bawah daun, batang, titik tumbuh).
                </Text>
              </View>

              <View style={styles.actionRow}>
                <MaterialCommunityIcons name="broom" size={18} color={GREEN} />
                <Text style={styles.actionItem}>
                  Jaga kebersihan lahan: gulma & sisa tanaman dibersihkan berkala.
                </Text>
              </View>

              <View style={styles.actionRow}>
                <MaterialCommunityIcons name="arrow-expand-horizontal" size={18} color={GREEN} />
                <Text style={styles.actionItem}>
                  Atur jarak tanam agar sirkulasi udara lebih baik, daun cepat kering.
                </Text>
              </View>

              <View style={styles.actionRow}>
                <MaterialCommunityIcons name="spray" size={18} color={GREEN} />
                <Text style={styles.actionItem}>
                  Pertimbangkan pestisida nabati sebagai langkah awal (sesuai kebutuhan).
                </Text>
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>Catatan Demo</Text>
                <Text style={styles.noteText}>
                  Semua data masih dummy untuk mengejar deadline. Nantinya bisa dihubungkan ke API
                  cuaca + histori serangan hama per desa.
                </Text>
              </View>
            </View>
          </AnimatedCard>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  bgDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgBlob: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(34,197,94,0.12)",
    top: -80,
    right: -90,
  },
  bgBlobTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(59,130,246,0.10)",
    bottom: -110,
    left: -80,
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
  subtitle: { fontSize: 12, color: MUTED, fontWeight: "600", marginTop: 2 },

  // Decorative row
  decoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  decoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(47,111,27,0.35)",
  },
  decoText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(17,24,39,0.55)",
  },

  strip: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginBottom: 12,
    gap: 10,
  },
  stripLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  stripText: { fontWeight: "800", color: "#111827" },
  stripBold: { fontWeight: "900" },
  badgeWrap: { paddingRight: 6 }, // ✅ biar badge ga mepet kanan

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
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111827", flex: 1 },

  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  kpi: {
    flex: 1,
    backgroundColor: "rgba(47,111,27,0.08)",
    borderRadius: 16,
    padding: 12,
  },
  kpiValue: { fontSize: 18, fontWeight: "900", color: GREEN },
  kpiLabel: { fontSize: 12, fontWeight: "700", color: MUTED, marginTop: 2 },

  desc: { marginTop: 6, color: MUTED, fontWeight: "600", lineHeight: 18 },

  // Highlight
  highlightItem: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(47,111,27,0.06)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.10)",
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightTitle: { fontWeight: "900", color: "#111827" },
  highlightDesc: { marginTop: 2, fontSize: 12, color: MUTED, fontWeight: "600", lineHeight: 16 },

  // Pest list
  pestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  pestName: { fontWeight: "900", color: "#111827" },
  pestReason: { fontSize: 12, color: MUTED, fontWeight: "600", marginTop: 2 },
  smallHint: { marginTop: 10, fontSize: 12, color: MUTED, fontWeight: "600" },

  // Actions
  actionRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 10 },
  actionItem: { color: MUTED, fontWeight: "600", lineHeight: 18, flex: 1 },

  noteBox: {
    marginTop: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  noteTitle: { fontWeight: "900", color: "#111827", marginBottom: 4 },
  noteText: { color: MUTED, fontWeight: "600", lineHeight: 18 },

  // Badges
  badge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeText: { fontWeight: "900", fontSize: 12 },

  badgeSm: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  badgeTextSm: { fontWeight: "900", fontSize: 12 },

  badgeHigh: { backgroundColor: "rgba(239,68,68,0.16)" },
  badgeMid: { backgroundColor: "rgba(245,158,11,0.18)" },
  badgeLow: { backgroundColor: "rgba(34,197,94,0.18)" },

  badgeTextHigh: { color: "#ef4444" },
  badgeTextMid: { color: "#f59e0b" },
  badgeTextLow: { color: "#22c55e" },
});
