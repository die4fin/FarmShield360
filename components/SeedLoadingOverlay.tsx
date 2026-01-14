import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
};

export default function SeedLoadingOverlay({
  visible,
  title = "FarmShield360",
  subtitle = "Menyiapkan data…",
}: Props) {
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);
  const floaty = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    spin.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(1.0, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    floaty.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(6, { duration: 900, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [visible]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const seedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floaty.value }, { scale: pulse.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.seed, seedStyle]} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 22, 10, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  card: {
    width: 260,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
  },
  logoWrap: {
    width: 74,
    height: 74,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(47,111,27,0.22)",
    borderTopColor: "rgba(47,111,27,0.85)",
  },
  seed: {
    width: 22,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#2f6f1b",
    transform: [{ rotate: "18deg" }],
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f4c12",
    marginTop: 2,
  },
  sub: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.55)",
    marginTop: 6,
  },
});
