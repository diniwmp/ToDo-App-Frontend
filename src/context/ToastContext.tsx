import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { Animated, StyleSheet, Text, Easing } from "react-native";
import { useTheme } from "./ThemeContext";

type ToastType = "success" | "error" | "info";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "info" });
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 2500) => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);

      setToast({ visible: true, message, type });
      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      hideTimeout.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [translateY, opacity, hideToast]
  );

  const backgroundColor =
    toast.type === "success" ? colors.success : toast.type === "error" ? colors.error : colors.primary;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toastContainer, { backgroundColor, transform: [{ translateY }], opacity }]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", textAlign: "center" },
});