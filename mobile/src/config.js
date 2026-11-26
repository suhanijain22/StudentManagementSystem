import Constants from 'expo-constants';
import { Platform } from 'react-native';

// In dev, Expo exposes the dev machine's LAN IP (hostUri). The Spring Boot server runs on the same machine.
// For tunnels / unusual networks set EXPO_PUBLIC_API_URL (see .env.example).
function resolveHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (hostUri) return hostUri.split(':')[0];
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${resolveHost()}:8080/api`;
export const PAGE_SIZE = 15;
