import React, { useEffect, useMemo } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSpring,
} from "react-native-reanimated";

const GREEN = "#2f6f1b";
const BG = "#16541eff";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BOTTOM_BAR_SPACE = 110;

function FadeUp({ delay, children }: { delay: number; children: React.ReactNode }) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, []);

  const a = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 14 }],
  }));

  return <Animated.View style={a}>{children}</Animated.View>;
}

function StatusPill({
  icon,
  text,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  text: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneStyle =
    tone === "ok"
      ? { backgroundColor: "rgba(200,255,157,0.16)", borderColor: "rgba(200,255,157,0.28)" }
      : tone === "warn"
      ? { backgroundColor: "rgba(251,191,36,0.18)", borderColor: "rgba(251,191,36,0.30)" }
      : { backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)" };

  return (
    <View style={[styles.pill, toneStyle]}>
      {icon}
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

function MiniMetric({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneBg =
    tone === "ok" ? "rgba(200,255,157,0.14)" : tone === "warn" ? "rgba(251,191,36,0.16)" : "rgba(255,255,255,0.10)";
  const toneBorder =
    tone === "ok" ? "rgba(200,255,157,0.22)" : tone === "warn" ? "rgba(251,191,36,0.22)" : "rgba(255,255,255,0.18)";

  return (
    <View style={[styles.metricCard, { backgroundColor: toneBg, borderColor: toneBorder }]}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={icon} size={16} color="#ffffff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function InsightCard() {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightGlowA} />
      <View style={styles.insightGlowB} />

      <View style={{ position: "absolute", right: -12, top: -14, opacity: 0.16 }}>
        <MaterialCommunityIcons name="sprout" size={140} color="white" />
      </View>

      <Text style={styles.insightKicker}>Today Insight</Text>

      <Text style={styles.insightTitle}>
        Rekomendasi Tanam:{" "}
        <Text style={{ color: "#c8ff9d" }}>
          Jagung 🌽
        </Text>
      </Text>

      <Text style={styles.insightDesc}>
        Berdasarkan simulasi cuaca & kelembapan hari ini, jagung cenderung paling stabil untuk 7–10 hari
        ke depan. Pantau kelembapan tanah setelah hujan sore.
      </Text>

      <View style={styles.insightRow}>
        <View style={styles.insightBadge}>
          <Ionicons name="time" size={16} color="white" />
          <Text style={styles.insightBadgeText}>Update: 2 jam</Text>
        </View>

        <View style={styles.insightBadge}>
          <Ionicons name="shield-checkmark" size={16} color="white" />
          <Text style={styles.insightBadgeText}>Status: Aman</Text>
        </View>

        <View style={styles.insightBadge}>
          <Ionicons name="water" size={16} color="white" />
          <Text style={styles.insightBadgeText}>Kelembapan: Tinggi</Text>
        </View>
      </View>
    </View>
  );
}

type CardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  delay: number;
  onPress: () => void;
  badge?: { text: string; tone: "ok" | "warn" | "neutral" };
};

function FeatureCard({ title, subtitle, icon, delay, onPress, badge }: CardProps) {
  const enter = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    enter.value = withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, []);

  const aEnter = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 14 }],
  }));

  const aPress = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const badgeStyle =
    badge?.tone === "ok"
      ? { backgroundColor: "rgba(200,255,157,0.18)", borderColor: "rgba(200,255,157,0.28)" }
      : badge?.tone === "warn"
      ? { backgroundColor: "rgba(251,191,36,0.18)", borderColor: "rgba(251,191,36,0.30)" }
      : { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.20)" };

  return (
    <Animated.View style={[{ width: "48.5%" }, aEnter]}>
      <Pressable
        onPressIn={() => {
          Haptics.selectionAsync();
          scale.value = withSpring(0.965, { damping: 16, stiffness: 180, mass: 0.8 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 180, mass: 0.8 });
        }}
        onPress={onPress}
      >
        <Animated.View style={[styles.featureCard, aPress]}>
          <View style={styles.featureIconWrap}>{icon}</View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSub} numberOfLines={2}>
              {subtitle}
            </Text>
          </View>

          {badge ? (
            <View style={[styles.featureBadge, badgeStyle]}>
              <Text style={styles.featureBadgeText}>{badge.text}</Text>
            </View>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function QuickAction({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
    >
      <Ionicons name={icon} size={18} color={GREEN} />
      <Text style={styles.quickActionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Pressable>
  );
}

export default function Dashboard() {
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const glowA = useAnimatedStyle(() => ({
    opacity: 0.16 + glow.value * 0.18,
    transform: [{ scale: 1 + glow.value * 0.06 }],
  }));

  const glowB = useAnimatedStyle(() => ({
    opacity: 0.10 + glow.value * 0.12,
    transform: [{ scale: 1 + glow.value * 0.05 }],
  }));

  // Dummy summary (biar dashboard berasa “hidup”)
  const summary = useMemo(
    () => ({
      lahan: "Aman",
      cuaca: "Cerah Berawan",
      hujan: "0.6 mm",
      angin: "12 km/j",
      risk: "Rendah",
    }),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Soft header background */}
      <View style={styles.headerBg}>
        <Animated.View style={[styles.headerGlowA, glowA]} />
        <Animated.View style={[styles.headerGlowB, glowB]} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 56,
          paddingBottom: BOTTOM_BAR_SPACE,
        }}
      >
        {/* Header */}
        <FadeUp delay={40}>
          <View style={{ paddingHorizontal: 18 }}>
            <Text style={styles.hTitle}>FarmShield360</Text>
          </View>
        </FadeUp>

        {/* Insight card */}
        <FadeUp delay={240}>
          <View style={{ paddingHorizontal: 18, marginTop: 12 }}>
            <InsightCard />
          </View>
        </FadeUp>


        {/* Grid */}
        <View style={{ paddingHorizontal: 18, marginTop: 14, rowGap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <FeatureCard
              title="LangitCek"
              subtitle="Cuaca harian, rainfall, pests, & extreme"
              delay={360}
              icon={<Ionicons name="cloud" size={34} color={GREEN} />}
              onPress={() => router.push("/langitcek")}
              badge={{ text: "LIVE", tone: "ok" }}
            />
            <FeatureCard
              title="SiagaTani"
              subtitle="Peringatan bahaya cuaca & rekomendasi cepat"
              delay={420}
              icon={<Ionicons name="warning" size={34} color={GREEN} />}
              onPress={() => router.push("/siagatani")}
              badge={{ text: "ALERT", tone: "warn" }}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <FeatureCard
              title="PilihTanam"
              subtitle="Analisis komoditas & rekomendasi AI adaptif"
              delay={480}
              icon={<MaterialCommunityIcons name="sprout" size={36} color={GREEN} />}
              onPress={() => router.push("/pilihtanam")}
              badge={{ text: "AI", tone: "neutral" }}
            />
            <FeatureCard
              title="SahabatTani"
              subtitle="Cari koordinator desa terdekat via maps"
              delay={540}
              icon={<Ionicons name="people" size={34} color={GREEN} />}
              onPress={() => router.push("/sahabattani")}
              badge={{ text: "MAP", tone: "neutral" }}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 280,
    backgroundColor: GREEN,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerGlowA: {
    position: "absolute",
    top: -130,
    right: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(200,255,157,0.42)",
  },
  headerGlowB: {
    position: "absolute",
    bottom: -160,
    left: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  hTitle: { color: "white", fontSize: 32, fontWeight: "900" },
  hSub: { color: "rgba(255,255,255,0.88)", marginTop: 6, fontWeight: "700" },

  sectionTitle: { fontSize: 14, fontWeight: "900", color: TEXT },

  pillRow: {
    paddingHorizontal: 18,
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { color: "white", fontWeight: "800" },

  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: { color: "rgba(255,255,255,0.86)", fontWeight: "800", fontSize: 12 },
  metricValue: { marginTop: 2, color: "#fff", fontWeight: "900" },

  insightCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    padding: 18,
    overflow: "hidden",
  },
  insightGlowA: {
    position: "absolute",
    top: -90,
    right: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(200,255,157,0.22)",
  },
  insightGlowB: {
    position: "absolute",
    bottom: -110,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  insightKicker: { color: "rgba(255,255,255,0.85)", fontWeight: "900" },
  insightTitle: { color: "white", fontSize: 22, fontWeight: "900", marginTop: 8, lineHeight: 28 },
  insightDesc: { color: "rgba(255,255,255,0.86)", marginTop: 8, lineHeight: 20, fontWeight: "700" },
  insightRow: { flexDirection: "row", gap: 10, marginTop: 14, flexWrap: "wrap" },
  insightBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightBadgeText: { color: "white", fontWeight: "800" },

  quickAction: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  quickActionText: { flex: 1, color: TEXT, fontWeight: "900" },

  featureCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  featureIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(47,111,27,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 18, fontWeight: "900", color: TEXT },
  featureSub: { marginTop: 4, fontSize: 12, fontWeight: "800", color: MUTED, textAlign: "center" },

  featureBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  featureBadgeText: { color: TEXT, fontWeight: "900", fontSize: 11 },
});
