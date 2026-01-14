import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import SeedLoadingOverlay from "../../../components/SeedLoadingOverlay";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const CARD = "#ffffff";
const MUTED = "#6b7280";
const { width } = Dimensions.get("window");

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
};

type DesaKey =
  | "Desa Anggrek"
  | "Desa Melati"
  | "Desa Padi"
  | "Desa Srikaya"
  | "Desa Kenanga";

type DesaProfile = {
  label: DesaKey;
  hint: string; // teks kecil buat rasa "hidup"
  categories: {
    tempC: number;
    windKmh: number;
    rainMm: number;
    condition: "Cerah" | "Berawan" | "Hujan" | "Badai" | "Gerimis";
  };
};

type NotifType = "extreme" | "rain" | "wind" | "pests" | "info";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: NotifType;
  unread: boolean;
};

const notifMeta = (type: NotifType) => {
  switch (type) {
    case "extreme":
      return {
        icon: "alert-octagon-outline" as const,
        color: "#ef4444",
        bg: "rgba(239,68,68,0.10)",
      };
    case "rain":
      return {
        icon: "weather-rainy" as const,
        color: "#2563eb",
        bg: "rgba(37,99,235,0.10)",
      };
    case "wind":
      return {
        icon: "weather-windy" as const,
        color: "#0ea5e9",
        bg: "rgba(14,165,233,0.10)",
      };
    case "pests":
      return {
        icon: "bug-outline" as const,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
      };
    default:
      return {
        icon: "information-outline" as const,
        color: GREEN,
        bg: "rgba(47,111,27,0.10)",
      };
  }
};

// ✅ Dummy per desa (beda-beda tiap kategori)
const DESA_DATA: DesaProfile[] = [
  {
    label: "Desa Anggrek",
    hint: "Dataran rendah • Sawah irigasi",
    categories: { tempC: 34, windKmh: 12, rainMm: 0.6, condition: "Cerah" },
  },
  {
    label: "Desa Melati",
    hint: "Perbukitan • Kebun campuran",
    categories: { tempC: 29, windKmh: 18, rainMm: 2.4, condition: "Berawan" },
  },
  {
    label: "Desa Padi",
    hint: "Lembah • Lahan basah",
    categories: { tempC: 31, windKmh: 9, rainMm: 6.8, condition: "Hujan" },
  },
  {
    label: "Desa Srikaya",
    hint: "Dekat sungai • Risiko lembap",
    categories: { tempC: 28, windKmh: 14, rainMm: 4.1, condition: "Gerimis" },
  },
  {
    label: "Desa Kenanga",
    hint: "Terbuka • Angin kencang",
    categories: { tempC: 30, windKmh: 26, rainMm: 1.2, condition: "Badai" },
  },
];

export default function LangitCekIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ dropdown desa state
  const [desaOpen, setDesaOpen] = useState(false);
  const [selectedDesa, setSelectedDesa] = useState<DesaProfile>(DESA_DATA[0]);

  // ✅ Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Peringatan Hujan (Waspada)",
      body: "Potensi hujan sedang siang–sore. Tunda penjemuran hasil panen dan cek drainase.",
      time: "Baru saja",
      type: "rain",
      unread: true,
    },
    {
      id: "n2",
      title: "Angin Kencang Lokal",
      body: "Area terbuka berisiko hembusan kencang. Amankan terpal, mulsa, dan alat ringan.",
      time: "10 menit lalu",
      type: "wind",
      unread: true,
    },
    {
      id: "n3",
      title: "Kelembapan Tinggi → Risiko Jamur",
      body: "Pantau daun bawah & area lembap. Pastikan sirkulasi udara tanaman cukup.",
      time: "35 menit lalu",
      type: "pests",
      unread: false,
    },
    {
      id: "n4",
      title: "Info: Update Data Desa",
      body: "Data cuaca desa diperbarui. Tarik ke bawah (refresh) untuk kondisi terbaru.",
      time: "1 jam lalu",
      type: "info",
      unread: false,
    },
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const openNotif = () => setNotifOpen(true);
  const closeNotif = () => setNotifOpen(false);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => setNotifications([]);

  const openNotifItem = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const menus: MenuItem[] = useMemo(
    () => [
      {
        key: "extreme",
        label: "Extreme",
        icon: "weather-lightning-rainy",
        route: "/(features)/langitcek/extreme",
      },
      {
        key: "today",
        label: "Today",
        icon: "weather-partly-cloudy",
        route: "/(features)/langitcek/today",
      },
      {
        key: "pests",
        label: "Pests",
        icon: "bug",
        route: "/(features)/langitcek/pests",
      },
      {
        key: "rainfall",
        label: "Rainfall",
        icon: "weather-rainy",
        route: "/(features)/langitcek/rainfall",
      },
      {
        key: "siagatani",
        label: "SiagaTani",
        icon: "alert-circle",
        route: "/(features)/langitcek/siagatani",
      },
    ],
    []
  );

  // ✅ helper biar TS ga garis merah
  const goInstant = (path: string) => router.push(path as any);

  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const go = (path: string) => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setLoading(false);
      goInstant(path);
    }, 550);
  };

  const onPickDesa = (desa: DesaProfile) => {
    setDesaOpen(false);

    // gimmick loading kecil biar kerasa "fetch data"
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSelectedDesa(desa);
      setLoading(false);

      // contoh: tambah notif kecil ketika desa berubah (opsional, biar hidup)
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Info: Desa diperbarui",
          body: `Kamu sekarang memantau ${desa.label}. Kondisi: ${desa.categories.condition}.`,
          time: "Baru saja",
          type: "info",
          unread: true,
        },
        ...prev,
      ]);
    }, 450);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top * 0.15, 4) }]}>
        <SeedLoadingOverlay visible={loading} />

        {/* ✅ Modal dropdown desa */}
        <Modal
          visible={desaOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDesaOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={() => setDesaOpen(false)}
          >
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Pilih Desa</Text>

              {DESA_DATA.map((d) => {
                const active = d.label === selectedDesa.label;
                return (
                  <Pressable
                    key={d.label}
                    onPress={() => onPickDesa(d)}
                    style={({ pressed }) => [
                      styles.sheetItem,
                      active && styles.sheetItemActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sheetItemText, active && { color: GREEN }]}>
                        {d.label}
                      </Text>
                      <Text style={styles.sheetItemHint}>{d.hint}</Text>
                    </View>
                    {active ? (
                      <MaterialCommunityIcons name="check-circle" size={22} color={GREEN} />
                    ) : (
                      <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
                    )}
                  </Pressable>
                );
              })}

              <Pressable onPress={() => setDesaOpen(false)} style={styles.sheetClose}>
                <Text style={styles.sheetCloseText}>Tutup</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ✅ Modal Notifications */}
        <Modal
          visible={notifOpen}
          transparent
          animationType="fade"
          onRequestClose={closeNotif}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={closeNotif}>
            <TouchableOpacity activeOpacity={1} style={styles.notifSheet}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>Notifikasi</Text>
                <Pressable onPress={closeNotif} style={styles.notifClose} hitSlop={10}>
                  <MaterialCommunityIcons name="close" size={18} color={MUTED} />
                </Pressable>
              </View>

              <View style={styles.notifActions}>
                <Pressable onPress={markAllRead} style={styles.notifActionBtn} hitSlop={10}>
                  <MaterialCommunityIcons name="check-all" size={18} color={GREEN} />
                  <Text style={styles.notifActionText}>Tandai dibaca</Text>
                </Pressable>

                <Pressable onPress={clearAll} style={styles.notifActionBtn} hitSlop={10}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={GREEN} />
                  <Text style={styles.notifActionText}>Hapus semua</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
                {notifications.length === 0 ? (
                  <View style={styles.emptyNotif}>
                    <MaterialCommunityIcons name="bell-outline" size={26} color="#9ca3af" />
                    <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
                    <Text style={styles.emptySub}>Nanti peringatan cuaca & hama muncul di sini.</Text>
                  </View>
                ) : (
                  notifications.map((n) => {
                    const meta = notifMeta(n.type);
                    return (
                      <Pressable
                        key={n.id}
                        onPress={() => openNotifItem(n.id)}
                        style={({ pressed }) => [
                          styles.notifItem,
                          n.unread && styles.notifItemUnread,
                          pressed && { opacity: 0.92 },
                        ]}
                      >
                        <View
                          style={[
                            styles.notifIconWrap,
                            { backgroundColor: meta.bg, borderColor: meta.bg },
                          ]}
                        >
                          <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.notifTopRow}>
                            <Text style={styles.notifItemTitle}>{n.title}</Text>
                            {n.unread ? <View style={styles.dotUnread} /> : null}
                          </View>
                          <Text style={styles.notifItemBody}>{n.body}</Text>
                          <Text style={styles.notifTime}>{n.time}</Text>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
            </Pressable>

            <View style={styles.userWrap}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.userName}>Ditha</Text>
                <Text style={styles.userRole}>Petani</Text>
              </View>
            </View>

            <View style={styles.topActions}>
              {/* ✅ bell clickable + badge */}
              <Pressable onPress={openNotif} style={styles.iconBtn} hitSlop={10}>
                <MaterialCommunityIcons
                  name={unreadCount > 0 ? "bell-badge-outline" : "bell-outline"}
                  size={22}
                  color="#111827"
                />
                {unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : String(unreadCount)}</Text>
                  </View>
                ) : null}
              </Pressable>

              <Pressable style={styles.iconBtn} hitSlop={10}>
                <MaterialCommunityIcons name="menu" size={24} color="#111827" />
              </Pressable>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>
              Langit{"\n"}
              <Text style={styles.heroAccent}>Cek</Text>
            </Text>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1517758478390-c89333af4642?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhdXRpZnVsJTIwc2t5fGVufDB8fDB8fHww",
              }}
              style={styles.heroImg}
              resizeMode="cover"
            />

            {/* 5 menu */}
            <View style={styles.menuRow}>
              {menus.map((m, idx) => (
                <Pressable
                  key={m.key}
                  onPress={() => go(m.route)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
                    idx === 1 && styles.menuItemActive,
                  ]}
                >
                  <View style={[styles.menuIconWrap, idx === 1 && styles.menuIconWrapActive]}>
                    <MaterialCommunityIcons name={m.icon} size={22} color={idx === 1 ? "#ffffff" : GREEN} />
                  </View>
                  <Text style={styles.menuLabel} numberOfLines={1}>
                    {m.label}
                    </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ✅ Strip jadi dropdown desa */}
          <Pressable onPress={() => setDesaOpen(true)} style={styles.strip}>
            <View style={styles.stripLeft}>
              <MaterialCommunityIcons name="map-marker" size={18} color={GREEN} />
              <Text style={styles.stripText}>
                <Text style={styles.stripBold}>{selectedDesa.label}</Text> • {selectedDesa.categories.condition}
              </Text>
            </View>

            <View style={styles.stripRight}>
              <Text style={styles.stripHint}>Pilih desa</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#9ca3af" />
            </View>
          </Pressable>

          {/* ✅ Categories berubah tiap desa */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori</Text>

            <View style={styles.catCard}>
              <View style={styles.catGrid}>
                <View style={styles.catItem}>
                  <Text style={styles.catValue}>{Math.round(selectedDesa.categories.tempC)}°C</Text>
                  <Text style={styles.catLabel}>Suhu</Text>
                </View>

                <View style={styles.catItem}>
                  <Text style={styles.catValue}>{Math.round(selectedDesa.categories.windKmh)} km/j</Text>
                  <Text style={styles.catLabel}>Angin</Text>
                </View>

                <View style={styles.catItem}>
                  <Text style={styles.catValue}>{selectedDesa.categories.rainMm.toFixed(1)} mm</Text>
                  <Text style={styles.catLabel}>Hujan</Text>
                </View>

                <View style={styles.catItem}>
                  <Text style={styles.catValue}>{selectedDesa.categories.condition}</Text>
                  <Text style={styles.catLabel}>Kondisi</Text>
                </View>
              </View>
            </View>

          </View>

          <View style={{ height: 14 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: Platform.select({ ios: 4, android: 8, default: 8 }),
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  userWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#d1d5db" },
  userName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  userRole: { fontSize: 12, color: MUTED, marginTop: -2 },
  topActions: { flexDirection: "row", gap: 6 },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 10 },

  heroCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroTitle: {
    position: "absolute",
    zIndex: 3,
    left: 18,
    top: 16,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: "900",
    color: "#ffffff",
  },
  heroAccent: { color: "#c8ff9d" },
  heroImg: {
    width: "100%",
    height: Math.min(260, width * 0.65),
    borderRadius: 18,
  },

  menuRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  menuItem: { alignItems: "center", flex: 1 },
  menuItemActive: {},
  menuIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(47,111,27,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconWrapActive: { backgroundColor: GREEN, borderColor: GREEN },
  menuLabel: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  strip: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  stripLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  stripText: { color: "#111827", fontWeight: "800" },
  stripBold: { fontWeight: "900" },
  stripRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  stripHint: { color: MUTED, fontSize: 12, fontWeight: "800" },

  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  sectionDesc: { marginTop: 8, color: MUTED, lineHeight: 18, fontWeight: "600" },

  catCard: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  catItem: {
    width: "48%",
    backgroundColor: "rgba(47,111,27,0.06)",
    borderRadius: 14,
    padding: 12,
  },
  catValue: { fontSize: 18, fontWeight: "900", color: "#111827" },
  catLabel: { marginTop: 4, color: MUTED, fontWeight: "700" },

  // Modal dropdown & notif share backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 10 },
  sheetItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.03)",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sheetItemActive: {
    backgroundColor: "rgba(47,111,27,0.08)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.25)",
  },
  sheetItemText: { fontSize: 14, fontWeight: "900", color: "#111827" },
  sheetItemHint: { marginTop: 2, fontSize: 12, fontWeight: "700", color: MUTED },
  sheetClose: {
    marginTop: 6,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetCloseText: { color: "#fff", fontWeight: "900" },

  // Notifications sheet
  notifSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    maxHeight: "78%",
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  notifTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  notifClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.04)",
  },

  notifActions: { flexDirection: "row", gap: 10, marginBottom: 10 },
  notifActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(47,111,27,0.06)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.18)",
  },
  notifActionText: { color: GREEN, fontWeight: "900" },

  notifItem: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.03)",
    marginBottom: 10,
  },
  notifItemUnread: {
    backgroundColor: "rgba(47,111,27,0.06)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.18)",
  },
  notifIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  notifItemTitle: { fontSize: 13, fontWeight: "900", color: "#111827", flex: 1 },
  dotUnread: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#ef4444" },
  notifItemBody: { marginTop: 4, color: MUTED, fontWeight: "700", lineHeight: 18 },
  notifTime: { marginTop: 6, color: "#9ca3af", fontWeight: "800", fontSize: 12 },

  emptyNotif: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "900", color: "#111827" },
  emptySub: { color: MUTED, fontWeight: "700", textAlign: "center", paddingHorizontal: 18 },
});
