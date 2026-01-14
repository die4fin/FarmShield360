import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Platform,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";

const { width } = Dimensions.get("window");
const PAD = 18;
const HERO_W = width - PAD * 2;
const HERO_H = Math.round(HERO_W * 0.62);

type Tone = "ok" | "warn" | "info";

type Slide = {
  key: string;
  title: string;
  sub: string;
  image: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: Tone;
  chips: Array<{ icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }>;
};

type MiniTile = {
  key: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

type StoryCard = {
  key: string;
  image: string;
  title: string;
  meta: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type Notif = {
  id: string;
  title: string;
  message: string;
  time: string;
  tone?: Tone; // ok | warn | info
  read: boolean;
};

function toneChip(tone: Tone) {
  if (tone === "ok") return { bg: "rgba(34,197,94,0.16)", bd: "rgba(34,197,94,0.24)", tx: "#166534" };
  if (tone === "warn") return { bg: "rgba(245,158,11,0.18)", bd: "rgba(245,158,11,0.26)", tx: "#92400e" };
  return { bg: "rgba(96,165,250,0.16)", bd: "rgba(96,165,250,0.24)", tx: "#1e3a8a" };
}

function toneLabel(tone: Tone) {
  if (tone === "ok") return "";
  if (tone === "warn") return "";
  return "";
}

function PressScale({
  onPress,
  children,
  disabled,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        Haptics.selectionAsync();
        s.value = withSpring(0.985, { damping: 16, stiffness: 240, mass: 0.7 });
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 16, stiffness: 240, mass: 0.7 });
      }}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.98 }]}
    >
      <Animated.View style={a}>{children}</Animated.View>
    </Pressable>
  );
}

function Dot({ active }: { active: boolean }) {
  return <View style={[styles.dot, active && styles.dotActive]} />;
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);

  const goDashboard = () => router.push("/dashboard" as any);

  // 🔔 Notifications state
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifs, setNotifs] = useState<Notif[]>([
    {
      id: "n1",
      title: "Gerimis terdeteksi",
      message: "Perkiraan 15:00–17:00. Siapkan penutup bibit.",
      time: "2j",
      tone: "info",
      read: false,
    },
    {
      id: "n2",
      title: "Lembap tinggi",
      message: "Risiko jamur meningkat. Cek daun bagian bawah.",
      time: "5j",
      tone: "warn",
      read: false,
    },
    {
      id: "n3",
      title: "Update sensor",
      message: "Data cuaca diperbarui otomatis.",
      time: "1h",
      tone: "ok",
      read: true,
    },
  ]);

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  const openNotif = () => setNotifOpen(true);
  const closeNotif = () => setNotifOpen(false);

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifs([]);

  // ✅ konten lebih “berisi” tapi tetap minim teks: chips + tiles + story cards
  const slides: Slide[] = useMemo(
    () => [
      {
        key: "s1",
        title: "Aman Hari Ini",
        sub: "Lahan stabil",
        icon: "shield-check-outline",
        tone: "ok",
        image: "https://static.vecteezy.com/system/resources/thumbnails/070/373/832/small_2x/rural-landscape-view-of-farm-field-with-barn-and-green-rows-under-a-cloudy-sky-free-photo.jpg",
        chips: [
          { icon: "map-marker", text: "Anggrek" },
          { icon: "clock-outline", text: "Update 2j" },
          { icon: "weather-partly-cloudy", text: "Berawan" },
        ],
      },
      {
        key: "s2",
        title: "Gerimis Sore",
        sub: "15:00–17:00",
        icon: "weather-rainy",
        tone: "info",
        image: "https://media.istockphoto.com/id/1257951336/photo/transparent-umbrella-under-rain-against-water-drops-splash-background-rainy-weather-concept.jpg?s=612x612&w=0&k=20&c=lNvbIw1wReb-owe7_rMgW8lZz1zElqs5BOY1AZhyRXs=",
        chips: [
          { icon: "water-outline", text: "0–3 mm" },
          { icon: "weather-windy", text: "12 km/j" },
          { icon: "calendar-range", text: "Hari ini" },
        ],
      },
      {
        key: "s3",
        title: "Lembap Tinggi",
        sub: "Cek daun",
        icon: "water-percent",
        tone: "warn",
        image: "https://images.stockcake.com/public/0/f/a/0fac0121-abd8-44d2-acbf-9dcd7b6ca131_large/sunlit-forest-leaves-stockcake.jpg",
        chips: [
          { icon: "water-percent", text: "RH tinggi" },
          { icon: "bug-outline", text: "Risiko ↑" },
          { icon: "sprout-outline", text: "Pantau" },
        ],
      },
    ],
    []
  );

  const miniTiles: MiniTile[] = useMemo(
    () => [
      { key: "t1", icon: "thermometer", label: "Suhu", value: "35°C" },
      { key: "t2", icon: "weather-windy", label: "Angin", value: "12 km/j" },
      { key: "t3", icon: "water", label: "Hujan", value: "0–3 mm" },
      { key: "t4", icon: "water-percent", label: "Lembap", value: "Tinggi" },
    ],
    []
  );

  const stories: StoryCard[] = useMemo(
    () => [
      {
        key: "st1",
        title: "SiagaTani",
        meta: "Alert cepat",
        icon: "alert-circle-outline",
        image: "https://img.freepik.com/free-photo/weather-effects-collage-concept_23-2150062062.jpg?semt=ais_hybrid&w=740&q=80",
      },
      {
        key: "st2",
        title: "PilihTanam",
        meta: "AI rekomendasi",
        icon: "robot-outline",
        image: "https://www.fertilizewithalm.com/public_files/alm-s3-live/styles/large_1000x450/public/images/seedlings-iStock_000071360629_Large.webp?itok=4ZOSCH4D",
      },
      {
        key: "st3",
        title: "SahabatTani",
        meta: "Koordinator",
        icon: "account-group-outline",
        image: "https://cdn.wikifarmer.com/images/detailed/2023/08/Copy-of-Green-Farmer-Story-Presentation-2.jpg",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / HERO_W);
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* background: lebih “homey” & ringan */}
      <View style={styles.bgWrap}>
        <View style={styles.bgTop} />
        <View style={styles.bgBlobA} />
        <View style={styles.bgBlobB} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top * 0.08, 10) },
        ]}
      >
        {/* header mini */}
        <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>FarmShield360</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.locationPill}>
              <MaterialCommunityIcons name="account-circle" size={16} color={GREEN} />
              <Text style={styles.locationText}>Ditha</Text>
            </View>

            {/* 🔔 Notif button (replace dashboard icon) */}
            <PressScale onPress={openNotif}>
              <View style={styles.miniBtn}>
                <MaterialCommunityIcons name="bell-outline" size={18} color={GREEN} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                  </View>
                )}
              </View>
            </PressScale>
          </View>
        </Animated.View>

        {/* greeting singkat */}
        <Animated.View entering={FadeInDown.duration(520).delay(60)} style={styles.greetRow}>
          <Text style={styles.greetTitle}>Selamat datang 👋</Text>
        </Animated.View>

        {/* HERO slider */}
        <Animated.View entering={FadeInDown.duration(520).delay(110)} style={{ marginTop: 10 }}>
          <FlatList
            ref={listRef}
            data={slides}
            keyExtractor={(it) => it.key}
            horizontal
            pagingEnabled
            snapToInterval={HERO_W}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            renderItem={({ item }) => {
              const chip = toneChip(item.tone);
              return (
                <View style={{ width: HERO_W }}>
                  <PressScale onPress={goDashboard}>
                    <View style={styles.heroCard}>
                      <Image source={{ uri: item.image }} style={styles.heroImg} resizeMode="cover" />
                      <View style={styles.heroOverlay} />

                      {/* top row */}
                      <View style={styles.heroTopRow}>
                        <View style={styles.heroChipDark}>
                          <MaterialCommunityIcons name={item.icon} size={14} color="#fff" />
                          <Text style={styles.heroChipDarkText}>{item.title}</Text>
                        </View>

                        <View style={[styles.heroChipLight, { backgroundColor: chip.bg, borderColor: chip.bd }]}>
                          <Text style={[styles.heroChipLightText, { color: chip.tx }]}>{toneLabel(item.tone)}</Text>
                        </View>
                      </View>

                      {/* chips row (min text, banyak “info visual”) */}
                      <View style={styles.heroChipsRow}>
                        {item.chips.map((c, i) => (
                          <View key={`${item.key}_${i}`} style={styles.smallChip}>
                            <MaterialCommunityIcons name={c.icon} size={14} color="#fff" />
                            <Text style={styles.smallChipText}>{c.text}</Text>
                          </View>
                        ))}
                      </View>

                      {/* bottom minimal */}
                      <View style={styles.heroBottom}>
                        <Text style={styles.heroSub}>{item.sub}</Text>
                        <View style={styles.heroCTA}>
                          <Text style={styles.heroCTAText}>Dashboard</Text>
                          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                        </View>
                      </View>
                    </View>
                  </PressScale>
                </View>
              );
            }}
          />

          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <Dot key={String(i)} active={i === index} />
            ))}
          </View>
        </Animated.View>

        {/* mini tiles (lebih berisi, minim text) */}
        <Animated.View entering={FadeInDown.duration(520).delay(160)} style={styles.tilesWrap}>
          {miniTiles.map((t) => (
            <PressScale key={t.key} onPress={goDashboard}>
              <View style={styles.tile}>
                <View style={styles.tileIcon}>
                  <MaterialCommunityIcons name={t.icon} size={18} color={GREEN} />
                </View>
                <Text style={styles.tileValue}>{t.value}</Text>
                <Text style={styles.tileLabel}>{t.label}</Text>
              </View>
            </PressScale>
          ))}
        </Animated.View>

        {/* stories row (gambar kecil bisa di-scroll) */}
        <Animated.View entering={FadeInDown.duration(520).delay(210)} style={{ marginTop: 14 }}>
          <View style={styles.storyHead}>
            <Text style={styles.storyTitle}>Highlight</Text>
            <Text style={styles.storyHint}>Swipe</Text>
          </View>

          <FlatList
            data={stories}
            keyExtractor={(it) => it.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <PressScale onPress={goDashboard}>
                <View style={styles.storyCard}>
                  <Image source={{ uri: item.image }} style={styles.storyImg} resizeMode="cover" />
                  <View style={styles.storyOverlay} />
                  <View style={styles.storyBottom}>
                    <View style={styles.storyPill}>
                      <MaterialCommunityIcons name={item.icon} size={14} color="#fff" />
                      <Text style={styles.storyPillText}>{item.title}</Text>
                    </View>
                    <Text style={styles.storyMeta}>{item.meta}</Text>
                  </View>
                </View>
              </PressScale>
            )}
          />
        </Animated.View>

        {/* CTA singkat */}
        <Animated.View entering={FadeInDown.duration(520).delay(250)} style={{ marginTop: 14 }}>
          <PressScale onPress={goDashboard}>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Buka Dashboard</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </View>
          </PressScale>
        </Animated.View>

        <View style={{ height: 26 }} />
      </Animated.ScrollView>

      {/* 🔔 Notifications Panel */}
      {notifOpen && (
        <Pressable style={styles.modalBackdrop} onPress={closeNotif} />
      )}

      {notifOpen && (
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifikasi</Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Pressable onPress={markAllRead} hitSlop={10}>
                  <Text style={styles.sheetAction}>Tandai dibaca</Text>
                </Pressable>
                <Pressable onPress={clearAll} hitSlop={10}>
                  <Text style={[styles.sheetAction, { color: "#b91c1c" }]}>Hapus</Text>
                </Pressable>
              </View>
            </View>

            {notifs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Kosong</Text>
                <Text style={styles.emptySub}>Belum ada notifikasi baru.</Text>
              </View>
            ) : (
              <FlatList
                data={notifs}
                keyExtractor={(it) => it.id}
                contentContainerStyle={{ paddingBottom: 12 }}
                renderItem={({ item }) => {
                  const chip = toneChip(item.tone ?? "info");
                  return (
                    <Pressable
                      onPress={() => {
                        markRead(item.id);
                        // optional: buka dashboard/halaman terkait
                        // router.push("/dashboard" as any);
                      }}
                      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
                    >
                      <View
                        style={[
                          styles.notifDot,
                          { backgroundColor: chip.tx, opacity: item.read ? 0.3 : 1 },
                        ]}
                      />

                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                          <Text style={styles.notifTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.notifTime}>{item.time}</Text>
                        </View>

                        <Text style={styles.notifMsg} numberOfLines={2}>
                          {item.message}
                        </Text>

                        {!item.read && (
                          <View style={styles.unreadPill}>
                            <Text style={styles.unreadPillText}>Baru</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}

            <PressScale onPress={closeNotif}>
              <View style={styles.sheetClose}>
                <Text style={styles.sheetCloseText}>Tutup</Text>
              </View>
            </PressScale>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  bgWrap: { ...StyleSheet.absoluteFillObject },
  bgTop: { position: "absolute", left: 0, right: 0, top: 0, height: 260, backgroundColor: "#eaf7ea" },
  bgBlobA: {
    position: "absolute",
    top: -90,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(47,111,27,0.16)",
  },
  bgBlobB: {
    position: "absolute",
    top: 120,
    left: -150,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(200,255,157,0.42)",
  },

  content: {
    paddingHorizontal: PAD,
    paddingBottom: 18,
    paddingTop: Platform.select({ ios: 10, android: 12, default: 12 }),
  },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: GREEN },
  brandText: { color: TEXT, fontWeight: "900" },

  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  locationText: { color: TEXT, fontWeight: "900", fontSize: 12 },

  miniBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  // 🔔 badge
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.96)",
  },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 10 },

  greetRow: { marginTop: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  greetTitle: { fontSize: 22, fontWeight: "900", color: TEXT },
  greetSub: { color: MUTED, fontWeight: "800" },

  heroCard: {
    width: HERO_W,
    height: HERO_H,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    backgroundColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroImg: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.18)" },

  heroTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroChipDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroChipDarkText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  heroChipLight: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  heroChipLightText: { fontWeight: "900", fontSize: 12 },

  heroChipsRow: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 58,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  smallChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.26)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  smallChipText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  heroBottom: { position: "absolute", left: 14, right: 14, bottom: 14 },
  heroSub: { color: "rgba(255,255,255,0.92)", fontWeight: "900", fontSize: 16 },

  heroCTA: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(47,111,27,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroCTAText: { color: "#fff", fontWeight: "900" },

  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 99, backgroundColor: "rgba(17,24,39,0.18)" },
  dotActive: { width: 18, backgroundColor: "rgba(47,111,27,0.90)" },

  tilesWrap: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: (HERO_W - 10) / 2,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    gap: 8,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(47,111,27,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileValue: { color: TEXT, fontWeight: "900", fontSize: 16 },
  tileLabel: { color: MUTED, fontWeight: "800", fontSize: 12 },

  storyHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  storyTitle: { color: TEXT, fontWeight: "900", fontSize: 14 },
  storyHint: { color: MUTED, fontWeight: "800" },

  storyCard: {
    width: 170,
    height: 120,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    backgroundColor: "#ddd",
  },
  storyImg: { width: "100%", height: "100%" },
  storyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.18)" },
  storyBottom: { position: "absolute", left: 10, right: 10, bottom: 10, gap: 6 },
  storyPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  storyPillText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  storyMeta: { color: "rgba(255,255,255,0.92)", fontWeight: "800", fontSize: 12 },

  cta: {
    backgroundColor: GREEN,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  ctaText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  // 🔔 Notification sheet styles
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -10 },
    elevation: 8,
    maxHeight: "72%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sheetTitle: { color: TEXT, fontWeight: "900", fontSize: 16 },
  sheetAction: { color: GREEN, fontWeight: "900", fontSize: 12 },

  notifItem: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    backgroundColor: "rgba(255,255,255,0.96)",
    marginBottom: 10,
  },
  notifItemUnread: {
    borderColor: "rgba(47,111,27,0.18)",
    backgroundColor: "rgba(47,111,27,0.06)",
  },
  notifDot: { width: 10, height: 10, borderRadius: 99, marginTop: 4 },

  notifTitle: { color: TEXT, fontWeight: "900", fontSize: 13, flex: 1 },
  notifTime: { color: MUTED, fontWeight: "800", fontSize: 12 },
  notifMsg: { color: MUTED, fontWeight: "800", fontSize: 12 },

  unreadPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(47,111,27,0.12)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.20)",
  },
  unreadPillText: { color: GREEN, fontWeight: "900", fontSize: 11 },

  emptyBox: {
    paddingVertical: 22,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { color: TEXT, fontWeight: "900", fontSize: 14 },
  emptySub: { color: MUTED, fontWeight: "800", fontSize: 12 },

  sheetClose: {
    marginTop: 6,
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetCloseText: { color: "#fff", fontWeight: "900" },
});
