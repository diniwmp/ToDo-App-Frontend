import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, UIManager } from "react-native";
import SignIn from "./src/screens/SignIn";
import SignUp from "./src/screens/SignUp";
import Home from "./src/screens/Home";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ToastProvider } from "./src/context/ToastContext";
import { ConfirmProvider } from "./src/context/ConfirmContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type RootParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: { userId: string };
};
const Stack = createNativeStackNavigator<RootParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="SignIn" component={SignIn} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>
          </NavigationContainer>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
