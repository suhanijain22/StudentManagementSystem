import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearAuthError } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { Screen, AppButton, AppInput, ErrorText, Chip } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    dispatch(register({ ...form, name: form.name.trim(), email: form.email.trim() }));
  };

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <AppInput label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
          <AppInput label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
          <AppInput label="Password" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
          <Text style={{ color: colors.subtext, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>I am a…</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Chip label="🎓 Student" selected={form.role === 'STUDENT'} onPress={() => set('role')('STUDENT')} />
            <Chip label="👩‍🏫 Teacher" selected={form.role === 'TEACHER'} onPress={() => set('role')('TEACHER')} />
          </View>
          <ErrorText>{error}</ErrorText>
          <AppButton title="Create account" onPress={submit} loading={status === 'loading'} />
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Already have an account? Sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
