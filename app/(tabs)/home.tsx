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

  // ✅ konten lebih “berisi” tapi tetap minim teks: chips + tiles + story cards
  const slides: Slide[] = useMemo(
    () => [
      {
        key: "s1",
        title: "Aman Hari Ini",
        sub: "Lahan stabil",
        icon: "shield-check-outline",
        tone: "ok",
        image: "https://ontariograinfarmer.ca/wp-content/uploads/2019/03/Canadian-Field-Print-Initiative-1.jpg",
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
        image: "https://i.pinimg.com/474x/5d/87/9d/5d879daf0aa949dbfcca1f5325491555.jpg",
      },
      {
        key: "st2",
        title: "PilihTanam",
        meta: "AI rekomendasi",
        icon: "robot-outline",
        image: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/8991/production/_104871253_1a76b03a-0a86-4ee3-85de-46f66d7f179e.jpg.webp",
      },
      {
        key: "st3",
        title: "SahabatTani",
        meta: "Koordinator",
        icon: "account-group-outline",
        image: "https://media.tampang.com/tm_images/article/202407/desain-tanpankde6dmtpqu39ezg.jpg",
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
            <PressScale onPress={goDashboard}>
              <View style={styles.miniBtn}>
                <MaterialCommunityIcons name="view-dashboard-outline" size={18} color={GREEN} />
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
});
