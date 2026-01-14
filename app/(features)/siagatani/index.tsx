import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const GREEN = "#2f6f1b";

type Severity = "Aman" | "Waspada" | "Siaga";

type Hazard = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  severity: Severity;
  timeWindow: string;
  likelihood: number; // 0-100
  actions: string[];
  details: string;
};

function sevMeta(sev: Severity) {
  if (sev === "Aman") return { color: "#22c55e", bg: "#ecfdf5", border: "#bbf7d0" };
  if (sev === "Waspada") return { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
  return { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
}

function sevIcon(sev: Severity) {
  if (sev === "Aman") return "shield-check-outline";
  if (sev === "Waspada") return "alert-circle-outline";
  return "alert-octagon-outline";
}

function timeNowLabel() {
  // simple local time label without Intl (RN safe)
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} WIB`;
}

export default function SiagaTaniPage() {
  // Animations (existing + enhanced)
  const headerIn = useSharedValue(0);
  const subIn = useSharedValue(0);
  const cardOne = useSharedValue(0);
  const cardTwo = useSharedValue(0);
  const cardThree = useSharedValue(0);
  const glow = useSharedValue(0);
  const iconPulse = useSharedValue(0);
  const siren = useSharedValue(0);

  // Functional state (real-time feel)
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(timeNowLabel());
  const [subscribed, setSubscribed] = useState(false);

  const [selected, setSelected] = useState<Hazard | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Dummy hazards (replace later from Rainfall/Extreme/Pests)
  const hazards: Hazard[] = useMemo(
    () => [
      {
        id: "rain",
        title: "Hujan Sedang–Lebat",
        subtitle: "Risiko aktivitas di lahan terbuka & jalan licin",
        icon: "weather-rainy",
        severity: "Waspada",
        timeWindow: "13:00–17:00",
        likelihood: 72,
        actions: [
          "Tunda penjemuran hasil panen",
          "Siapkan terpal / cover alat",
          "Cek drainase & parit",
        ],
        details:
          "Prakiraan menunjukkan intensitas meningkat di siang–sore. Perubahan bisa terjadi jika awan konvektif terbentuk mendadak.",
      },
      {
        id: "wind",
        title: "Angin Kencang Lokal",
        subtitle: "Berpotensi merusak tanaman muda / penyangga",
        icon: "weather-windy",
        severity: "Siaga",
        timeWindow: "15:00–18:00",
        likelihood: 58,
        actions: [
          "Perkuat ajir / penyangga tanaman",
          "Amankan plastik mulsa & greenhouse",
          "Hindari pembakaran lahan saat angin",
        ],
        details:
          "Angin kencang dapat muncul singkat namun berdampak. Prioritaskan penguatan struktur ringan dan pengamanan benda yang mudah terbang.",
      },
      {
        id: "pest",
        title: "Kelembapan Tinggi",
        subtitle: "Memicu jamur & hama daun (monitoring)",
        icon: "bug-outline",
        severity: "Waspada",
        timeWindow: "Malam–Pagi",
        likelihood: 64,
        actions: [
          "Cek daun bawah & area lembap",
          "Atur jarak tanam / sirkulasi udara",
          "Pantau gejala jamur setelah hujan",
        ],
        details:
          "Kelembapan tinggi meningkatkan risiko jamur. Lakukan inspeksi ringan setelah hujan dan pastikan sirkulasi udara cukup.",
      },
    ],
    []
  );

  const overallSeverity: Severity = useMemo(() => {
    // Highest severity wins
    if (hazards.some((h) => h.severity === "Siaga")) return "Siaga";
    if (hazards.some((h) => h.severity === "Waspada")) return "Waspada";
    return "Aman";
  }, [hazards]);

  const overall = useMemo(() => sevMeta(overallSeverity), [overallSeverity]);

  useEffect(() => {
    headerIn.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    subIn.value = withDelay(80, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    cardOne.value = withDelay(160, withSpring(1, { damping: 14, stiffness: 140 }));
    cardTwo.value = withDelay(280, withSpring(1, { damping: 14, stiffness: 140 }));
    cardThree.value = withDelay(400, withSpring(1, { damping: 14, stiffness: 140 }));

    glow.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    iconPulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // Siren pulse only if Siaga
    if (overallSeverity === "Siaga") {
      siren.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      siren.value = withTiming(0, { duration: 300 });
    }
  }, [cardOne, cardTwo, cardThree, glow, headerIn, iconPulse, subIn, siren, overallSeverity]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerIn.value,
    transform: [{ translateY: 14 * (1 - headerIn.value) }],
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subIn.value,
    transform: [{ translateY: 10 * (1 - subIn.value) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + glow.value * 0.22,
    transform: [{ scale: 1 + glow.value * 0.06 }],
  }));

  const sirenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + siren.value * 0.10 }],
    opacity: overallSeverity === "Siaga" ? 0.9 : 0,
  }));

  const cardStyle = (progress: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [
        { translateY: 18 * (1 - progress.value) },
        { scale: 0.98 + 0.02 * progress.value },
      ],
    }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + iconPulse.value * 0.06 }],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // simulate fetch
      await new Promise((r) => setTimeout(r, 650));
      setUpdatedAt(timeNowLabel());
    } finally {
      setRefreshing(false);
    }
  };

  const onToggleSubscribe = () => {
    if (!subscribed) {
      setSubscribed(true);
      Alert.alert(
        "Peringatan aktif ✅",
        "Kami akan mengirim notifikasi jika ada perubahan risiko cuaca di wilayahmu.",
        [{ text: "OK" }]
      );
      return;
    }
    Alert.alert("Peringatan sudah aktif", "Mau nonaktifkan peringatan?", [
      { text: "Batal", style: "cancel" },
      { text: "Nonaktifkan", style: "destructive", onPress: () => setSubscribed(false) },
    ]);
  };

  const openDetails = (hazard: Hazard) => {
    setSelected(hazard);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelected(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Animated.Text style={[styles.title, headerStyle]}>SiagaTani</Animated.Text>
            <Animated.Text style={[styles.sub, subStyle]}>
              Peringatan bahaya cuaca & rekomendasi cepat untuk kesiapsiagaan warga
            </Animated.Text>
          </View>

          <Pressable onPress={onRefresh} style={styles.refreshPill} hitSlop={10}>
            <MaterialCommunityIcons name="refresh" size={18} color={GREEN} />
            <Text style={styles.refreshText}>Update</Text>
          </Pressable>
        </View>

        {/* Live status banner */}
        <Animated.View style={[styles.banner, { borderColor: overall.border, backgroundColor: overall.bg }]}>
          <View style={styles.bannerLeft}>
            <Animated.View style={sirenStyle}>
              <MaterialCommunityIcons name={sevIcon(overallSeverity) as any} size={20} color={overall.color} />
            </Animated.View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: overall.color }]}>
                Status: {overallSeverity}
              </Text>
              <Text style={styles.bannerSub}>
                Update terakhir <Text style={styles.bannerSubStrong}>{updatedAt}</Text> • Tarik ke bawah untuk refresh
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onToggleSubscribe}
            style={[styles.bannerBtn, subscribed ? styles.bannerBtnOn : styles.bannerBtnOff]}
            hitSlop={10}
          >
            <MaterialCommunityIcons
              name={subscribed ? "bell-check-outline" : "bell-outline"}
              size={18}
              color={subscribed ? "#fff" : GREEN}
            />
            <Text style={[styles.bannerBtnText, subscribed ? { color: "#fff" } : { color: GREEN }]}>
              {subscribed ? "Aktif" : "Aktifkan"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Alerts (real-time decision cards) */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Peringatan Real-time</Text>
          <Text style={styles.sectionSub}>Prioritas tertinggi untuk keputusan cepat</Text>
        </View>

        {/* Card 1 */}
        <Animated.View style={[cardStyle(cardOne), styles.cardWrap]}>
          <HazardCard hazard={hazards[0]} iconStyle={iconStyle} onPress={() => openDetails(hazards[0])} />
        </Animated.View>

        {/* Card 2 */}
        <Animated.View style={[cardStyle(cardTwo), styles.cardWrap]}>
          <HazardCard hazard={hazards[1]} iconStyle={iconStyle} onPress={() => openDetails(hazards[1])} />
        </Animated.View>

        {/* Card 3 */}
        <Animated.View style={[cardStyle(cardThree), styles.cardWrap]}>
          <HazardCard hazard={hazards[2]} iconStyle={iconStyle} onPress={() => openDetails(hazards[2])} />
        </Animated.View>

        {/* Quick actions */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <Text style={styles.sectionSub}>Langkah singkat untuk kesiapsiagaan komunitas</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Checklist siap ✅",
                "• Terpal/cover siap\n• Parit bersih\n• Penyangga tanaman dicek\n\nKamu bisa lanjut pantau peringatan.",
                [{ text: "OK" }]
              )
            }
            style={styles.actionBtn}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={GREEN} />
            <Text style={styles.actionText}>Checklist</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                "Broadcast warga",
                "Contoh pesan:\n“⚠️ SiagaTani: Potensi hujan 13:00–17:00. Hindari penjemuran, cek drainase, amankan alat.”",
                [{ text: "Tutup" }]
              )
            }
            style={styles.actionBtn}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="bullhorn-outline" size={18} color={GREEN} />
            <Text style={styles.actionText}>Broadcast</Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert("Kontak Darurat", "112 / BPBD setempat / Kepala Dusun", [{ text: "OK" }])}
            style={styles.actionBtn}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="phone-outline" size={18} color={GREEN} />
            <Text style={styles.actionText}>Darurat</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Details bottom sheet */}
      <Modal transparent animationType="fade" visible={showDetails} onRequestClose={closeDetails}>
        <TouchableWithoutFeedback onPress={closeDetails}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Detail Peringatan</Text>
            <Pressable onPress={closeDetails} style={styles.sheetClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color={MUTED} />
            </Pressable>
          </View>

          {selected ? (
            <View style={styles.sheetCard}>
              <View style={styles.sheetTop}>
                <MaterialCommunityIcons
                  name={selected.icon as any}
                  size={20}
                  color={sevMeta(selected.severity).color}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetHazTitle}>{selected.title}</Text>
                  <Text style={styles.sheetHazSub}>
                    {selected.timeWindow} • Kemungkinan{" "}
                    <Text style={styles.sheetStrong}>{selected.likelihood}%</Text>
                  </Text>
                </View>
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: sevMeta(selected.severity).bg,
                      borderColor: sevMeta(selected.severity).border,
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: sevMeta(selected.severity).color }]}>
                    {selected.severity}
                  </Text>
                </View>
              </View>

              <Text style={styles.sheetText}>{selected.details}</Text>

              <Text style={styles.sheetSection}>Rekomendasi tindakan</Text>
              <View style={{ gap: 8 }}>
                {selected.actions.map((a, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color={GREEN} />
                    <Text style={styles.bulletText}>{a}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.sheetFooter}>
                <Pressable
                  onPress={() => {
                    closeDetails();
                    Alert.alert(
                      "Tersimpan ✅",
                      "Peringatan ini ditandai sebagai prioritas. Kamu bisa cek lagi kapan pun.",
                      [{ text: "OK" }]
                    );
                  }}
                  style={styles.sheetBtn}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="bookmark-outline" size={18} color="#fff" />
                  <Text style={styles.sheetBtnText}>Tandai Prioritas</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Bagikan",
                      "Contoh pesan:\n“⚠️ SiagaTani: " +
                        selected.title +
                        " (" +
                        selected.timeWindow +
                        "). " +
                        selected.actions[0] +
                        ".”",
                      [{ text: "Tutup" }]
                    )
                  }
                  style={styles.sheetBtnSecondary}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="share-variant-outline" size={18} color={GREEN} />
                  <Text style={styles.sheetBtnSecondaryText}>Bagikan</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function HazardCard({
  hazard,
  iconStyle,
  onPress,
}: {
  hazard: Hazard;
  iconStyle: any;
  onPress: () => void;
}) {
  const meta = sevMeta(hazard.severity);

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderColor: meta.border }]} hitSlop={10}>
      <View style={styles.cardTopRow}>
        <Animated.View style={[styles.iconWrap, { backgroundColor: meta.bg, borderColor: meta.border }, iconStyle]}>
          <MaterialCommunityIcons name={hazard.icon as any} size={18} color={meta.color} />
        </Animated.View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{hazard.title}</Text>
          <Text style={styles.cardSub}>{hazard.subtitle}</Text>
        </View>

        <View style={[styles.pill, { backgroundColor: meta.bg, borderColor: meta.border }]}>
          <Text style={[styles.pillText, { color: meta.color }]}>{hazard.severity}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={MUTED} />
          <Text style={styles.metaText}>{hazard.timeWindow}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="percent-outline" size={16} color={MUTED} />
          <Text style={styles.metaText}>{hazard.likelihood}%</Text>
        </View>

        <View style={styles.metaItemRight}>
          <MaterialCommunityIcons name="chevron-right" size={18} color={MUTED} />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${hazard.likelihood}%`, backgroundColor: meta.color }]} />
      </View>

      <Text style={styles.cardHint}>Ketuk untuk lihat detail & tindakan cepat</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 28 },

  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 20, fontWeight: "900", color: TEXT },
  sub: { marginTop: 6, color: MUTED, fontWeight: "700" },

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
  refreshText: { color: GREEN, fontWeight: "900", fontSize: 12 },

  banner: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: "900" },
  bannerSub: { marginTop: 4, color: MUTED, fontWeight: "700", fontSize: 12 },
  bannerSubStrong: { color: TEXT, fontWeight: "900" },

  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  bannerBtnOff: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  bannerBtnOn: { backgroundColor: GREEN, borderColor: GREEN },
  bannerBtnText: { fontWeight: "900", fontSize: 12 },

  sectionHead: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sectionSub: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: "700" },

  cardWrap: { marginTop: 12 },
  card: {
    borderRadius: 18,
    backgroundColor: CARD,
    borderWidth: 1,
    padding: 14,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  cardSub: { marginTop: 2, fontSize: 12, color: MUTED, fontWeight: "700" },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontWeight: "900", fontSize: 12 },

  metaRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: MUTED, fontWeight: "800", fontSize: 12 },
  metaItemRight: { marginLeft: "auto" },

  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#eef2f7",
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 999 },

  cardHint: { marginTop: 8, color: MUTED, fontSize: 12, fontWeight: "700" },

  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
  },
  actionText: { color: GREEN, fontWeight: "900" },

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
  sheetTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetHazTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sheetHazSub: { marginTop: 2, color: MUTED, fontWeight: "800", fontSize: 12 },
  sheetStrong: { color: TEXT, fontWeight: "900" },
  sheetText: { color: MUTED, fontWeight: "700", lineHeight: 18, marginTop: 8 },

  sheetSection: { marginTop: 8, color: TEXT, fontWeight: "900" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletText: { flex: 1, color: TEXT, fontWeight: "700", lineHeight: 18 },

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

  sheetBtnSecondary: {
    borderRadius: 14,
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
  sheetBtnSecondaryText: { color: GREEN, fontWeight: "900" },

  glow: {
    position: "absolute",
    top: -120,
    right: -140,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#d9f5d2",
  },
});
