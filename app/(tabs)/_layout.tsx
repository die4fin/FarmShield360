import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const GREEN = "#2f6f1b";

/**
 * Anim icon: bounce when focused + subtle pulse for active tab
 */
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) {
  const s = useSharedValue(1);
  const y = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Bounce every time focused changes to true
    if (focused) {
      Haptics.selectionAsync();
      s.value = withSpring(1.12, { damping: 12, stiffness: 220, mass: 0.7 });
      y.value = withSpring(-2, { damping: 12, stiffness: 220, mass: 0.7 });
      setTimeout(() => {
        s.value = withSpring(1, { damping: 12, stiffness: 220, mass: 0.7 });
        y.value = withSpring(0, { damping: 12, stiffness: 220, mass: 0.7 });
      }, 160);

      // Active pulse loop
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      // Stop pulse when unfocused
      pulse.value = withTiming(0, { duration: 160 });
      s.value = withSpring(1, { damping: 14, stiffness: 220 });
      y.value = withSpring(0, { damping: 14, stiffness: 220 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { scale: s.value + pulse.value * (focused ? 0.03 : 0) },
    ],
  }));

  return (
    <Animated.View style={a}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </Animated.View>
  );
}

/**
 * Optional: tiny "active dot" indicator with spring
 */
function ActiveDot({ focused }: { focused: boolean }) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [focused, v]);

  const a = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ scale: 0.8 + 0.2 * v.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: "#fff",
          marginTop: 4,
          alignSelf: "center",
        },
        a,
      ]}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: GREEN,
          borderTopWidth: 0,
          height: 74,
          paddingBottom: 14,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.78)",
        tabBarLabelStyle: { fontWeight: "900" },
        // Haptic on tab press (works across all tabs)
        tabBarButton: (props) => {
          const { onPress, ...rest } = props as any;
          return (
            <Pressable
              {...rest}
              onPress={(e: any) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.(e);
              }}
              style={[
                rest.style,
                {
                  flex: 1,
                },
              ]}
            />
          );
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home-variant" size={size} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <>
              <Animated.Text style={{ color, fontWeight: "900" }}>{children}</Animated.Text>
              <ActiveDot focused={focused} />
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="view-grid" size={size} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <>
              <Animated.Text style={{ color, fontWeight: "900" }}>{children}</Animated.Text>
              <ActiveDot focused={focused} />
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="account" size={size} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <>
              <Animated.Text style={{ color, fontWeight: "900" }}>{children}</Animated.Text>
              <ActiveDot focused={focused} />
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="cog" size={size} color={color} focused={focused} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <>
              <Animated.Text style={{ color, fontWeight: "900" }}>{children}</Animated.Text>
              <ActiveDot focused={focused} />
            </>
          ),
        }}
      />
    </Tabs>
  );
}
