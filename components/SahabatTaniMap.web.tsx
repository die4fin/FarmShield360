import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SahabatTaniMapWeb(props: { onOpenFirst: () => void }) {
  const GREEN = "#2f6f1b";
  const TEXT = "#111827";
  const MUTED = "#6b7280";

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 18, gap: 10 }}>
      <View style={{ width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: GREEN }}>
        <MaterialCommunityIcons name="map-outline" size={22} color="#fff" />
      </View>

      <Text style={{ fontSize: 16, fontWeight: "900", color: TEXT, textAlign: "center" }}>Map tidak tersedia di Web</Text>
      <Text style={{ color: MUTED, fontWeight: "800", lineHeight: 18, textAlign: "center" }}>
        Halaman ini pakai <Text style={{ fontWeight: "900" }}>react-native-maps</Text> (native-only).
        {"\n"}Web build aman, map diganti placeholder.
      </Text>

      <Pressable
        onPress={props.onOpenFirst}
        style={({ pressed }) => [
          {
            marginTop: 4,
            backgroundColor: GREEN,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          },
          pressed && { opacity: 0.92 },
        ]}
      >
        <MaterialCommunityIcons name="google-maps" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>Open Maps (first result)</Text>
      </Pressable>
    </View>
  );
}
