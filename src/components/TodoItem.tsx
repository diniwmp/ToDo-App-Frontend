import React, { useRef, useEffect } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { ColorPalette } from "../context/ThemeContext";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoItemProps {
  item: Todo;
  isExpanded: boolean;
  colors: ColorPalette;
  styles: any;
  onPress: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TodoItem({ item, isExpanded, colors, styles, onPress, onToggle, onEdit, onDelete }: TodoItemProps) {
  const checkAnim = useRef(new Animated.Value(item.completed ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(checkAnim, {
      toValue: item.completed ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [item.completed]);

  const handleTogglePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 100, useNativeDriver: false }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
    onToggle();
  };

  const animatedBackgroundColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.primary],
  });

  const animatedBorderColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <TouchableOpacity style={[styles.todoCard, isExpanded && styles.todoCardPressed]} onPress={onPress} activeOpacity={1}>
      <View style={styles.todoContent}>
        <Text style={[styles.todoTitle, item.completed && styles.completedTitle]}>{item.title}</Text>

        {isExpanded && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.updateButton} onPress={onEdit} activeOpacity={0.8}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.8}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={(e: any) => {
          e.stopPropagation();
          handleTogglePress();
        }}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.toggleButton,
            {
              backgroundColor: animatedBackgroundColor,
              borderColor: animatedBorderColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.toggleButtonText, item.completed && styles.completedButtonText]}>
            {item.completed ? "✓" : "○"}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}