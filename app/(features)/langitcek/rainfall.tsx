import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import RainLightAnimation from "../../../components/RainLightAnimation";

const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const GREEN = "#2f6f1b";

type Intensity = "Ringan" | "Sedang" | "Lebat";

type RainfallData = {
  villageName: string;
  updatedAtLabel: string;
  todayTotalMin: number;
  todayTotalMax: number;
  intensity: Intensity;
  startTime: string;
  endTime: string;
  hourly: { hour: string; mm: number }[];
};

function intensityMeta(intensity: Intensity) {
  switch (intensity) {
    case "Ringan":
      return {
        label: "Ringan",
        icon: "weather-partly-rainy",
        color: "#22c55e",
        badge: "Aman",
      };
    case "Sedang":
      return {
        label: "Sedang",
        icon: "weather-rainy",
        color: "#f59e0b",
        badge: "Waspada",
      };
    case "Lebat":
    default:
      return {
        label: "Lebat",
        icon: "weather-lightning-rainy",
        color: "#ef4444",
        badge: "Siaga",
      };
  }
}

function mmToLevel(mm: number): 0 | 1 | 2 | 3 {
  if (mm <= 0.2) return 0;
  if (mm <= 2) return 1;
  if (mm <= 6) return 2;
  return 3;
}

export default function RainfallPage() {
  const [refreshing, setRefreshing] = useState(false);

  // ✅ NEW states
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  // Dummy data (ganti nanti dari API/context)
  const data: RainfallData = useMemo(
    () => ({
      villageName: "Desa Sukamaju",
      updatedAtLabel: "07:30 WIB",
      todayTotalMin: 18,
      todayTotalMax: 25,
      intensity: "Sedang",
      startTime: "13:00",
      endTime: "17:00",
      hourly: [
        { hour: "10:00", mm: 0 },
        { hour: "11:00", mm: 0.2 },
        { hour: "12:00", mm: 0.4 },
        { hour: "13:00", mm: 3 },
        { hour: "14:00", mm: 6 },
        { hour: "15:00", mm: 8 },
        { hour: "16:00", mm: 4 },
        { hour: "17:00", mm: 1.2 },
        { hour: "18:00", mm: 0.5 },
      ],
    }),
    []
  );

  const meta = intensityMeta(data.intensity);

  const insights = useMemo(() => {
    const items: { type: "warn" | "ok"; text: string }[] = [];
    if (data.intensity === "Lebat") {
      items.push({ type: "warn", text: "Hindari aktivitas luar ruangan saat puncak hujan." });
      items.push({ type: "warn", text: "Periksa saluran air & area rawan genangan." });
      items.push({ type: "ok", text: "Siapkan perlindungan untuk hasil panen / alat." });
    } else if (data.intensity === "Sedang") {
      items.push({ type: "warn", text: "Hindari penjemuran hasil panen pada sore hari." });
      items.push({ type: "ok", text: "Cocok untuk irigasi alami (pantau drainase)." });
      items.push({ type: "warn", text: "Lahan rendah berisiko becek / licin." });
    } else {
      items.push({ type: "ok", text: "Aktivitas harian relatif aman dari hujan deras." });
      items.push({ type: "ok", text: "Siapkan jas hujan jika mendung menebal." });
    }
    return items;
  }, [data.intensity]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
    } finally {
      setRefreshing(false);
    }
  };

  const onToggleNotif = () => {
    console.log("[Rainfall] Notif button pressed"); // debug proof

    if (!notifEnabled) {
      setNotifEnabled(true);
      Alert.alert(
        "Notifikasi aktif ✅",
        `Kami akan mengirim pengingat jika hujan diperkirakan terjadi pada periode ${data.startTime}–${data.endTime} di ${data.villageName}.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Notifikasi sudah aktif",
      "Mau nonaktifkan notifikasi hujan?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Nonaktifkan", style: "destructive", onPress: () => setNotifEnabled(false) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Informasi Curah Hujan</Text>
            <Text style={styles.sub}>
              <Text style={styles.subStrong}>{data.villageName}</Text> • Update terakhir{" "}
              <Text style={styles.subStrong}>{data.updatedAtLabel}</Text>
            </Text>
          </View>

          <Pressable style={styles.refreshPill} onPress={onRefresh} hitSlop={10}>
            <MaterialCommunityIcons name="refresh" size={18} color={GREEN} />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          {/* ✅ IMPORTANT: animation must not capture touches */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <RainLightAnimation intensity={data.intensity} />
          </View>

          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Hari ini</Text>
              <Text style={styles.heroValue}>
                {data.todayTotalMin}–{data.todayTotalMax} <Text style={styles.heroUnit}>mm</Text>
              </Text>
              <Text style={styles.heroHint}>Perkiraan total curah hujan</Text>
            </View>

            <View style={[styles.badge, { borderColor: meta.color }]}>
              <MaterialCommunityIcons name={meta.icon as any} size={18} color={meta.color} />
              <Text style={[styles.badgeText, { color: meta.color }]}>{meta.badge}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottomRow}>
            <InfoChip icon="weather-rainy" label={`Intensitas: `} value={meta.label} valueColor={meta.color} />
            <InfoChip icon="clock-outline" label="Periode: " value={`${data.startTime}–${data.endTime}`} />
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Timeline Hujan per Jam</Text>
          <Text style={styles.sectionSub}>Biar kamu tahu kapan mulai & kapan reda</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineWrap}>
          {data.hourly.map((h) => (
            <HourPill key={h.hour} hour={h.hour} mm={h.mm} />
          ))}
        </ScrollView>

        {/* Intensity */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Pola Intensitas</Text>
          <Text style={styles.sectionSub}>Visual cepat untuk melihat puncak hujan</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.barsRow}>
            {data.hourly.map((h) => {
              const level = mmToLevel(h.mm);
              return (
                <View key={h.hour} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: level === 0 ? 6 : level === 1 ? 16 : level === 2 ? 28 : 40,
                          backgroundColor:
                            level <= 1 ? "#60a5fa" : level === 2 ? "#3b82f6" : "#1d4ed8",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barHour}>{h.hour.slice(0, 2)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <LegendDot label="Ringan" color="#60a5fa" />
            <LegendDot label="Sedang" color="#3b82f6" />
            <LegendDot label="Lebat" color="#1d4ed8" />
          </View>
        </View>

        {/* Insights */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Rekomendasi Hari Ini</Text>
          <Text style={styles.sectionSub}>Biar aktivitas harian & pertanian lebih aman</Text>
        </View>

        <View style={styles.card}>
          {insights.map((it, idx) => (
            <View key={idx} style={[styles.insightRow, idx !== 0 && { marginTop: 10 }]}>
              <MaterialCommunityIcons
                name={it.type === "warn" ? "alert-circle-outline" : "check-circle-outline"}
                size={20}
                color={it.type === "warn" ? "#f59e0b" : "#22c55e"}
              />
              <Text style={styles.insightText}>{it.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaRow}>
          <Pressable
            style={[styles.ctaBtn, notifEnabled && styles.ctaBtnEnabled]}
            onPress={onToggleNotif}
            hitSlop={12}
          >
            <MaterialCommunityIcons
              name={notifEnabled ? "bell-check-outline" : "bell-outline"}
              size={18}
              color="#fff"
            />
            <Text style={styles.ctaText}>
              {notifEnabled ? "Notifikasi Hujan Aktif" : "Aktifkan Notifikasi Hujan"}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => setShowSourceModal(true)} hitSlop={12}>
            <MaterialCommunityIcons name="information-outline" size={18} color={GREEN} />
            <Text style={styles.secondaryText}>Lihat Detail Sumber Data</Text>
          </Pressable>
        </View>

        {/* Source Data Modal */}
        <Modal transparent animationType="fade" visible={showSourceModal} onRequestClose={() => setShowSourceModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowSourceModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Detail Sumber Data</Text>
              <Pressable onPress={() => setShowSourceModal(false)} style={styles.sheetClose} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={18} color={MUTED} />
              </Pressable>
            </View>

            <View style={styles.sheetCard}>
              <RowKV icon="map-marker-outline" k="Lokasi" v={`${data.villageName} (area sekitar 3–7 km)`} />
              <RowKV icon="clock-outline" k="Update" v={data.updatedAtLabel} />
              <RowKV icon="database-outline" k="Sumber" v="BMKG (prakiraan) + model nowcasting lokal" />
              <RowKV icon="chart-timeline-variant" k="Resolusi" v="Per jam (hourly) + ringkasan harian" />
              <RowKV icon="satellite-variant" k="Input" v="Citra satelit awan + pola historis curah hujan" />
              <RowKV
                icon="alert-outline"
                k="Catatan"
                v="Perkiraan bisa berubah jika pembentukan awan konvektif terjadi mendadak. Gunakan Refresh untuk data terbaru."
              />
            </View>

            <View style={styles.sheetFooter}>
              <Pressable style={styles.sheetBtn} onPress={onRefresh} hitSlop={10}>
                <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
                <Text style={styles.sheetBtnText}>Perbarui Data Sekarang</Text>
              </Pressable>
              <Text style={styles.sheetFootnote}>
                Ditampilkan untuk membantu perencanaan aktivitas harian & pertanian.
              </Text>
            </View>
          </View>
        </Modal>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoChip({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value?: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon as any} size={18} color={MUTED} />
      <Text style={styles.chipText}>
        {label}
        {value ? <Text style={[styles.chipStrong, valueColor ? { color: valueColor } : null]}>{value}</Text> : null}
      </Text>
    </View>
  );
}

function HourPill({ hour, mm }: { hour: string; mm: number }) {
  const icon =
    mm <= 0.2 ? "weather-cloudy" : mm <= 2 ? "weather-partly-rainy" : mm <= 6 ? "weather-rainy" : "weather-pouring";

  return (
    <View style={styles.hourPill}>
      <Text style={styles.hourText}>{hour}</Text>
      <MaterialCommunityIcons name={icon as any} size={18} color="#2563eb" />
      <Text style={styles.mmText}>{mm.toFixed(mm < 1 ? 1 : 0)} mm</Text>
    </View>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function RowKV({ icon, k, v }: { icon: string; k: string; v: string }) {
  return (
    <View style={styles.rowKV}>
      <MaterialCommunityIcons name={icon as any} size={18} color={MUTED} />
      <View style={{ flex: 1 }}>
        <Text style={styles.k}>{k}</Text>
        <Text style={styles.v}>{v}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 28 },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 20, fontWeight: "800", color: TEXT },
  sub: { marginTop: 4, color: MUTED, fontSize: 12 },
  subStrong: { color: TEXT, fontWeight: "700" },

  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  refreshText: { color: GREEN, fontWeight: "800", fontSize: 12 },

  heroCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: CARD,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  heroTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  heroLeft: { flex: 1, paddingRight: 10 },
  heroLabel: { color: MUTED, fontWeight: "700" },
  heroValue: { marginTop: 4, fontSize: 28, fontWeight: "900", color: TEXT },
  heroUnit: { fontSize: 14, fontWeight: "800", color: MUTED },
  heroHint: { marginTop: 4, color: MUTED, fontSize: 12 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  badgeText: { fontWeight: "900", fontSize: 12 },

  heroDivider: { height: 1, backgroundColor: "#eef2f7", marginVertical: 12 },
  heroBottomRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { color: MUTED, fontWeight: "700", fontSize: 12 },
  chipStrong: { color: TEXT, fontWeight: "900" },

  sectionHead: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sectionSub: { marginTop: 4, fontSize: 12, color: MUTED },

  timelineWrap: { gap: 10, paddingVertical: 6 },
  hourPill: {
    width: 92,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    gap: 8,
  },
  hourText: { color: TEXT, fontWeight: "900" },
  mmText: { color: MUTED, fontWeight: "800", fontSize: 12 },

  card: {
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
  },

  barsRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  barCol: { width: 26, alignItems: "center", gap: 6 },
  barTrack: {
    width: 10,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#eef2ff",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: 10, borderRadius: 8 },
  barHour: { fontSize: 10, color: MUTED, fontWeight: "800" },

  legendRow: { marginTop: 12, flexDirection: "row", gap: 12, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  legendText: { color: MUTED, fontWeight: "800", fontSize: 12 },

  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  insightText: { flex: 1, color: TEXT, fontWeight: "700", lineHeight: 18 },

  ctaRow: { marginTop: 14, gap: 10 },
  ctaBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnEnabled: {
    opacity: 0.95,
  },
  ctaText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
  },
  secondaryText: { color: GREEN, fontWeight: "900" },

  // Modal / bottom sheet
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sheetClose: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sheetCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 12,
    gap: 10,
  },
  rowKV: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  k: { fontSize: 12, fontWeight: "900", color: TEXT },
  v: { marginTop: 2, fontSize: 12, color: MUTED, fontWeight: "700", lineHeight: 16 },

  sheetFooter: { marginTop: 12, gap: 10 },
  sheetBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sheetBtnText: { color: "#fff", fontWeight: "900" },
  sheetFootnote: { fontSize: 11, color: MUTED, textAlign: "center", fontWeight: "700" },
});
