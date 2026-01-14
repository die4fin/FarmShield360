import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type Intensity = "Ringan" | "Sedang" | "Lebat";

const { width: W } = Dimensions.get("window");

function dropsCount(intensity: Intensity) {
  if (intensity === "Ringan") return 18;
  if (intensity === "Sedang") return 32;
  return 48;
}

function durationMs(intensity: Intensity) {
  if (intensity === "Ringan") return 1600;
  if (intensity === "Sedang") return 1200;
  return 900;
}

export default function RainLightAnimation({
  intensity = "Sedang",
}: {
  intensity?: Intensity;
}) {
  const H = 220; // tinggi area animasi
  const count = dropsCount(intensity);
  const dur = durationMs(intensity);

  // Generate drops once per intensity change
  const drops = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * (W - 20);
      const sizeH = 8 + Math.random() * 18;
      const sizeW = 1 + Math.random() * 2;
      const delay = Math.random() * 900;
      const opacity = 0.10 + Math.random() * 0.18;
      const drift = 4 + Math.random() * 10;
      return { key: `drop-${i}`, left, sizeH, sizeW, delay, opacity, drift };
    });
  }, [count]);

  const anims = useRef(drops.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((v, idx) => {
      v.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.delay(drops[idx].delay),
          Animated.timing(v, {
            toValue: 1,
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims, drops, dur]);

  // ✅ IMPORTANT: pointerEvents none so it never blocks taps
  return (
    <View style={[styles.wrap, { height: H }]} pointerEvents="none">
      <View style={styles.mist} pointerEvents="none" />

      {drops.map((d, idx) => {
        const translateY = anims[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [-30, H + 30],
        });

        const translateX = anims[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [0, d.drift],
        });

        return (
          <Animated.View
            key={d.key}
            pointerEvents="none"
            style={[
              styles.drop,
              {
                left: d.left,
                height: d.sizeH,
                width: d.sizeW,
                opacity: d.opacity,
                transform: [{ translateY }, { translateX }, { rotate: "-12deg" }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  mist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(59,130,246,0.06)",
  },
  drop: {
    position: "absolute",
    top: 0,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.55)",
  },
});
