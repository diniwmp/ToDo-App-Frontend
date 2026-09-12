import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
const USER_EMAIL_KEY = '@user_email';

// Store user email
export const storeUserEmail = async (email: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
    return true;
  } catch (error) {
    console.error('Error storing user email:', error);
    return false;
  }
};

// Get stored user email
export const getUserEmail = async (): Promise<string | null> => {
  try {
    const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
    return email;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};

// Clear user email for logout
export const clearUserEmail = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(USER_EMAIL_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user email:', error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const email = await getUserEmail();
    return email !== null;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};