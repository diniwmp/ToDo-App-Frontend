import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setVisible(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setVisible(false);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8, textAlign: "center" },
        message: { fontSize: 14, color: colors.secondaryText, textAlign: "center", marginBottom: 24, lineHeight: 20 },
        buttonRow: { flexDirection: "row", gap: 12 },
        cancelBtn: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        cancelText: { color: colors.text, fontWeight: "600", fontSize: 15 },
        confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
        confirmText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
      }),
    [colors]
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => handleClose(false)}>
        <TouchableWithoutFeedback onPress={() => handleClose(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.card}>
                <Text style={styles.title}>{options.title}</Text>
                {options.message ? <Text style={styles.message}>{options.message}</Text> : null}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleClose(false)} activeOpacity={0.8}>
                    <Text style={styles.cancelText}>{options.cancelText || "Cancel"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: options.destructive ? colors.error : colors.primary }]}
                    onPress={() => handleClose(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmText}>{options.confirmText || "Confirm"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextValue => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};