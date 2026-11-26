import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { awardPoints, refreshLeaderboard } from '../store/leaderboardSlice';
import { useTheme } from '../context/ThemeContext';
import { Screen, AppButton, AppInput, Chip, ErrorText } from '../components/ui';

const QUICK = [5, 10, 25, 50, -5, -10];

export default function AwardPointsScreen({ route, navigation }) {
  const { studentId } = route.params;
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const student = useSelector((s) => s.leaderboard.items.find((i) => i.studentId === studentId));
  const { awardStatus } = useSelector((s) => s.leaderboard);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    const points = parseInt(value, 10);
    if (!Number.isInteger(points) || points === 0) return setError('Enter a non-zero whole number');
    if (Math.abs(points) > 1000) return setError('Maximum 1000 points per action');
    if (student && student.points + points < 0) return setError('Points cannot go below 0');
    setError('');
    const result = await dispatch(awardPoints({ studentId, points }));
    if (awardPoints.fulfilled.match(result)) {
      dispatch(refreshLeaderboard()); // reconcile ranks across pages in the background
      navigation.goBack();
    } else {
      setError(result.payload || 'Could not update points');
    }
  };

  if (!student) {
    return <Screen><Text style={{ color: colors.text }}>Student not found.</Text></Screen>;
  }

  return (
    <Screen>
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{student.name}</Text>
        <Text style={{ color: colors.subtext, marginTop: 4 }}>Rank #{student.rank} · {student.points} pts</Text>
      </View>

      <Text style={{ color: colors.subtext, fontWeight: '600', marginBottom: 8 }}>Quick pick</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {QUICK.map((q) => (
          <Chip key={q} label={q > 0 ? `+${q}` : `${q}`} selected={value === String(q)} onPress={() => setValue(String(q))} />
        ))}
      </View>

      <AppInput
        label="Or enter points (use a minus sign to deduct)"
        value={value}
        onChangeText={setValue}
        keyboardType="numbers-and-punctuation"
        placeholder="e.g. 15 or -5"
      />
      <ErrorText>{error}</ErrorText>
      <AppButton title="Submit" onPress={submit} loading={awardStatus === 'loading'} />
    </Screen>
  );
}
