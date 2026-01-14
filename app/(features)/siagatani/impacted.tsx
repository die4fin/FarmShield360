import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function Page() {
  const reveal = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    reveal.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [pulse, reveal]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: 16 * (1 - reveal.value) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.text, textStyle]}>Dummy Page</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
