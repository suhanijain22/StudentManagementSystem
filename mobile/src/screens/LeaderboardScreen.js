import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard, fetchMyStanding, refreshLeaderboard } from '../store/leaderboardSlice';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PAGE_SIZE } from '../config';
import { Screen, Chip, ErrorText } from '../components/ui';

const SORTS = [
  { label: 'Top points', sortBy: 'points', direction: 'desc' },
  { label: 'Lowest points', sortBy: 'points', direction: 'asc' },
  { label: 'Name A–Z', sortBy: 'name', direction: 'asc' },
];
const medal = (r) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : null);

function Row({ item, mine, onPress, colors }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderRadius: 14,
        backgroundColor: mine ? colors.highlight : colors.card,
        borderWidth: mine ? 2 : 1, borderColor: mine ? colors.primary : colors.border, opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ width: 44, alignItems: 'center' }}>
        <Text style={{ fontSize: medal(item.rank) ? 24 : 16, fontWeight: '800', color: colors.text }}>
          {medal(item.rank) || `#${item.rank}`}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>
          {item.name}{mine ? '  (You)' : ''}
        </Text>
        {onPress ? <Text style={{ color: colors.subtext, fontSize: 12 }}>Tap to award points</Text> : null}
      </View>
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>{item.points} pts</Text>
    </Pressable>
  );
}

export default function LeaderboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user, isTeacher, isStudent } = useAuth();
  const lb = useSelector((s) => s.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: 0, size: PAGE_SIZE }));
    if (isStudent) dispatch(fetchMyStanding());
  }, [dispatch, isStudent]);

  const loadMore = useCallback(() => {
    if (!lb.last && lb.status !== 'loading' && !lb.loadingMore && !lb.refreshing) {
      dispatch(fetchLeaderboard({ page: lb.page + 1 }));
    }
  }, [dispatch, lb.last, lb.page, lb.status, lb.loadingMore, lb.refreshing]);

  const changeSort = (s) =>
    dispatch(fetchLeaderboard({ page: 0, size: PAGE_SIZE, sortBy: s.sortBy, direction: s.direction }));

  const header = (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Hi, {user?.name} 👋</Text>
      <Text style={{ color: colors.subtext, marginBottom: 14 }}>
        {isTeacher ? 'Teacher view – tap a student to award or adjust points' : 'Student view – read-only leaderboard'}
      </Text>

      {isStudent && lb.myStanding ? (
        <View style={{ backgroundColor: colors.primary, borderRadius: 18, padding: 18, marginBottom: 16 }}>
          <Text style={{ color: colors.onPrimary, opacity: 0.85, fontWeight: '600' }}>Your standing</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
            <Text style={{ color: colors.onPrimary, fontSize: 40, fontWeight: '900' }}>#{lb.myStanding.rank}</Text>
            <Text style={{ color: colors.onPrimary, fontSize: 22, fontWeight: '800' }}>{lb.myStanding.points} pts</Text>
          </View>
          <Text style={{ color: colors.onPrimary, opacity: 0.85, marginTop: 4 }}>
            out of {lb.totalElements} students
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {SORTS.map((s) => (
          <Chip
            key={s.label}
            label={s.label}
            selected={lb.sortBy === s.sortBy && lb.direction === s.direction}
            onPress={() => changeSort(s)}
          />
        ))}
      </View>
      <ErrorText>{lb.error}</ErrorText>
    </View>
  );

  return (
    <Screen padded={false}>
      {lb.status === 'loading' && lb.items.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={lb.items}
          keyExtractor={(i) => String(i.studentId)}
          contentContainerStyle={{ padding: 20 }}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <Row
              item={item}
              colors={colors}
              mine={isStudent && item.studentId === user?.studentId}
              onPress={isTeacher ? () => navigation.navigate('AwardPoints', { studentId: item.studentId }) : undefined}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={lb.refreshing} onRefresh={() => dispatch(refreshLeaderboard())} tintColor={colors.primary} />
          }
          ListFooterComponent={lb.loadingMore ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : null}
          ListEmptyComponent={
            lb.status !== 'loading' ? (
              <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 30 }}>No students yet.</Text>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
