import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

type HazardType =
  | "Hujan Lebat"
  | "Angin Kencang"
  | "Badai Petir"
  | "Banjir"
  | "Gelombang Panas"
  | "Kabut Tebal";

type Hazard = {
  id: string;
  type: HazardType;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  severity: Severity;

  startTime: string;
  endTime: string;
  durationEst: string;

  affectedArea: string;
  nearbyAreas: string[];

  likelihood: number; // 0-100
  actions: string[];
  details: string;
};

type HistoryItem = {
  id: string;
  type: HazardType;
  severity: Severity;
  title: string;
  time: string;
  areas: string;
  status: "Berlangsung" | "Selesai";
};

function sevMeta(sev: Severity) {
  if (sev === "Aman") return { color: "#16a34a", bg: "#ecfdf5", border: "#bbf7d0" };
  if (sev === "Waspada") return { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
  return { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
}

function sevIcon(sev: Severity) {
  if (sev === "Aman") return "shield-check-outline";
  if (sev === "Waspada") return "alert-circle-outline";
  return "alert-octagon-outline";
}

function typeIcon(t: HazardType): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (t) {
    case "Hujan Lebat":
      return "weather-pouring";
    case "Angin Kencang":
      return "weather-windy";
    case "Badai Petir":
      return "weather-lightning-rainy";
    case "Banjir":
      return "waves";
    case "Gelombang Panas":
      return "weather-sunny-alert";
    case "Kabut Tebal":
      return "weather-fog";
    default:
      return "alert-circle-outline";
  }
}

function timeNowLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} WIB`;
}

function shortDateTimeLabel(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} WIB`;
}

export default function SiagaTaniPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animations
  const headerIn = useSharedValue(0);
  const subIn = useSharedValue(0);
  const cardOne = useSharedValue(0);
  const cardTwo = useSharedValue(0);
  const cardThree = useSharedValue(0);
  const glow = useSharedValue(0);
  const iconPulse = useSharedValue(0);
  const siren = useSharedValue(0);

  // Functional state
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(timeNowLabel());

  // Push notification (dummy)
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // SMS fallback
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsModal, setSmsModal] = useState(false);
  const [smsNumber, setSmsNumber] = useState("08");
  const [smsCarrier, setSmsCarrier] = useState<"Telkomsel" | "Indosat" | "XL" | "Tri" | "Smartfren">(
    "Telkomsel"
  );

  // Details modal
  const [selected, setSelected] = useState<Hazard | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // History
  const [historyOpen, setHistoryOpen] = useState(false);

  const hazards: Hazard[] = useMemo(
    () => [
      {
        id: "h1",
        type: "Hujan Lebat",
        title: "Potensi Hujan Lebat",
        subtitle: "Risiko genangan & jalan licin di area persawahan",
        icon: typeIcon("Hujan Lebat"),
        severity: "Siaga",
        startTime: shortDateTimeLabel(35),
        endTime: shortDateTimeLabel(185),
        durationEst: "± 2–3 jam",
        affectedArea: "Desa Anggrek (Blok A–C)",
        nearbyAreas: ["Desa Melati (utara)", "Desa Srikaya (sekitar sungai)"],
        likelihood: 78,
        actions: [
          "Hentikan penjemuran & pindahkan hasil panen ke tempat tertutup",
          "Bersihkan saluran air & buka jalur drainase utama",
          "Amankan pompa & peralatan listrik dari genangan",
        ],
        details:
          "Intensitas hujan diperkirakan meningkat pada fase konvektif. Risiko genangan lebih tinggi pada tanah liat dengan drainase buruk. Pantau ketinggian air di parit utama.",
      },
      {
        id: "h2",
        type: "Badai Petir",
        title: "Badai Petir Lokal",
        subtitle: "Petir & hujan singkat bisa muncul mendadak",
        icon: typeIcon("Badai Petir"),
        severity: "Waspada",
        startTime: shortDateTimeLabel(60),
        endTime: shortDateTimeLabel(140),
        durationEst: "± 1 jam",
        affectedArea: "Desa Kenanga (lahan terbuka)",
        nearbyAreas: ["Desa Anggrek (timur)", "Desa Padi (lembah)"],
        likelihood: 62,
        actions: [
          "Hindari berada di lahan terbuka saat petir aktif",
          "Jauhkan aktivitas dari pohon tinggi / tiang listrik",
          "Tunda penyemprotan (risiko drift & hujan)",
        ],
        details:
          "Badai petir bersifat lokal. Jika terdengar guntur, segera amankan aktivitas. Risiko meningkat untuk lahan terbuka dan area dekat jaringan listrik.",
      },
      {
        id: "h3",
        type: "Angin Kencang",
        title: "Angin Kencang Sore",
        subtitle: "Berpotensi merusak tanaman muda & greenhouse ringan",
        icon: typeIcon("Angin Kencang"),
        severity: "Waspada",
        startTime: shortDateTimeLabel(120),
        endTime: shortDateTimeLabel(250),
        durationEst: "± 2 jam",
        affectedArea: "Desa Melati (perbukitan)",
        nearbyAreas: ["Desa Kenanga (terbuka)"],
        likelihood: 55,
        actions: [
          "Perkuat ajir/penyangga tanaman",
          "Amankan plastik mulsa & penutup greenhouse",
          "Ikat bahan ringan agar tidak beterbangan",
        ],
        details:
          "Angin kencang bisa datang singkat namun berdampak. Prioritaskan penguatan struktur ringan dan pengamanan benda yang mudah terbang.",
      },
    ],
    []
  );

  const history: HistoryItem[] = useMemo(
    () => [
      {
        id: "his-1",
        type: "Hujan Lebat",
        severity: "Waspada",
        title: "Hujan lebat sore (peringatan dini)",
        time: "Kemarin • 15:10–17:00",
        areas: "Desa Padi, Desa Srikaya",
        status: "Selesai",
      },
      {
        id: "his-2",
        type: "Angin Kencang",
        severity: "Siaga",
        title: "Angin kencang (puncak singkat)",
        time: "3 hari lalu • 16:20–17:10",
        areas: "Desa Kenanga",
        status: "Selesai",
      },
      {
        id: "his-3",
        type: "Badai Petir",
        severity: "Waspada",
        title: "Badai petir lokal",
        time: "Minggu ini • 13:30–14:30",
        areas: "Desa Anggrek (timur)",
        status: "Berlangsung",
      },
    ],
    []
  );

  const overallSeverity: Severity = useMemo(() => {
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
    opacity: overallSeverity === "Siaga" ? 0.95 : 0,
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
      await new Promise((r) => setTimeout(r, 650));
      setUpdatedAt(timeNowLabel());
    } finally {
      setRefreshing(false);
    }
  };

  const onTogglePush = () => {
    if (!pushSubscribed) {
      setPushSubscribed(true);
      Alert.alert(
        "Push Notification aktif ✅",
        "SiagaTani akan mengirim notifikasi bahaya cuaca secara real-time saat ada peringatan baru / meningkat.",
        [{ text: "OK" }]
      );
      return;
    }
    Alert.alert("Push sudah aktif", "Mau nonaktifkan push notification?", [
      { text: "Batal", style: "cancel" },
      { text: "Nonaktifkan", style: "destructive", onPress: () => setPushSubscribed(false) },
    ]);
  };

  const openSmsSetup = () => setSmsModal(true);

  const saveSmsSetup = () => {
    const cleaned = smsNumber.replace(/[^\d]/g, "");
    if (cleaned.length < 10) {
      Alert.alert("Nomor belum valid", "Masukkan nomor HP minimal 10 digit (contoh: 08xxxxxxxxxx).");
      return;
    }
    setSmsNumber(cleaned);
    setSmsEnabled(true);
    setSmsModal(false);
    Alert.alert(
      "SMS Fallback aktif ✅",
      "Jika push tidak tersedia / pengguna non-smartphone, peringatan akan dikirim via SMS ke nomor yang didaftarkan.",
      [{ text: "OK" }]
    );
  };

  const disableSms = () => {
    Alert.alert("Nonaktifkan SMS Fallback?", "Peringatan via SMS akan dihentikan.", [
      { text: "Batal", style: "cancel" },
      { text: "Nonaktifkan", style: "destructive", onPress: () => setSmsEnabled(false) },
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

  const quickSmsPreview = () => {
    const top = hazards[0];
    Alert.alert(
      "SMS Fallback",
      `SIAGATANI: ${top.type} (${top.severity})\nDurasi: ${top.durationEst} (${top.startTime}-${top.endTime})\nArea: ${top.affectedArea}\nTerdampak lain: ${top.nearbyAreas.join(", ")}\nSaran: ${top.actions[0]}`,
      [{ text: "Tutup" }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(10, insets.top * 0.15) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ✅ Topbar with Back Button */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Animated.Text style={[styles.title, headerStyle]}>SiagaTani</Animated.Text>
            <Animated.Text style={[styles.sub, subStyle]}>
              Early Warning System • Push real-time + SMS fallback
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
              <Text style={[styles.bannerTitle, { color: overall.color }]}>Status Risiko: {overallSeverity}</Text>
              <Text style={styles.bannerSub}>
                Update terakhir <Text style={styles.bannerSubStrong}>{updatedAt}</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Notification Controls */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Notifikasi Bahaya</Text>
          <Text style={styles.sectionSub}>Push real-time + SMS fallback (penting untuk petani non-smartphone)</Text>
        </View>

        <View style={styles.controlsCard}>
          {/* Push */}
          <View style={styles.controlRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>Push Notification</Text>
              <Text style={styles.controlSub}>Peringatan real-time saat risiko meningkat</Text>
            </View>

            <Pressable
              onPress={onTogglePush}
              style={[styles.pillBtn, pushSubscribed ? styles.pillBtnOn : styles.pillBtnOff]}
              hitSlop={10}
            >
              <MaterialCommunityIcons
                name={pushSubscribed ? "bell-check-outline" : "bell-outline"}
                size={18}
                color={pushSubscribed ? "#fff" : GREEN}
              />
              <Text style={[styles.pillBtnText, pushSubscribed ? { color: "#fff" } : { color: GREEN }]}>
                {pushSubscribed ? "Aktif" : "Aktifkan"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* SMS Fallback */}
          <View style={styles.controlRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.controlTitle}>SMS Fallback</Text>
              <Text style={styles.controlSub}>Untuk petani non-smartphone / saat push bermasalah</Text>

              <View style={{ marginTop: 8, gap: 6 }}>
                <View style={styles.inlineMeta}>
                  <MaterialCommunityIcons name="cellphone-message" size={16} color={MUTED} />
                  <Text style={styles.inlineMetaText}>
                    Nomor: <Text style={styles.inlineStrong}>{smsEnabled ? smsNumber : "—"}</Text>
                  </Text>
                </View>
                <View style={styles.inlineMeta}>
                  <MaterialCommunityIcons name="sim" size={16} color={MUTED} />
                  <Text style={styles.inlineMetaText}>
                    Provider: <Text style={styles.inlineStrong}>{smsCarrier}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {smsEnabled ? (
              <View style={{ gap: 8 }}>
                <Pressable onPress={quickSmsPreview} style={styles.smallBtn} hitSlop={10}>
                  <MaterialCommunityIcons name="message-text-outline" size={18} color={GREEN} />
                </Pressable>
                <Pressable
                  onPress={disableSms}
                  style={[styles.smallBtn, { borderColor: "#fecaca", backgroundColor: "#fef2f2" }]}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={openSmsSetup} style={styles.pillBtnOffWide} hitSlop={10}>
                <MaterialCommunityIcons name="cellphone-message" size={18} color={GREEN} />
                <Text style={[styles.pillBtnText, { color: GREEN }]}>Aktifkan</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Real-time alerts */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Peringatan Real-time</Text>
          <Text style={styles.sectionSub}>Ketuk untuk detail kejadian: jenis, durasi, area terdampak, dll</Text>
        </View>

        <Animated.View style={[cardStyle(cardOne), styles.cardWrap]}>
          <HazardCard hazard={hazards[0]} iconStyle={iconStyle} onPress={() => openDetails(hazards[0])} />
        </Animated.View>

        <Animated.View style={[cardStyle(cardTwo), styles.cardWrap]}>
          <HazardCard hazard={hazards[1]} iconStyle={iconStyle} onPress={() => openDetails(hazards[1])} />
        </Animated.View>

        <Animated.View style={[cardStyle(cardThree), styles.cardWrap]}>
          <HazardCard hazard={hazards[2]} iconStyle={iconStyle} onPress={() => openDetails(hazards[2])} />
        </Animated.View>

        {/* History */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Riwayat Peringatan</Text>
          <Text style={styles.sectionSub}>Catatan peringatan agar warga bisa evaluasi pola risiko</Text>
        </View>

        <Pressable onPress={() => setHistoryOpen(true)} style={styles.historyBtn} hitSlop={10}>
          <MaterialCommunityIcons name="history" size={18} color={GREEN} />
          <Text style={styles.historyText}>Buka Riwayat</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
        </Pressable>

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
            <Text style={styles.sheetTitle}>Detail Kejadian</Text>
            <Pressable onPress={closeDetails} style={styles.sheetClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color={MUTED} />
            </Pressable>
          </View>

          {selected ? (
            <View style={styles.sheetCard}>
              <View style={styles.sheetTop}>
                <MaterialCommunityIcons name={selected.icon} size={20} color={sevMeta(selected.severity).color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetHazTitle}>{selected.title}</Text>
                  <Text style={styles.sheetHazSub}>
                    Jenis: <Text style={styles.sheetStrong}>{selected.type}</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.pill,
                    { backgroundColor: sevMeta(selected.severity).bg, borderColor: sevMeta(selected.severity).border },
                  ]}
                >
                  <Text style={[styles.pillText, { color: sevMeta(selected.severity).color }]}>{selected.severity}</Text>
                </View>
              </View>

              <View style={styles.detailGrid}>
                <DetailBox icon="clock-outline" label="Timing" value={`${selected.startTime} – ${selected.endTime}`} />
                <DetailBox icon="timer-outline" label="Estimasi durasi" value={selected.durationEst} />
                <DetailBox icon="map-marker-radius-outline" label="Area utama" value={selected.affectedArea} />
                <DetailBox icon="map-marker-multiple-outline" label="Area terdampak lain" value={selected.nearbyAreas.join(", ")} />
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
                    Alert.alert("Disimpan ✅", "Peringatan ditandai untuk referensi. Kamu bisa cek di Riwayat.", [
                      { text: "OK" },
                    ]);
                  }}
                  style={styles.sheetBtn}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="bookmark-outline" size={18} color="#fff" />
                  <Text style={styles.sheetBtnText}>Simpan</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!smsEnabled) {
                      Alert.alert(
                        "SMS Fallback belum aktif",
                        "Aktifkan SMS fallback agar petani non-smartphone tetap menerima peringatan.",
                        [{ text: "OK" }]
                      );
                      return;
                    }
                    Alert.alert(
                      "Kirim via SMS (simulasi)",
                      `Dikirim ke ${smsNumber}.\n\nSIAGATANI: ${selected.type} (${selected.severity})\nDurasi: ${selected.durationEst}\nArea: ${selected.affectedArea}\nTerdampak lain: ${selected.nearbyAreas.join(", ")}`,
                      [{ text: "Tutup" }]
                    );
                  }}
                  style={styles.sheetBtnSecondary}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="cellphone-message" size={18} color={GREEN} />
                  <Text style={styles.sheetBtnSecondaryText}>SMS</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      {/* History modal */}
      <Modal transparent animationType="fade" visible={historyOpen} onRequestClose={() => setHistoryOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setHistoryOpen(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Riwayat Peringatan</Text>
            <Pressable onPress={() => setHistoryOpen(false)} style={styles.sheetClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color={MUTED} />
            </Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {history.map((h) => {
              const meta = sevMeta(h.severity);
              return (
                <View key={h.id} style={[styles.historyItem, { borderColor: meta.border }]}>
                  <View style={styles.historyTop}>
                    <MaterialCommunityIcons name={typeIcon(h.type)} size={18} color={meta.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTitle}>{h.title}</Text>
                      <Text style={styles.historySub}>
                        {h.time} • {h.areas}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: meta.bg, borderColor: meta.border }]}>
                      <Text style={[styles.pillText, { color: meta.color }]}>{h.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 10 }} />
        </View>
      </Modal>

      {/* SMS setup modal */}
      <Modal transparent animationType="fade" visible={smsModal} onRequestClose={() => setSmsModal(false)}>
        <TouchableWithoutFeedback onPress={() => setSmsModal(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Aktifkan SMS Fallback</Text>
            <Pressable onPress={() => setSmsModal(false)} style={styles.sheetClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color={MUTED} />
            </Pressable>
          </View>

          <View style={styles.sheetCard}>
            <Text style={styles.smsNote}>
              SMS fallback penting untuk petani non-smartphone. Peringatan tetap terkirim meski tidak ada push.
            </Text>

            <Text style={styles.inputLabel}>Nomor HP penerima</Text>
            <TextInput
              value={smsNumber}
              onChangeText={setSmsNumber}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Provider</Text>
            <View style={styles.providerRow}>
              {(["Telkomsel", "Indosat", "XL", "Tri", "Smartfren"] as const).map((p) => {
                const active = p === smsCarrier;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setSmsCarrier(p)}
                    style={[
                      styles.providerChip,
                      active && {
                        backgroundColor: "rgba(47,111,27,0.10)",
                        borderColor: "rgba(47,111,27,0.28)",
                      },
                    ]}
                  >
                    <Text style={[styles.providerChipText, active && { color: GREEN }]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => setSmsModal(false)} style={styles.sheetBtnSecondary} hitSlop={10}>
                <MaterialCommunityIcons name="close-circle-outline" size={18} color={GREEN} />
                <Text style={styles.sheetBtnSecondaryText}>Batal</Text>
              </Pressable>

              <Pressable onPress={saveSmsSetup} style={styles.sheetBtn} hitSlop={10}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                <Text style={styles.sheetBtnText}>Simpan</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 10 }} />
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
          <MaterialCommunityIcons name={hazard.icon} size={18} color={meta.color} />
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
          <Text style={styles.metaText}>
            {hazard.startTime} – {hazard.endTime}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="timer-outline" size={16} color={MUTED} />
          <Text style={styles.metaText}>{hazard.durationEst}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={MUTED} />
          <Text style={styles.metaText} numberOfLines={1}>
            {hazard.affectedArea}
          </Text>
        </View>
        <View style={styles.metaItemRight}>
          <MaterialCommunityIcons name="chevron-right" size={18} color={MUTED} />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${hazard.likelihood}%`, backgroundColor: meta.color }]} />
      </View>

      <Text style={styles.cardHint}>Ketuk untuk detail kejadian + area lain + tindakan + simpan</Text>
    </Pressable>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailBox}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name={icon} size={16} color={GREEN} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, paddingBottom: 28 },

  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },

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
    marginTop: 12,
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

  sectionHead: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  sectionSub: { marginTop: 4, fontSize: 12, color: MUTED, fontWeight: "700" },

  controlsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    padding: 14,
    gap: 12,
  },
  controlRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  controlTitle: { fontSize: 13, fontWeight: "900", color: TEXT },
  controlSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: MUTED, lineHeight: 16 },

  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillBtnOff: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  pillBtnOn: { backgroundColor: GREEN, borderColor: GREEN },
  pillBtnText: { fontWeight: "900", fontSize: 12 },

  pillBtnOffWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
  },

  divider: { height: 1, backgroundColor: "rgba(17,24,39,0.06)" },

  inlineMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  inlineMetaText: { color: MUTED, fontWeight: "800" },
  inlineStrong: { color: TEXT, fontWeight: "900" },

  smallBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#ecfdf5",
  },

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
  metaItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: MUTED, fontWeight: "800", fontSize: 12, flexShrink: 1 },
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

  historyBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyText: { flex: 1, color: TEXT, fontWeight: "900" },

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
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
  sheetText: { color: MUTED, fontWeight: "700", lineHeight: 18, marginTop: 6 },

  sheetSection: { marginTop: 8, color: TEXT, fontWeight: "900" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletText: { flex: 1, color: TEXT, fontWeight: "700", lineHeight: 18 },

  sheetFooter: { marginTop: 12, flexDirection: "row", gap: 10 },
  sheetBtn: {
    flex: 1,
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
    flex: 1,
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

  historyItem: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  historyTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyTitle: { fontWeight: "900", color: TEXT },
  historySub: { marginTop: 4, color: MUTED, fontWeight: "700", fontSize: 12 },

  detailGrid: { marginTop: 6, gap: 10 },
  detailBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  detailLabel: { color: MUTED, fontWeight: "900", fontSize: 12 },
  detailValue: { marginTop: 6, color: TEXT, fontWeight: "800", lineHeight: 18 },

  smsNote: { color: MUTED, fontWeight: "700", lineHeight: 18 },

  inputLabel: { fontSize: 12, fontWeight: "900", color: TEXT, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "800",
    color: TEXT,
  },
  providerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  providerChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.10)",
    backgroundColor: "rgba(17,24,39,0.03)",
  },
  providerChipText: { fontWeight: "900", color: TEXT, fontSize: 12 },

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
