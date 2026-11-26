import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { Screen, AppButton, AppInput, ErrorText, ThemeToggle } from '../components/ui';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const submit = () => {
    if (!email.trim() || !password) return setLocalError('Enter your email and password');
    setLocalError('');
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'flex-end', marginBottom: 12 }}><ThemeToggle /></View>
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>Welcome back 👋</Text>
          <Text style={{ color: colors.subtext, marginTop: 6, marginBottom: 28 }}>Sign in to the Student Leaderboard</Text>
          <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@school.com" />
          <AppInput label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <ErrorText>{localError || error}</ErrorText>
          <AppButton title="Sign in" onPress={submit} loading={status === 'loading'} />
          <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>New here? Create an account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
