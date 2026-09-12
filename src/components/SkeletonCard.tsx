import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { ColorPalette } from "../context/ThemeContext";

export default function SkeletonCard({ colors }: { colors: ColorPalette }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: pulseAnim,
        backgroundColor: colors.surface,
        borderRadius: 12,
        height: 64,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    />
  );
}