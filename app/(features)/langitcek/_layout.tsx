import { Stack } from "expo-router";
import { LangitCekProvider } from "../../../src/contexts/LangitCekContext";

export default function LangitCekLayout() {
  return (
    <LangitCekProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LangitCekProvider>
  );
}