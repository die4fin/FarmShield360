import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
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
        if (!disabled) {
          Haptics.selectionAsync();
          s.value = withSpring(0.985, { damping: 16, stiffness: 240, mass: 0.7 });
        }
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 16, stiffness: 240, mass: 0.7 });
      }}
      onPress={onPress}
      style={({ pressed }) => [pressed && !disabled && { opacity: 0.98 }, disabled && { opacity: 0.65 }]}
    >
      <Animated.View style={a}>{children}</Animated.View>
    </Pressable>
  );
}

function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <PressScale onPress={onPress}>
      <View style={styles.socialBtn}>
        <MaterialCommunityIcons name={icon} size={18} color={TEXT} />
        <Text style={styles.socialText}>{label}</Text>
      </View>
    </PressScale>
  );
}

export default function Login() {
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    const u = username.trim();
    const p = password.trim();
    return u.length >= 3 && p.length >= 4;
  }, [username, password]);

  const onLogin = () => {
    if (!canSubmit) {
      Alert.alert("Belum lengkap", "Isi username & password dulu ya.");
      return;
    }
    // Demo flow: langsung masuk
    router.replace("/home");
  };

  const onSocial = (provider: string) => {
    Alert.alert(`${provider} Login`, "Segera hadir di versi mendatang!", [{ text: "OK" }], { cancelable: true });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Soft background */}
      <View style={styles.bgWrap}>
        <View style={styles.bgTop} />
        <View style={styles.bgBlobA} />
        <View style={styles.bgBlobB} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0, default: 0 })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingTop: Math.max(insets.top * 0.10, 10), paddingBottom: 18 + insets.bottom },
          ]}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>

            <View style={{ flex: 1 }}>
              <View style={styles.brandRow}>
                <View style={styles.brandDot} />
                <Text style={styles.brandText}>FarmShield360</Text>
              </View>
              <Text style={styles.h1}>Masuk</Text>
              <Text style={styles.h2}>Lanjutkan untuk akses fitur pertanian adaptif.</Text>
            </View>
          </Animated.View>

          {/* Hero card */}
          <Animated.View entering={FadeIn.duration(520)} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="shield-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Akses cepat & aman</Text>
              <Text style={styles.heroSub}>Notifikasi hazard • Rekomendasi AI • Data lahan</Text>
            </View>
            <View style={styles.aiPill}>
              <MaterialCommunityIcons name="robot-outline" size={14} color="#fff" />
              <Text style={styles.aiPillText}>AI</Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.duration(520).delay(70)} style={styles.card}>
            <Text style={styles.cardTitle}>Username</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="account-outline" size={18} color="#6b7280" />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="contoh: dithasuga"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Password</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={18} color="#6b7280" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={onLogin}
              />

              <PressScale onPress={() => setShowPass((p) => !p)}>
                <View style={styles.eyeBtn}>
                  <MaterialCommunityIcons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#6b7280"
                  />
                </View>
              </PressScale>
            </View>

            <View style={styles.rowBetween}>
              <PressScale
                onPress={() => Alert.alert("Lupa Password", "Segera hadir di versi mendatang!", [{ text: "OK" }], { cancelable: true })}
              >
                <Text style={styles.link}>Lupa password?</Text>
              </PressScale>

              <View style={styles.miniHint}>
                <MaterialCommunityIcons name="lock-check-outline" size={14} color={GREEN} />
                <Text style={styles.miniHintText}>Terenkripsi</Text>
              </View>
            </View>

            <View style={{ height: 10 }} />

            <PressScale onPress={onLogin} disabled={!canSubmit}>
              <View style={[styles.primaryBtn, !canSubmit && { opacity: 0.7 }]}>
                <MaterialCommunityIcons name="login" size={18} color="#fff" />
                <Text style={styles.primaryText}>Masuk</Text>
              </View>
            </PressScale>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>atau</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialGrid}>
              <SocialButton
                label="Login with Google"
                icon="google"
                onPress={() => onSocial("Google")}
              />
              <SocialButton
                label="Login with Facebook"
                icon="facebook"
                onPress={() => onSocial("Facebook")}
              />
              <SocialButton
                label="Login with Apple"
                icon="apple"
                onPress={() => onSocial("Apple")}
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.duration(520).delay(140)} style={styles.footer}>
            <Text style={styles.footerText}>
              Dengan masuk, kamu menyetujui kebijakan privasi & ketentuan penggunaan.
            </Text>

            <PressScale onPress={() => Alert.alert("Daftar", "Segera hadir di versi mendatang!", [{ text: "OK" }], { cancelable: true })}>
              <View style={styles.secondaryBtn}>
                <MaterialCommunityIcons name="account-plus-outline" size={18} color={GREEN} />
                <Text style={styles.secondaryText}>Buat akun baru</Text>
              </View>
            </PressScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Background
  bgWrap: { ...StyleSheet.absoluteFillObject },
  bgTop: { position: "absolute", left: 0, right: 0, top: 0, height: 260, backgroundColor: "#eaf7ea" },
  bgBlobA: {
    position: "absolute",
    top: -120,
    right: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(47,111,27,0.18)",
  },
  bgBlobB: {
    position: "absolute",
    top: 160,
    left: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(200,255,157,0.45)",
  },

  content: { paddingHorizontal: PAD },

  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 6 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
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

  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: GREEN },
  brandText: { color: TEXT, fontWeight: "900", fontSize: 14 },
  h1: { marginTop: 8, fontSize: 28, fontWeight: "900", color: TEXT },
  h2: { marginTop: 6, color: MUTED, fontWeight: "800", lineHeight: 18 },

  heroCard: {
    marginTop: 14,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#fff", fontWeight: "900" },
  heroSub: { marginTop: 4, color: "rgba(255,255,255,0.85)", fontWeight: "800", fontSize: 12 },

  aiPill: {
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
  aiPillText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  card: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  cardTitle: { color: TEXT, fontWeight: "900", fontSize: 12, marginBottom: 8 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
  },
  input: { flex: 1, fontWeight: "800", color: TEXT },

  eyeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  rowBetween: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: GREEN, fontWeight: "900" },
  miniHint: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniHintText: { color: MUTED, fontWeight: "900", fontSize: 12 },

  primaryBtn: {
    backgroundColor: GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  orRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(17,24,39,0.08)" },
  orText: { color: MUTED, fontWeight: "900", fontSize: 12 },

  socialGrid: { marginTop: 12, gap: 10 },
  socialBtn: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialText: { color: TEXT, fontWeight: "900" },

  footer: { marginTop: 12, gap: 10 },
  footerText: { color: MUTED, fontWeight: "800", lineHeight: 18, textAlign: "center" },

  secondaryBtn: {
    backgroundColor: "rgba(47,111,27,0.08)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.16)",
  },
  secondaryText: { color: GREEN, fontWeight: "900" },
});
