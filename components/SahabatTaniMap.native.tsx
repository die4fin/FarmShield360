import React, { useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Coordinator = {
  id: string;
  name: string;
  desa: string;
  lat: number;
  lng: number;
};

type Props = {
  mapRef: React.MutableRefObject<MapView | null>;
  initialRegion: Region;
  userLoc: { lat: number; lng: number } | null;
  items: Coordinator[];
  now: Date;
  isAvailableNow: (c: any, now: Date) => boolean;
  onPressMarker: (c: Coordinator) => void;
};

export default function SahabatTaniMapNative({
  mapRef,
  initialRegion,
  userLoc,
  items,
  now,
  isAvailableNow,
  onPressMarker,
}: Props) {
  const GREEN = "#2f6f1b";

  // ✅ TS-safe: ref callback boleh dapat MapView | null
  const setRef = useCallback(
    (r: MapView | null) => {
      mapRef.current = r;
    },
    [mapRef]
  );

  return (
    <MapView
      ref={setRef}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
    >
      {userLoc ? (
        <Marker coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }} title="Lokasi Saya">
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#111827",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.9)",
            }}
          >
            <MaterialCommunityIcons name="account" size={16} color="#fff" />
          </View>
        </Marker>
      ) : null}

      {items.map((c) => {
        const avail = isAvailableNow(c, now);
        return (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            title={c.name}
            description={`${c.desa}${avail ? " • Available now" : ""}`}
            onPress={() => onPressMarker(c)}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: avail ? GREEN : "#111827",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.85)",
              }}
            >
              <MaterialCommunityIcons name="home-map-marker" size={18} color="#fff" />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}
