import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AwardPointsScreen from '../screens/AwardPointsScreen';
import HeaderActions from '../components/HeaderActions';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isTeacher, bootstrapped } = useAuth();
  const { isDark, colors } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.primary,
    },
  };

  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // Unauthenticated users can ONLY reach these screens.
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ title: 'Leaderboard', headerRight: () => <HeaderActions /> }}
            />
            {/* Route-level protection: this screen is not even registered for students. */}
            {isTeacher && (
              <Stack.Screen
                name="AwardPoints"
                component={AwardPointsScreen}
                options={{ title: 'Award points', presentation: 'modal' }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
