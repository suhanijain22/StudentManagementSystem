import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ui';

export default function HeaderActions() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ThemeToggle />
      <Pressable onPress={() => dispatch(logout())} hitSlop={10} style={{ marginLeft: 12 }}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
