import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";
import { getHomeStyles } from "../css/HomeScreen.styles";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import TodoItem from "../components/TodoItem";
import SkeletonCard from "../components/SkeletonCard";
import {
  fetchUserTodos,
  addTodo,
  deleteTodo,
  updateTodoStatus,
  updateTodoTitle,
} from "../APIs/APIs";
import { getUserEmail, clearUserEmail } from "../util/AsyncStorage";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface HomeScreenProps {
  onToggleTodo?: (id: string) => void;
  onLogout?: () => void;
}

type HomeNavigationProps = NativeStackNavigationProp<RootParamList, "Home">;

export default function Home({ onToggleTodo, onLogout }: HomeScreenProps) {
  const navigator = useNavigation<HomeNavigationProps>();
  const { colors, theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const homeStyles = useMemo(() => getHomeStyles(colors), [colors]);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [isTitleFocused, setIsTitleFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    const storedEmail = await getUserEmail();

    if (storedEmail) {
      loadTodos();
    } else {
      showToast("Session expired. Please sign in again.", "error");
      navigator.replace("SignIn");
    }
  };

  // Initial load - full skeleton
  const loadTodos = async () => {
    setIsLoading(true);
    const result = await fetchUserTodos();

    if (result.success && result.todos) {
      setTodos(result.todos);
    } else if (!result.success) {
      showToast(result.error || "Failed to load todos", "error");
    }
    setIsLoading(false);
  };

  const refreshTodosSilently = async () => {
    const result = await fetchUserTodos();
    if (result.success && result.todos) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTodos(result.todos);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTodo(null);
    setNewTodoTitle("");
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoTitle(todo.title);
    setExpandedTodoId(null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setNewTodoTitle("");
    setEditingTodo(null);
  };

  const handleSaveTodo = async () => {
    if (!newTodoTitle.trim()) {
      showToast("Please enter a todo title", "error");
      return;
    }

    if (editingTodo) {
      const result = await updateTodoTitle(editingTodo.id, newTodoTitle.trim());
      if (result.success) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTodos((prev) =>
          prev.map((t) => (t.id === editingTodo.id ? { ...t, title: newTodoTitle.trim() } : t))
        );
        handleCloseModal();
        showToast("Todo updated!", "success");
      } else {
        showToast(result.error || "Failed to update todo", "error");
      }
    } else {
      const result = await addTodo(newTodoTitle.trim());
      if (result.success) {
        handleCloseModal();
        await refreshTodosSilently();
        showToast("Todo added!", "success");
      } else {
        showToast(result.error || "Failed to add todo", "error");
      }
    }
  };

  const handleToggleTodo = async (id: string) => {
    if (onToggleTodo) {
      onToggleTodo(id);
      return;
    }

    const targetTodo = todos.find((t) => t.id === id);
    if (!targetTodo) return;

    const newStatus = !targetTodo.completed;

    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: newStatus } : todo))
    );

    const result = await updateTodoStatus(id, newStatus);

    if (!result.success) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !newStatus } : todo))
      );
      showToast("Failed to update todo status. Please try again.", "error");
    }
  };

  const handleCardPress = (todoId: string) => {
    setExpandedTodoId(expandedTodoId === todoId ? null : todoId);
  };

  const handleDeleteTodo = async (todo: Todo) => {
    const confirmed = await confirm({
      title: "Delete Todo",
      message: `Are you sure you want to delete "${todo.title}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });

    if (!confirmed) return;

    const result = await deleteTodo(todo.id);

    if (result.success) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== todo.id));
      setExpandedTodoId(null);
      showToast("Todo deleted successfully!", "success");
    } else {
      showToast(result.error || "Failed to delete todo", "error");
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      const cleared = await clearUserEmail();
      if (cleared) {
        navigator.replace("SignIn");
      } else {
        showToast("Failed to logout properly", "error");
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (isLoading) {
    return (
      <SafeAreaView style={homeStyles.safeArea}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <View style={homeStyles.header}>
          <View>
            <Text style={homeStyles.title}>My Todos</Text>
          </View>
        </View>
        <View style={homeStyles.listContent}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} colors={colors} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={homeStyles.header}>
        <View>
          <Text style={homeStyles.title}>My Todos</Text>
          <Text style={homeStyles.subtitle}>
            {activeTodos.length} active, {completedTodos.length} completed
          </Text>
        </View>

        <View style={homeStyles.headerButtons}>
          <TouchableOpacity style={homeStyles.addButton} onPress={handleOpenAddModal} activeOpacity={0.8}>
            <Text style={homeStyles.addButtonText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={homeStyles.menuButton} onPress={() => setIsMenuVisible(true)} activeOpacity={0.8}>
            <Text style={homeStyles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={homeStyles.listContainer}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              isExpanded={expandedTodoId === item.id}
              colors={colors}
              styles={homeStyles}
              onPress={() => handleCardPress(item.id)}
              onToggle={() => handleToggleTodo(item.id)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleDeleteTodo(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={homeStyles.listContent}
          ItemSeparatorComponent={() => <View style={homeStyles.separator} />}
          ListEmptyComponent={
            <View style={homeStyles.emptyState}>
              <Text style={homeStyles.emptyStateIcon}>📝</Text>
              <Text style={homeStyles.emptyStateTitle}>No todos yet</Text>
              <Text style={homeStyles.emptyStateSubtitle}>Tap the + button to add your first todo</Text>
            </View>
          }
        />
      </View>

      {/* Add / Edit Todo Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
        <KeyboardAvoidingView style={homeStyles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={homeStyles.modalOverlay}>
              <View style={homeStyles.modalContent}>
                <Text style={homeStyles.modalTitle}>{editingTodo ? "Edit Todo" : "Add New Todo"}</Text>

                <View style={homeStyles.inputGroup}>
                  <Text style={homeStyles.inputLabel}>Title</Text>
                  <TextInput
                    style={[homeStyles.input, isTitleFocused && homeStyles.inputFocused]}
                    value={newTodoTitle}
                    onChangeText={setNewTodoTitle}
                    onFocus={() => setIsTitleFocused(true)}
                    onBlur={() => setIsTitleFocused(false)}
                    placeholder="Enter todo title"
                    placeholderTextColor={colors.placeholderText}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveTodo}
                    autoFocus
                  />
                </View>

                <View style={homeStyles.modalButtons}>
                  <TouchableOpacity style={homeStyles.cancelButton} onPress={handleCloseModal} activeOpacity={0.8}>
                    <Text style={homeStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={homeStyles.primaryButton} onPress={handleSaveTodo} activeOpacity={0.8}>
                    <Text style={homeStyles.primaryButtonText}>{editingTodo ? "Save Changes" : "Add Todo"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isMenuVisible} transparent={true} animationType="fade" onRequestClose={() => setIsMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={homeStyles.menuOverlay}>
            <View style={homeStyles.menuDropdown}>
              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => {
                  setIsMenuVisible(false);
                  toggleTheme();
                }}
                activeOpacity={0.7}
              >
                <Text style={homeStyles.menuItemTextNormal}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</Text>
              </TouchableOpacity>

              <View style={homeStyles.menuSeparator} />

              <TouchableOpacity
                style={homeStyles.menuItem}
                onPress={() => {
                  setIsMenuVisible(false);
                  handleLogout();
                }}
                activeOpacity={0.7}
              >
                <Text style={homeStyles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}