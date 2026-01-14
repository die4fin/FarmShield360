import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../state/auth";
import OnboardingStack from "./OnboardingStack";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function RootNavigator() {
  const { isReady, isFirstLaunch, user } = useAuth();

  if (!isReady) return null;

  return (
    <NavigationContainer>
      {isFirstLaunch ? (
        <OnboardingStack />
      ) : user ? (
        <AppTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
