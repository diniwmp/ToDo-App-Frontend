import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

export const lightColors = {
  primary: "#8B5FBF",
  secondary: "#A675D1",
  accent: "#B284E0",
  background: "#F8F6FB",
  surface: "#FFFFFF",
  text: "#2D1B42",
  secondaryText: "#8A7A9B",
  placeholderText: "#C4B8D6",
  border: "#E8E1F0",
  focusedBorder: "#8B5FBF",
  disabled: "#F3F0F8",
  link: "#8B5FBF",
  success: "#7C4DFF",
  error: "#D81B60",
  warning: "#FF6B35",
};

export const darkColors = {
  primary: "#A675D1",
  secondary: "#8B5FBF",
  accent: "#B284E0",
  background: "#15111C",
  surface: "#211A2C",
  text: "#F1ECFA",
  secondaryText: "#B3A6C4",
  placeholderText: "#6F6280",
  border: "#3A2E4D",
  focusedBorder: "#B284E0",
  disabled: "#2A2236",
  link: "#C9A6F5",
  success: "#9B7BFF",
  error: "#FF6699",
  warning: "#FFA36B",
};

export type ColorPalette = typeof lightColors;

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ColorPalette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = "@app_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};