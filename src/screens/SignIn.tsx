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
import { signInUser } from "../APIs/APIs";
import { storeUserEmail } from "../util/AsyncStorage";

interface LoginScreenProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onLogin?: (email: string, password: string) => void;
  onSecondaryAction?: () => void;
}

type SignInNavigationProps = NativeStackNavigationProp<RootParamList, "SignIn">;

export default function SignIn({
  title = "Welcome Back",
  subtitle = "Sign in to your account",
  primaryButtonText = "Sign In",
  secondaryButtonText = "Create Account",
  onLogin,
  onSecondaryAction,
}: LoginScreenProps) {
  const navigator = useNavigation<SignInNavigationProps>();
  const { colors, theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => getAuthStyles(colors), [colors]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async () => {
    if (onLogin) {
      onLogin(email, password);
    } else {
      setIsLoading(true);
      const result = await signInUser(email, password);

      if (result.success) {
        await storeUserEmail(email);
        navigator.replace("Home", { userId: result.data?.userId || "12345" });
      } else {
        showToast(result.error || "Sign in failed", "error");
      }

      setIsLoading(false);
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      navigator.replace("SignUp");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isFormValid = email.trim() && password.trim();

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
                    editable={!isLoading}
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
                    placeholder="Enter your password"
                    placeholderTextColor={colors.placeholderText}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={isFormValid && !isLoading ? handleSignIn : undefined}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSignIn}
                  activeOpacity={0.8}
                  disabled={isLoading || !isFormValid}
                >
                  <Text style={styles.primaryButtonText}>{isLoading ? "Signing In..." : primaryButtonText}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSecondaryAction}
                activeOpacity={0.6}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>
                  Don't have an account? <Text style={styles.linkText}>{secondaryButtonText}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}