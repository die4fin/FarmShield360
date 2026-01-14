import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

const BG = "#f6fbf6";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const GREEN = "#2f6f1b";
const { width, height } = Dimensions.get("window");

type Slot = { day: string; time: string; note?: string };
type CoordinatorBase = {
  id: string;
  name: string;
  desa: string;
  areaTags: string[];
  address: string;
  phoneMasked: string;
  lat: number;
  lng: number;
  availability: {
    todayLabel: string;
    slots: Slot[];
  };
};

type Coordinator = CoordinatorBase & {
  distanceKm: number; // computed from real user location
};

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

function formatDistance(km: number) {
  if (!Number.isFinite(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// Haversine distance (km)
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371; // km
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);

  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function parseTimeRangeToMinutes(range: string) {
  const cleaned = range
    .replace(/\s/g, "")
    .replace("—", "-")
    .replace("–", "-")
    .replace("—", "-");

  const [a, b] = cleaned.split("-");
  const parseOne = (t: string) => {
    const tt = t.replace(".", ":");
    const [hh, mm] = tt.split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const start = parseOne(a);
  const end = parseOne(b);
  if (start == null || end == null) return null;
  return { start, end };
}

function dayToIndex(day: string) {
  const d = norm(day);
  const map: Record<string, number> = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };
  return map[d] ?? null;
}

function isAvailableNow(c: CoordinatorBase, now: Date) {
  const nowDay = now.getDay(); // 0..6
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const todaysSlots = c.availability.slots.filter((s) => dayToIndex(s.day) === nowDay);

  for (const s of todaysSlots) {
    const parsed = parseTimeRangeToMinutes(s.time);
    if (!parsed) continue;
    if (nowMin >= parsed.start && nowMin <= parsed.end) return true;
  }
  return false;
}

// Dummy coordinators (realistic-ish)
const COORDS_BASE: CoordinatorBase[] = [
  {
    id: "kst-01",
    name: "Bu Sari Nurhayati",
    desa: "Desa Anggrek",
    areaTags: ["anggrek", "irigasi", "blok a", "tasik", "tasikmalaya"],
    address: "Jl. Saluran Irigasi No. 12, RT 02/RW 05",
    phoneMasked: "+62 8** **** 193",
    lat: -7.327,
    lng: 108.220,
    availability: {
      todayLabel: "Hari ini • 09.00–12.00 & 15.00–17.00",
      slots: [
        { day: "Senin", time: "09.00–12.00", note: "Kunjungan rumah / konsultasi" },
        { day: "Senin", time: "15.00–17.00", note: "Follow up singkat" },
        { day: "Rabu", time: "13.00–16.00", note: "Pendampingan lapang" },
        { day: "Jumat", time: "09.00–11.00", note: "Layanan administrasi" },
      ],
    },
  },
  {
    id: "kst-02",
    name: "Pak Deden Setiawan",
    desa: "Desa Padi",
    areaTags: ["padi", "lembah", "lahan basah", "blok c", "tasik"],
    address: "Komplek Balai Tani, Blok C, RT 01/RW 02",
    phoneMasked: "+62 8** **** 240",
    lat: -7.331,
    lng: 108.235,
    availability: {
      todayLabel: "Hari ini • 08.00–11.00",
      slots: [
        { day: "Selasa", time: "08.00–11.00", note: "Monitoring drainase" },
        { day: "Kamis", time: "14.00–17.00", note: "Klinik hama musiman" },
        { day: "Sabtu", time: "09.00–12.00", note: "Bimbingan kelompok tani" },
      ],
    },
  },
  {
    id: "kst-03",
    name: "Bu Rina Oktaviani",
    desa: "Desa Melati",
    areaTags: ["melati", "perbukitan", "kebun", "barat", "cikajang"],
    address: "Jl. Kebun Campuran No. 3, RT 03/RW 01",
    phoneMasked: "+62 8** **** 508",
    lat: -7.319,
    lng: 108.210,
    availability: {
      todayLabel: "Hari ini • 10.00–12.30",
      slots: [
        { day: "Senin", time: "10.00–12.30", note: "Konsultasi komoditas" },
        { day: "Rabu", time: "09.00–12.00", note: "Pendataan lahan" },
        { day: "Jumat", time: "13.00–16.00", note: "Rencana musim tanam" },
      ],
    },
  },
  {
    id: "kst-04",
    name: "Pak Arif Maulana",
    desa: "Desa Kenanga",
    areaTags: ["kenanga", "terbuka", "angin", "utara", "badai"],
    address: "Posko Siaga Tani, RT 04/RW 02 (Dekat Lapangan)",
    phoneMasked: "+62 8** **** 772",
    lat: -7.312,
    lng: 108.245,
    availability: {
      todayLabel: "Hari ini • 16.00–18.00",
      slots: [
        { day: "Selasa", time: "16.00–18.00", note: "Koordinasi kebencanaan" },
        { day: "Kamis", time: "09.00–11.00", note: "Layanan cepat darurat" },
        { day: "Minggu", time: "08.00–10.00", note: "Kunjungan komunitas" },
      ],
    },
  },
];

function getFallbackRegion(): Region {
  // fallback sekitar Tasik (dummy)
  return {
    latitude: -7.325,
    longitude: 108.228,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}

export default function SahabatTaniPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);

  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState<1 | 3 | 5>(3);
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Coordinator | null>(null);

  // Location states
  const [locLoading, setLocLoading] = useState(false);
  const [locErr, setLocErr] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  // Tick every minute for "available now" to stay fresh
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const now = useMemo(() => new Date(), [tick]);

  const initialRegion = useMemo(() => {
    if (userLoc) {
      return {
        latitude: userLoc.lat,
        longitude: userLoc.lng,
        latitudeDelta: 0.045,
        longitudeDelta: 0.045,
      };
    }
    return getFallbackRegion();
  }, [userLoc]);

  const computeCoords = useMemo(() => {
    const base = COORDS_BASE;

    // If we don't have user location yet, distances are NaN (UI will show "—")
    if (!userLoc) {
      return base.map((c) => ({ ...c, distanceKm: Number.NaN })) as Coordinator[];
    }

    return base
      .map((c) => ({
        ...c,
        distanceKm: haversineKm(userLoc.lat, userLoc.lng, c.lat, c.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [userLoc]);

  const filtered = useMemo(() => {
    const q = norm(query);

    const byQuery = !q.length
      ? computeCoords
      : computeCoords.filter((c) => {
          const hay = `${c.name} ${c.desa} ${c.address} ${c.areaTags.join(" ")}`.toLowerCase();
          return hay.includes(q);
        });

    // If location unknown, don't hard-filter by radius (because we can't compute)
    const byRadius = userLoc
      ? byQuery.filter((c) => c.distanceKm <= radiusKm)
      : byQuery;

    const byAvailability = onlyAvailableNow
      ? byRadius.filter((c) => isAvailableNow(c, now))
      : byRadius;

    return byAvailability;
  }, [query, radiusKm, onlyAvailableNow, computeCoords, userLoc, now]);

  const availableCount = useMemo(() => {
    return COORDS_BASE.filter((c) => isAvailableNow(c, new Date())).length;
  }, []);

  const requestLocation = async () => {
    setLocErr(null);
    setLocLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocErr("Izin lokasi ditolak. Aktifkan permission untuk radius real.");
        setLocLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLoc(next);

      // Animate to user region
      mapRef.current?.animateToRegion(
        {
          latitude: next.lat,
          longitude: next.lng,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        },
        650
      );

      setLocLoading(false);
    } catch (e) {
      setLocErr("Gagal mengambil lokasi. Coba nyalakan GPS / izin lokasi.");
      setLocLoading(false);
    }
  };

  const openGoogleMapsNative = async (c: CoordinatorBase) => {
    const latlng = `${c.lat},${c.lng}`;
    const label = encodeURIComponent(`${c.name} - ${c.desa}`);

    // Fallback web (works everywhere)
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latlng}&travelmode=driving`;

    // iOS: prefer Google Maps app if installed, else Apple Maps, else web
    if (Platform.OS === "ios") {
      const gmaps = `comgooglemaps://?daddr=${latlng}&directionsmode=driving`;
      const apple = `http://maps.apple.com/?daddr=${latlng}&dirflg=d`;

      try {
        const canGoogle = await Linking.canOpenURL(gmaps);
        if (canGoogle) return Linking.openURL(gmaps);

        const canApple = await Linking.canOpenURL(apple);
        if (canApple) return Linking.openURL(apple);

        return Linking.openURL(webUrl);
      } catch {
        return Linking.openURL(webUrl);
      }
    }

    // Android: prefer google.navigation if available
    const androidNav = `google.navigation:q=${latlng}&mode=d`;
    try {
      const canNav = await Linking.canOpenURL(androidNav);
      if (canNav) return Linking.openURL(androidNav);
      return Linking.openURL(webUrl);
    } catch {
      return Linking.openURL(webUrl);
    }
  };

  const openDetail = (c: Coordinator) => {
    setSelected(c);
    setDetailOpen(true);

    // center map on coordinator
    mapRef.current?.animateToRegion(
      {
        latitude: c.lat,
        longitude: c.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      450
    );
  };

  const onCall = (c: CoordinatorBase) => {
    Alert.alert("Hubungi (dummy)", `Menghubungi ${c.name}\n${c.phoneMasked}\n\nNanti bisa integrasi telepon/WA.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.root, { paddingTop: Math.max(insets.top * 0.15, 4) }]}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={GREEN} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.topTitle}>SahabatTani</Text>
            <Text style={styles.topSub}>
              Koordinator Desa • {availableCount} tersedia (sekarang)
            </Text>
          </View>

          <Pressable
            onPress={requestLocation}
            style={({ pressed }) => [styles.locBtn, pressed && { opacity: 0.92 }]}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#fff" />
            <Text style={styles.locBtnText}>
              {locLoading ? "..." : userLoc ? "My Loc" : "Use My Loc"}
            </Text>
          </Pressable>
        </View>

        {/* FILTER BAR */}
        <View style={styles.filterCard}>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ketik area (desa/blok/kampung)…"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query.length ? (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#d1d5db" />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.filtersRow}>
            <View style={styles.radiusGroup}>
              <Text style={styles.smallLabel}>
                Radius {userLoc ? "" : "(aktif setelah Use My Loc)"}
              </Text>

              <View style={styles.radiusBtns}>
                {[1, 3, 5].map((r) => {
                  const active = radiusKm === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRadiusKm(r as any)}
                      style={({ pressed }) => [
                        styles.radiusBtn,
                        active && styles.radiusBtnActive,
                        pressed && { opacity: 0.92 },
                      ]}
                    >
                      <Text style={[styles.radiusText, active && { color: "#fff" }]}>{r} km</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={() => setOnlyAvailableNow((p) => !p)}
              style={({ pressed }) => [
                styles.toggle,
                onlyAvailableNow && styles.toggleOn,
                pressed && { opacity: 0.92 },
              ]}
            >
              <MaterialCommunityIcons
                name={onlyAvailableNow ? "check-circle" : "circle-outline"}
                size={18}
                color={onlyAvailableNow ? "#16a34a" : "#9ca3af"}
              />
              <Text style={[styles.toggleText, onlyAvailableNow && { color: "#166534" }]}>
                Available now
              </Text>
            </Pressable>
          </View>

          {locErr ? (
            <View style={styles.warnBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#b45309" />
              <Text style={styles.warnText}>{locErr}</Text>
            </View>
          ) : null}

          <Text style={styles.helper}>
            Menampilkan {filtered.length} koordinator sesuai filter.
            {userLoc ? " (Radius pakai jarak real dari lokasimu)" : " (Aktifkan Use My Loc untuk radius real)"}
          </Text>
        </View>

        {/* MAP */}
        <View style={styles.mapWrap}>
          <MapView
            ref={(r) => {
              if (r) mapRef.current = r;
            }}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
          >
            {/* user marker */}
            {userLoc ? (
              <Marker
                coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }}
                title="Lokasi Saya"
              >
                <View style={styles.meMarker}>
                  <MaterialCommunityIcons name="account" size={16} color="#fff" />
                </View>
              </Marker>
            ) : null}

            {filtered.map((c) => {
              const avail = isAvailableNow(c, now);
              return (
                <Marker
                  key={c.id}
                  coordinate={{ latitude: c.lat, longitude: c.lng }}
                  title={c.name}
                  description={`${c.desa}${Number.isFinite(c.distanceKm) ? ` • ${formatDistance(c.distanceKm)}` : ""}${
                    avail ? " • Available now" : ""
                  }`}
                  onPress={() => openDetail(c)}
                >
                  <View style={[styles.markerWrap, avail && styles.markerWrapAvail]}>
                    <MaterialCommunityIcons name="home-map-marker" size={18} color="#fff" />
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating list preview */}
          <View style={styles.bottomPeek}>
            <View style={styles.peekHead}>
              <Text style={styles.peekTitle}>Terdekat</Text>
              <Text style={styles.peekHint}>Scroll →</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 6 }}
            >
              {filtered.slice(0, 10).map((c) => {
                const avail = isAvailableNow(c, now);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => openDetail(c)}
                    style={({ pressed }) => [styles.peekCard, pressed && { opacity: 0.92 }]}
                  >
                    <View style={styles.peekTop}>
                      <View style={[styles.avatar, avail && styles.avatarAvail]}>
                        <MaterialCommunityIcons name="account" size={16} color="#fff" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.peekName} numberOfLines={1}>
                          {c.name}
                        </Text>
                        <Text style={styles.peekMeta} numberOfLines={1}>
                          {c.desa} • {formatDistance(c.distanceKm)}
                        </Text>
                      </View>

                      {avail ? (
                        <View style={styles.badgeAvail}>
                          <Text style={styles.badgeAvailText}>NOW</Text>
                        </View>
                      ) : (
                        <View style={styles.badgeOff}>
                          <Text style={styles.badgeOffText}>OFF</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.peekAddr} numberOfLines={2}>
                      {c.address}
                    </Text>

                    <Pressable
                      onPress={() => openGoogleMapsNative(c)}
                      style={({ pressed }) => [styles.peekBtn, pressed && { opacity: 0.92 }]}
                    >
                      <MaterialCommunityIcons name="google-maps" size={16} color="#fff" />
                      <Text style={styles.peekBtnText}>Open Maps</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* DETAIL SHEET */}
        <Modal visible={detailOpen} transparent animationType="fade" onRequestClose={() => setDetailOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDetailOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              {selected ? (
                <>
                  <View style={styles.sheetHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetTitle}>{selected.name}</Text>
                      <Text style={styles.sheetSub}>
                        {selected.desa} • {formatDistance(selected.distanceKm)} • {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}
                      </Text>
                    </View>
                    <Pressable onPress={() => setDetailOpen(false)} hitSlop={10} style={styles.closeX}>
                      <MaterialCommunityIcons name="close" size={22} color={TEXT} />
                    </Pressable>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={GREEN} />
                    <Text style={styles.infoText}>{selected.address}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={GREEN} />
                    <Text style={styles.infoText}>{selected.availability.todayLabel}</Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable onPress={() => openGoogleMapsNative(selected)} style={styles.primaryBtn}>
                      <MaterialCommunityIcons name="google-maps" size={18} color="#fff" />
                      <Text style={styles.primaryBtnText}>Open Maps</Text>
                    </Pressable>

                    <Pressable onPress={() => onCall(selected)} style={styles.secondaryBtn}>
                      <MaterialCommunityIcons name="phone-outline" size={18} color={GREEN} />
                      <Text style={styles.secondaryBtnText}>Hubungi</Text>
                    </Pressable>
                  </View>

                  <View style={styles.scheduleBox}>
                    <Text style={styles.scheduleTitle}>Jam Ketersediaan</Text>
                    {selected.availability.slots.map((s, i) => (
                      <View key={`${selected.id}-${i}`} style={styles.slotRow}>
                        <Text style={styles.slotDay}>{s.day}</Text>
                        <Text style={styles.slotTime}>{s.time}</Text>
                        <Text style={styles.slotNote}>{s.note ?? "—"}</Text>
                      </View>
                    ))}
                    <Text style={styles.micro}>
                      Catatan: jadwal bisa berubah jika ada kegiatan desa. Disarankan konfirmasi terlebih dahulu.
                    </Text>
                  </View>
                </>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  root: { flex: 1, backgroundColor: BG },

  topBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  topTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  topSub: { marginTop: 2, fontSize: 12, fontWeight: "800", color: MUTED },

  locBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: GREEN,
  },
  locBtnText: { color: "#fff", fontWeight: "900" },

  filterCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 10, android: 8, default: 8 }),
  },
  searchInput: { flex: 1, color: TEXT, fontWeight: "800" },

  filtersRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  radiusGroup: { flex: 1 },
  smallLabel: { fontSize: 12, fontWeight: "900", color: MUTED, marginBottom: 8 },
  radiusBtns: { flexDirection: "row", gap: 8 },
  radiusBtn: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.03)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  radiusText: { fontWeight: "900", color: TEXT },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  toggleOn: { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },
  toggleText: { fontWeight: "900", color: "#92400e" },

  warnBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  warnText: { flex: 1, color: "#92400e", fontWeight: "800", lineHeight: 18 },

  helper: { marginTop: 10, color: MUTED, fontWeight: "700", lineHeight: 18 },

  mapWrap: {
    flex: 1,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
    backgroundColor: "#fff",
  },

  meMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },

  markerWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },
  markerWrapAvail: { backgroundColor: GREEN },

  bottomPeek: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  peekHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  peekTitle: { fontSize: 14, fontWeight: "900", color: TEXT },
  peekHint: { fontSize: 12, fontWeight: "900", color: MUTED },

  peekCard: {
    width: Math.min(260, width * 0.68),
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  peekTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  avatarAvail: { backgroundColor: GREEN },
  peekName: { fontWeight: "900", color: TEXT },
  peekMeta: { marginTop: 2, fontWeight: "800", color: MUTED, fontSize: 12 },

  badgeAvail: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeAvailText: { color: "#166534", fontWeight: "900", fontSize: 11 },
  badgeOff: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeOffText: { color: "#374151", fontWeight: "900", fontSize: 11 },

  peekAddr: { marginTop: 8, color: MUTED, fontWeight: "700", lineHeight: 18, fontSize: 12 },

  peekBtn: {
    marginTop: 10,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  peekBtnText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, maxHeight: height * 0.78 },
  sheetHead: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  sheetTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  sheetSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: MUTED, lineHeight: 18 },
  closeX: {
    width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.04)",
  },

  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6 },
  infoText: { flex: 1, color: MUTED, fontWeight: "800", lineHeight: 18 },

  actions: { marginTop: 10, flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
  secondaryBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(47,111,27,0.20)",
    backgroundColor: "rgba(47,111,27,0.06)",
  },
  secondaryBtnText: { color: GREEN, fontWeight: "900" },

  scheduleBox: {
    marginTop: 12,
    backgroundColor: "rgba(17,24,39,0.03)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  scheduleTitle: { fontWeight: "900", color: TEXT, marginBottom: 8 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  slotDay: { width: 70, fontWeight: "900", color: TEXT, fontSize: 12 },
  slotTime: { width: 110, fontWeight: "900", color: GREEN, fontSize: 12 },
  slotNote: { flex: 1, color: MUTED, fontWeight: "800", fontSize: 12, lineHeight: 16 },
  micro: { marginTop: 8, color: MUTED, fontWeight: "700", lineHeight: 18, fontSize: 12 },
});
