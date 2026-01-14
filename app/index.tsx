import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const TEXT = "#111827";
const MUTED = "#6b7280";
const { width } = Dimensions.get("window");

function PressScale({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
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

export default function Index() {
  const insets = useSafeAreaInsets();

  // Hero motion
  const float = useSharedValue(0);
  const glow = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    ring.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [float, glow, ring]);

  const heroFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [0, -10]) }],
  }));

  const glowAStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.25,
    transform: [{ scale: 1 + glow.value * 0.08 }],
  }));

  const glowBStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + glow.value * 0.22,
    transform: [{ scale: 1 + glow.value * 0.06 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.10 + ring.value * 0.12,
    transform: [{ scale: 1 + ring.value * 0.12 }],
  }));

  const heroImage = useMemo(
    () => ({
      uri: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=60",
    }),
    []
  );

  const onGetStarted = () => router.replace("/login");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Background */}
      <View style={styles.bgWrap}>
        <View style={styles.bgTop} />
        <Animated.View style={[styles.bgBlobA, glowAStyle]} />
        <Animated.View style={[styles.bgBlobB, glowBStyle]} />
      </View>

      <View style={[styles.root, { paddingTop: Math.max(insets.top * 0.15, 10) }]}>
        {/* Brand row */}
        <Animated.View entering={FadeInUp.duration(420)} style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>FarmShield360</Text>
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeIn.duration(520)} style={styles.heroWrap}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.heroCard, heroFloatStyle]}>
            <Image source={heroImage} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="shield-check-outline" size={14} color="#fff" />
                <Text style={styles.heroBadgeText}>Smart Farming • Climate Adaptive</Text>
              </View>

              <Text style={styles.heroTitle}>Bikin keputusan tanam lebih yakin.</Text>

              <View style={styles.heroPills}>
                <View style={styles.pill}>
                  <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="#fff" />
                  <Text style={styles.pillText}>Cuaca</Text>
                </View>
                <View style={styles.pill}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#fff" />
                  <Text style={styles.pillText}>Peringatan</Text>
                </View>
                <View style={styles.pill}>
                  <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
                  <Text style={styles.pillText}>AI Rekomendasi</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Minimal copy */}
        <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.copy}>
          <Text style={styles.copyTitle}>Siap mulai?</Text>
          <Text style={styles.copySub}>
            Pantau kondisi, terima alert cepat, dan dapatkan rekomendasi tanam adaptif.
          </Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.duration(520).delay(120)} style={styles.ctaWrap}>
          <PressScale onPress={onGetStarted}>
            <View style={styles.ctaBtn}>
              <View style={styles.ctaLeft}>
                <View style={styles.ctaIcon}>
                  <MaterialCommunityIcons name="rocket-launch-outline" size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.ctaTitle}>Get Started</Text>
                  <Text style={styles.ctaSub}>Sign Up</Text>
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
            </View>
          </PressScale>

          <PressScale onPress={() => router.replace("/login")}>
            <View style={styles.secondaryBtn}>
              <MaterialCommunityIcons name="account-outline" size={18} color={GREEN} />
              <Text style={styles.secondaryText}>Saya sudah punya akun</Text>
            </View>
          </PressScale>
        </Animated.View>

        {/* Footer note */}
        <Animated.View entering={FadeInDown.duration(520).delay(160)} style={styles.footer}>
          <Text style={styles.footerText}>© 2022-2026 inFinnityLabs. All Rights Reserved</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Background concept
  bgWrap: { ...StyleSheet.absoluteFillObject },
  bgTop: { position: "absolute", left: 0, right: 0, top: 0, height: 260, backgroundColor: "#eaf7ea" },
  bgBlobA: {
    position: "absolute",
    top: -120,
    right: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(47,111,27,0.18)",
  },
  bgBlobB: {
    position: "absolute",
    top: 160,
    left: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(200,255,157,0.45)",
  },

  root: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.select({ ios: 12, android: 14, default: 14 }),
    paddingBottom: 18,
  },

  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: GREEN },
  brandText: { color: TEXT, fontWeight: "900", fontSize: 16 },

  heroWrap: { marginTop: 14, alignItems: "center" },
  ring: {
    position: "absolute",
    top: 30,
    width: Math.min(380, width - 36),
    height: Math.min(380, width - 36),
    borderRadius: 999,
    backgroundColor: GREEN,
  },

  heroCard: {
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#0b2a18",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroImg: { width: "100%", height: 280 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },

  heroContent: { position: "absolute", left: 14, right: 14, bottom: 14 },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroBadgeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  heroTitle: {
    marginTop: 12,
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },

  heroPills: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pillText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  copy: { marginTop: 16 },
  copyTitle: { color: TEXT, fontWeight: "900", fontSize: 16 },
  copySub: { marginTop: 6, color: MUTED, fontWeight: "800", lineHeight: 18 },

  ctaWrap: { marginTop: 14, gap: 10 },

  ctaBtn: {
    backgroundColor: GREEN,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  ctaLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  ctaIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },
  ctaSub: { marginTop: 3, color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },

  secondaryBtn: {
    backgroundColor: "rgba(47,111,27,0.08)",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
  },
  secondaryText: { color: GREEN, fontWeight: "900" },

  footer: { marginTop: "auto", paddingTop: 12 },
  footerText: { color: MUTED, fontWeight: "800", textAlign: "center" },
});
