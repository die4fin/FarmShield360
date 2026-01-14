import React from "react";
import { View, Text } from "react-native";

export default function SahabatTaniWeb() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "600" }}>Peta belum tersedia di Web</Text>
      <Text style={{ marginTop: 8, textAlign: "center" }}>
        Halaman ini pakai react-native-maps (native-only). Untuk web bisa diganti Leaflet/Google Maps.
      </Text>
    </View>
  );
}
