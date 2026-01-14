import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const GREEN = "#2f6f1b";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onHide?: () => void;
};

export default function InAppAlert({
  visible,
  title,
  message,
  onHide,
}: Props) {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 420 });
      opacity.value = withTiming(1, { duration: 280 });

      // auto hide
      translateY.value = withDelay(
        3200,
        withTiming(-120, { duration: 420 }, () => {
          opacity.value = withTiming(0, { duration: 200 });
          onHide?.();
        })
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="weather-sunny-alert"
            size={24}
            color="#92400e"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: "center",
  },
  card: {
    width: width - 32,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.4)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(251,191,36,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "900",
    color: "#92400e",
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    lineHeight: 16,
  },
});
