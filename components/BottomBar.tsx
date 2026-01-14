import React, { useEffect } from "react";
import { View, Pressable, Dimensions } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const GREEN = "#2f6f1b";
const { width } = Dimensions.get("window");
const BAR_H = 84;
const PADDING = 14;
const ITEM_COUNT = 4;

const routes = ["/home", "/dashboard", "/profile", "/settings"] as const;

function indexFromPath(pathname: string) {
  const idx = routes.indexOf(pathname as any);
  return idx === -1 ? 0 : idx;
}

export default function BottomBar() {
  const pathname = usePathname();
  const activeIndex = indexFromPath(pathname);

  const x = useSharedValue(0);

  useEffect(() => {
    const itemW = (width - PADDING * 2) / ITEM_COUNT;
    x.value = withSpring(activeIndex * itemW, {
      damping: 18,
      stiffness: 160,
      mass: 0.8,
    });
  }, [activeIndex]);

  const itemW = (width - PADDING * 2) / ITEM_COUNT;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const go = async (path: (typeof routes)[number]) => {
    await Haptics.selectionAsync();
    router.replace(path);
  };

  const IconWrap = ({
    idx,
    children,
    onPress,
  }: {
    idx: number;
    children: React.ReactNode;
    onPress: () => void;
  }) => {
    const s = useSharedValue(1);

    useEffect(() => {
      // bounce halus pas aktif berubah
      if (idx === activeIndex) {
        s.value = withTiming(1.08, { duration: 140 }, () => {
          s.value = withTiming(1, { duration: 140 });
        });
      }
    }, [activeIndex]);

    const a = useAnimatedStyle(() => ({
      transform: [{ scale: s.value }],
      opacity: idx === activeIndex ? 1 : 0.92,
    }));

    return (
      <Pressable
        onPress={onPress}
        style={{ flex: 1, height: BAR_H, alignItems: "center", justifyContent: "center" }}
      >
        <Animated.View style={a}>{children}</Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
      {/* glassy bar */}
      <BlurView intensity={18} tint="dark" style={{ height: BAR_H, backgroundColor: GREEN }}>
        <View style={{ flex: 1, paddingHorizontal: PADDING, flexDirection: "row" }}>
          {/* Active pill */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: PADDING,
                top: 12,
                width: itemW,
                height: BAR_H - 24,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.16)",
              },
              indicatorStyle,
            ]}
          />

          <IconWrap idx={0} onPress={() => go("/home")}>
            <Ionicons name="home" size={28} color="white" />
          </IconWrap>

          <IconWrap idx={1} onPress={() => go("/dashboard")}>
            <MaterialCommunityIcons name="view-grid" size={28} color="white" />
          </IconWrap>

          <IconWrap idx={2} onPress={() => go("/profile")}>
            <Ionicons name="person" size={28} color="white" />
          </IconWrap>

          <IconWrap idx={3} onPress={() => go("/settings")}>
            <Feather name="menu" size={28} color="white" />
          </IconWrap>
        </View>
      </BlurView>
    </View>
  );
}
