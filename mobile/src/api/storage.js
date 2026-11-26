import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sms.session';
// SecureStore (Keychain / Keystore) on devices; AsyncStorage fallback on web.
const secure = Platform.OS !== 'web';

export async function saveSession(session) {
  const value = JSON.stringify(session);
  if (secure) await SecureStore.setItemAsync(KEY, value);
  else await AsyncStorage.setItem(KEY, value);
}

export async function loadSession() {
  try {
    const raw = secure ? await SecureStore.getItemAsync(KEY) : await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    if (secure) await SecureStore.deleteItemAsync(KEY);
    else await AsyncStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
