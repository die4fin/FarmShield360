import { Stack } from "expo-router";

export default function FeaturesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f6fbf6" }, // background putih lembut, ga hitam
      }}
    />
  );
}
