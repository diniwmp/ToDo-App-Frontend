import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootParamList } from "../../App";
import { getAuthStyles } from "../css/SignIn-UpScreen.styles";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { signUpUser } from "../APIs/APIs";

interface SignUpScreenProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onSignUp?: (name: string, email: string, password: string) => void;
  onSecondaryAction?: () => void;
}

type SignUpNavigationProps = NativeStackNavigationProp<RootParamList, "SignUp">;

export default function SignUp({
  title = "Create Account",
  subtitle = "Sign up to get started",
  primaryButtonText = "Sign Up",
  secondaryButtonText = "Sign In",
  onSignUp,
  onSecondaryAction,
}: SignUpScreenProps) {
  const navigator = useNavigation<SignUpNavigationProps>();
  const { colors, theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => getAuthStyles(colors), [colors]);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

  const handleSignUp = async () => {
    if (onSignUp) {
      onSignUp(name, email, password);
    } else {
      const result = await signUpUser(name, email, password);
      if (result.success) {
        showToast("Account created successfully! Please sign in.", "success");
        navigator.replace("SignIn");
      } else {
        showToast(result.error || "Sign up failed", "error");
      }
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      navigator.replace("SignIn");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={[styles.input, isNameFocused && styles.inputFocused]}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.placeholderText}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={[styles.input, isEmailFocused && styles.inputFocused]}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.placeholderText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={[styles.input, isPasswordFocused && styles.inputFocused]}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Create a password"
                    placeholderTextColor={colors.placeholderText}
                    secureTextEntry
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} activeOpacity={0.8}>
                  <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSecondaryAction} activeOpacity={0.6}>
                <Text style={styles.secondaryButtonText}>
                  Already have an account? <Text style={styles.linkText}>{secondaryButtonText}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}