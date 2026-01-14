import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const first = await AsyncStorage.getItem("firstLaunchDone");
      const savedUser = await AsyncStorage.getItem("user");
      setIsFirstLaunch(first !== "true");
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setIsReady(true);
    })();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("firstLaunchDone", "true");
    setIsFirstLaunch(false);
  };

  const login = async (userData) => {
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isReady, isFirstLaunch, user, login, logout, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
