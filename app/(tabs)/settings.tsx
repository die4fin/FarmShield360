import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const GREEN = "#2f6f1b";
const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const PAD = 18;

function PressScale({
  onPress,
  children,
  disabled,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        Haptics.selectionAsync();
        s.value = withSpring(0.985, { damping: 16, stiffness: 240, mass: 0.7 });
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 16, stiffness: 240, mass: 0.7 });
      }}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.98 }]}
    >
      <Animated.View style={a}>{children}</Animated.View>
    </Pressable>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

function RowItem({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
  disabled,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <PressScale onPress={onPress} disabled={disabled || !onPress}>
      <View
        style={[
          styles.rowItem,
          danger && { borderColor: "rgba(239,68,68,0.25)" },
          disabled && { opacity: 0.6 },
        ]}
      >
        <View
          style={[
            styles.rowIcon,
            danger
              ? { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.18)" }
              : null,
          ]}
        >
          <MaterialCommunityIcons name={icon} size={20} color={danger ? "#ef4444" : GREEN} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, danger && { color: "#991b1b" }]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
        </View>

        {right ?? <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />}
      </View>
    </PressScale>
  );
}

export default function Settings() {
  const insets = useSafeAreaInsets();

  // Dummy states biar settings “hidup”
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifHazard, setNotifHazard] = useState(true);
  const [useLocation, setUseLocation] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const version = "v0.1";

  const onRow = (title: string) => {
    Alert.alert(title, "Segera hadir di versi mendatang!", [{ text: "OK" }], { cancelable: true });
  };

  const onReset = () => {
    Alert.alert(
      "Reset Pengaturan",
      "Balikkan semua pengaturan ke default?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setNotifWeather(true);
            setNotifHazard(true);
            setUseLocation(true);
            setAutoSync(true);
            setDataSaver(false);
            Alert.alert("Selesai", "Pengaturan berhasil di-reset.");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onSignOut = () => {
    Alert.alert(
      "Keluar",
      "Akhiri sesi di perangkat ini?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: () => Alert.alert("Keluar", "Succesfully Logged Out") },
      ],
      { cancelable: true }
    );
  };

  const chips = useMemo(
    () => [
      { icon: "weather-partly-cloudy", text: notifWeather ? "Notif Cuaca ON" : "Notif Cuaca OFF" },
      { icon: "alert-circle-outline", text: notifHazard ? "Hazard ON" : "Hazard OFF" },
      { icon: "map-marker-radius-outline", text: useLocation ? "Lokasi ON" : "Lokasi OFF" },
    ],
    [notifWeather, notifHazard, useLocation]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Background soft */}
      <View style={styles.bgWrap}>
        <View style={styles.bgTop} />
        <View style={styles.bgBlobA} />
        <View style={styles.bgBlobB} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top * 0.08, 10) },
        ]}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>Settings</Text>
          </View>

          <PressScale onPress={onReset}>
            <View style={styles.headerBtn}>
              <MaterialCommunityIcons name="restore" size={18} color={GREEN} />
            </View>
          </PressScale>
        </Animated.View>

        {/* Overview Card */}
        <Animated.View entering={FadeInDown.duration(520).delay(70)} style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.overviewIcon}>
              <MaterialCommunityIcons name="cog-outline" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTitle}>FarmShield360</Text>
              <Text style={styles.overviewSub}>Smart Farm App • {version}</Text>
            </View>

            <View style={styles.syncPill}>
              <MaterialCommunityIcons name={autoSync ? "sync" : "sync-off"} size={14} color="#fff" />
              <Text style={styles.syncPillText}>{autoSync ? "Auto Sync" : "Manual"}</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            {chips.map((c, i) => (
              <View key={String(i)} style={styles.chip}>
                <MaterialCommunityIcons name={c.icon as any} size={14} color="#fff" />
                <Text style={styles.chipText}>{c.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.duration(520).delay(120)} style={styles.section}>
          <SectionTitle text="Notifikasi" />

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Notifikasi Cuaca</Text>
                <Text style={styles.switchSub}>Update hujan, angin, dan kondisi harian</Text>
              </View>
              <Switch value={notifWeather} onValueChange={setNotifWeather} />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Peringatan Bahaya</Text>
                <Text style={styles.switchSub}>Badai, banjir, dan risiko ekstrem (real-time)</Text>
              </View>
              <Switch value={notifHazard} onValueChange={setNotifHazard} />
            </View>

            <View style={styles.divider} />

            <RowItem
              icon="bell-ring-outline"
              title="Pengaturan Suara & Getar"
              subtitle="Nada, intensitas haptic, mode senyap"
              onPress={() => onRow("Pengaturan Suara & Getar")}
            />
          </View>
        </Animated.View>

        {/* Location & Maps */}
        <Animated.View entering={FadeInDown.duration(520).delay(160)} style={styles.section}>
          <SectionTitle text="Lokasi & Peta" />

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Gunakan Lokasi Saya</Text>
                <Text style={styles.switchSub}>Untuk radius SahabatTani & akurasi rekomendasi</Text>
              </View>
              <Switch value={useLocation} onValueChange={setUseLocation} />
            </View>

            <View style={styles.divider} />

            <RowItem
              icon="map-outline"
              title="Metode Navigasi"
              subtitle="Google Maps / Apple Maps (iOS)"
              onPress={() => onRow("Metode Navigasi")}
            />

            <RowItem
              icon="crosshairs-gps"
              title="Akurasi Lokasi"
              subtitle="High accuracy untuk perhitungan radius"
              onPress={() => onRow("Akurasi Lokasi")}
              disabled={!useLocation}
            />
          </View>
        </Animated.View>

        {/* Data & Performance */}
        <Animated.View entering={FadeInDown.duration(520).delay(200)} style={styles.section}>
          <SectionTitle text="Data & Performa" />

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Auto Sync Data</Text>
                <Text style={styles.switchSub}>GPS • satelit • iklim nasional (background fetch)</Text>
              </View>
              <Switch value={autoSync} onValueChange={setAutoSync} />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Data Saver</Text>
                <Text style={styles.switchSub}>Kurangi gambar & update di jaringan terbatas</Text>
              </View>
              <Switch value={dataSaver} onValueChange={setDataSaver} />
            </View>

            <View style={styles.divider} />

            <RowItem
              icon="database-outline"
              title="Kelola Cache"
              subtitle="Hapus cache gambar & data sementara"
              onPress={() =>
                Alert.alert(
                  "Kelola Cache",
                  "Cache Cleared.",
                  [{ text: "OK" }],
                  { cancelable: true }
                )
              }
            />
          </View>
        </Animated.View>

        {/* Account & Support */}
        <Animated.View entering={FadeInDown.duration(520).delay(240)} style={styles.section}>
          <SectionTitle text="Akun & Bantuan" />

          <View style={styles.card}>
            <RowItem
              icon="account-outline"
              title="Akun"
              subtitle="Profil, desa, lahan utama"
              onPress={() => onRow("Akun")}
            />
            <RowItem
              icon="lock-outline"
              title="Privasi & Keamanan"
              subtitle="PIN, perangkat, izin aplikasi"
              onPress={() => onRow("Privasi & Keamanan")}
            />
            <RowItem
              icon="help-circle-outline"
              title="Bantuan"
              subtitle="FAQ & kontak koordinator"
              onPress={() => onRow("Bantuan")}
            />
            <RowItem
              icon="information-outline"
              title="Tentang"
              subtitle={`FarmShield360 • ${version}`}
              onPress={() => onRow("Tentang")}
            />
          </View>
        </Animated.View>

        {/* Danger zone */}
        <Animated.View entering={FadeInDown.duration(520).delay(280)} style={styles.section}>
          <SectionTitle text="Lainnya" />

          <View style={styles.card}>
            <RowItem
              icon="restore"
              title="Reset Pengaturan"
              subtitle="Balikkan ke default"
              onPress={onReset}
            />
            <RowItem
              icon="logout"
              title="Keluar"
              subtitle="Akhiri sesi di perangkat ini"
              onPress={onSignOut}
              danger
            />
          </View>
        </Animated.View>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Background
  bgWrap: { ...StyleSheet.absoluteFillObject },
  bgTop: { position: "absolute", left: 0, right: 0, top: 0, height: 240, backgroundColor: "#eaf7ea" },
  bgBlobA: {
    position: "absolute",
    top: -90,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(47,111,27,0.16)",
  },
  bgBlobB: {
    position: "absolute",
    top: 120,
    left: -160,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(200,255,157,0.42)",
  },

  content: {
    paddingHorizontal: PAD,
    paddingBottom: 18,
    paddingTop: Platform.select({ ios: 10, android: 12, default: 12 }),
  },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: GREEN },
  brandText: { color: TEXT, fontWeight: "900", fontSize: 16 },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  overviewCard: {
    marginTop: 12,
    backgroundColor: GREEN,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  overviewTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  overviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  overviewSub: { marginTop: 4, color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },

  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  syncPillText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  chipsRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  chipText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  section: { marginTop: 14 },
  sectionTitle: { color: TEXT, fontWeight: "900", fontSize: 14, marginBottom: 10 },

  card: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },

  switchRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 6 },
  switchTitle: { color: TEXT, fontWeight: "900" },
  switchSub: { marginTop: 4, color: MUTED, fontWeight: "800", fontSize: 12 },

  divider: { height: 1, backgroundColor: "rgba(17,24,39,0.06)", marginVertical: 6 },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(47,111,27,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: TEXT, fontWeight: "900" },
  rowSub: { marginTop: 4, color: MUTED, fontWeight: "800", fontSize: 12 },
});
