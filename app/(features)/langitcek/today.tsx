import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SeedLoadingOverlay from "../../../components/SeedLoadingOverlay";
import { useLangitCek } from "../../../src/contexts/LangitCekContext";


const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const MUTED = "#6b7280";

export default function Today() {
  const router = useRouter();
  const { desaList, selectedDesa, setSelectedDesa } = useLangitCek();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickDesa = (d: any) => {
    setOpen(false);
    setLoading(true);
    setTimeout(() => {
      setSelectedDesa(d);
      setLoading(false);
    }, 400);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <SeedLoadingOverlay visible={loading} />

      {/* Dropdown desa */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pilih Desa</Text>
            {desaList.map((d) => (
              <Pressable
                key={d.label}
                onPress={() => pickDesa(d)}
                style={styles.sheetItem}
              >
                <Text style={styles.sheetItemText}>{d.label}</Text>
                <Text style={styles.sheetItemHint}>{d.hint}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
          </Pressable>
          <Text style={styles.title}>Today</Text>
        </View>

        {/* Desa dropdown */}
        <Pressable style={styles.desaBar} onPress={() => setOpen(true)}>
          <MaterialCommunityIcons name="map-marker" size={18} color={GREEN} />
          <Text style={styles.desaText}>{selectedDesa.label}</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#9ca3af" />
        </Pressable>

        {/* Today summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Hari Ini</Text>

          <View style={styles.row}>
            <Text style={styles.value}>{selectedDesa.categories.tempC}°C</Text>
            <Text style={styles.label}>Suhu</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.value}>{selectedDesa.categories.windKmh} km/h</Text>
            <Text style={styles.label}>Angin</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.value}>{selectedDesa.categories.rainMm} mm</Text>
            <Text style={styles.label}>Curah hujan</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.value}>{selectedDesa.categories.condition}</Text>
            <Text style={styles.label}>Kondisi</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Data ini shared dari LangitCek utama. Ganti desa → semua halaman ikut berubah.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },

  desaBar: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  desaText: { flex: 1, fontWeight: "800", color: "#111827" },

  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 12 },

  row: { marginBottom: 10 },
  value: { fontSize: 20, fontWeight: "900", color: GREEN },
  label: { color: MUTED, fontWeight: "700" },

  note: {
    marginTop: 12,
    color: MUTED,
    fontWeight: "600",
    fontSize: 12,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  sheetTitle: { fontWeight: "900", fontSize: 16, marginBottom: 10 },
  sheetItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sheetItemText: { fontWeight: "800", color: "#111827" },
  sheetItemHint: { color: MUTED, fontSize: 12 },
});
