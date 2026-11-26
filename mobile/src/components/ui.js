import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export function Screen({ children, style, padded = true }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[{ flex: 1, backgroundColor: colors.bg }, padded && { padding: 20 }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

export function AppButton({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: isPrimary ? colors.primary : 'transparent', borderColor: colors.primary,
          opacity: disabled || loading ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.buttonText, { color: isPrimary ? colors.onPrimary : colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function AppInput({ label, error, style, ...props }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: colors.card, color: colors.text,
          borderColor: error ? colors.danger : colors.border }, style]}
        {...props}
      />
      {error ? <Text style={{ color: colors.danger, marginTop: 4, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : colors.card }]}
    >
      <Text style={{ color: selected ? colors.onPrimary : colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function ErrorText({ children }) {
  const { colors } = useTheme();
  if (!children) return null;
  return <Text style={{ color: colors.danger, marginBottom: 12 }}>{children}</Text>;
}

export function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, marginRight: 4 }}>{isDark ? '🌙' : '☀️'}</Text>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        accessibilityLabel="Toggle dark mode"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: '700', fontSize: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
});
