import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Platform,
  Switch,
  ScrollView,
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

const { width } = Dimensions.get("window");
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

function StatPill({ icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <View style={styles.statIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={GREEN} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function RowItem({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <PressScale onPress={onPress}>
      <View style={[styles.rowItem, danger && { borderColor: "rgba(239,68,68,0.25)" }]}>
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

export default function Profile() {
  const insets = useSafeAreaInsets();

  // Dummy state (biar UI hidup)
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifHazard, setNotifHazard] = useState(true);

  const user = useMemo(
    () => ({
      name: "Ditha",
      role: "Petani • Desa Anggrek",
      avatar:
        "https://wallpapers-clan.com/wp-content/uploads/2022/05/meme-pfp-04.jpg",
      field: "Pasar Kemis, Tangerang",
      areaHa: "0.8 ha",
      soil: "Liat",
      since: "2026",
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Background concept: clean + premium */}
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
            <Text style={styles.brandText}>Profile</Text>
          </View>

          <PressScale onPress={() => {}}>
            <View style={styles.headerBtn}>
              <MaterialCommunityIcons name="qrcode-scan" size={18} color={GREEN} />
            </View>
          </PressScale>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(520).delay(70)} style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.badgeOnline}>
                <View style={styles.dotOnline} />
                <Text style={styles.badgeOnlineText}>Aktif</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.role}>{user.role}</Text>

              <View style={styles.miniPillsRow}>
                <View style={styles.miniPill}>
                  <MaterialCommunityIcons name="sprout-outline" size={14} color={GREEN} />
                  <Text style={styles.miniPillText}>{user.areaHa}</Text>
                </View>
                <View style={styles.miniPill}>
                  <MaterialCommunityIcons name="layers-outline" size={14} color={GREEN} />
                  <Text style={styles.miniPillText}>{user.soil}</Text>
                </View>
                <View style={styles.miniPill}>
                  <MaterialCommunityIcons name="calendar-outline" size={14} color={GREEN} />
                  <Text style={styles.miniPillText}>Sejak {user.since}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickRow}>
            <PressScale onPress={() => {}}>
              <View style={styles.quickBtn}>
                <MaterialCommunityIcons name="account-edit-outline" size={18} color="#fff" />
                <Text style={styles.quickBtnText}>Edit</Text>
              </View>
            </PressScale>

            <PressScale onPress={() => {}}>
              <View style={styles.quickBtnGhost}>
                <MaterialCommunityIcons name="share-variant-outline" size={18} color={GREEN} />
                <Text style={styles.quickBtnGhostText}>Bagikan</Text>
              </View>
            </PressScale>

            <PressScale onPress={() => {}}>
              <View style={styles.quickBtnGhost}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color={GREEN} />
                <Text style={styles.quickBtnGhostText}>Verifikasi</Text>
              </View>
            </PressScale>
          </View>

          {/* Field summary */}
          <View style={styles.fieldStrip}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={GREEN} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldTitle}>Lahan Utama</Text>
              <Text style={styles.fieldSub}>{user.field}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(520).delay(120)} style={styles.statsGrid}>
          <StatPill icon="weather-partly-cloudy" value="Stabil" label="Cuaca" />
          <StatPill icon="alert-circle-outline" value="2" label="Alert minggu ini" />
          <StatPill icon="robot-outline" value="5" label="Analisis tersimpan" />
          <StatPill icon="account-group-outline" value="Koordinator" label="SahabatTani" />
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.duration(520).delay(170)} style={styles.section}>
          <Text style={styles.sectionTitle}>Preferensi</Text>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Notifikasi Cuaca</Text>
                <Text style={styles.switchSub}>Update hujan & angin</Text>
              </View>
              <Switch value={notifWeather} onValueChange={setNotifWeather} />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Peringatan Bahaya</Text>
                <Text style={styles.switchSub}>Badai, banjir, risiko ekstrem</Text>
              </View>
              <Switch value={notifHazard} onValueChange={setNotifHazard} />
            </View>
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.duration(520).delay(210)} style={styles.section}>
          <Text style={styles.sectionTitle}>Akun</Text>

          <View style={styles.card}>
            <RowItem icon="lock-outline" title="Privasi & Keamanan" subtitle="PIN, perangkat, izin" onPress={() => {}} />
            <RowItem icon="help-circle-outline" title="Bantuan" subtitle="FAQ & kontak" onPress={() => {}} />
            <RowItem icon="information-outline" title="Tentang Aplikasi" subtitle="FarmShield360 • v0.1" onPress={() => {}} />
          </View>
        </Animated.View>

        {/* Danger */}
        <Animated.View entering={FadeInDown.duration(520).delay(250)} style={styles.section}>
          <View style={styles.card}>
            <RowItem
              icon="logout"
              title="Keluar"
              subtitle="Akhiri sesi di perangkat ini"
              onPress={() => {}}
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

  profileCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },

  profileTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { width: 78, alignItems: "center", gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: "#e5e7eb" },

  badgeOnline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
  },
  dotOnline: { width: 8, height: 8, borderRadius: 99, backgroundColor: "#22c55e" },
  badgeOnlineText: { color: "#166534", fontWeight: "900", fontSize: 12 },

  name: { color: TEXT, fontWeight: "900", fontSize: 18 },
  role: { marginTop: 4, color: MUTED, fontWeight: "800" },

  miniPillsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  miniPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(47,111,27,0.08)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
  },
  miniPillText: { color: TEXT, fontWeight: "900", fontSize: 12 },

  quickRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickBtnText: { color: "#fff", fontWeight: "900" },
  quickBtnGhost: {
    flex: 1,
    backgroundColor: "rgba(47,111,27,0.08)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
  },
  quickBtnGhostText: { color: GREEN, fontWeight: "900" },

  fieldStrip: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  fieldTitle: { color: TEXT, fontWeight: "900", fontSize: 12 },
  fieldSub: { marginTop: 4, color: MUTED, fontWeight: "800" },

  statsGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statPill: {
    width: (width - PAD * 2 - 10) / 2,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(47,111,27,0.10)",
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { color: TEXT, fontWeight: "900", fontSize: 14 },
  statLabel: { marginTop: 2, color: MUTED, fontWeight: "800", fontSize: 12 },

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
