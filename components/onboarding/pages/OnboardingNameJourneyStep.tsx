import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  JOURNEY_CELL_OPACITY_RHYTHM,
  JOURNEY_COMPLETED_DAYS,
  JOURNEY_TODAY_INDEX,
} from "@/constants/onboarding/journey";
import { USER_NAME_MAX_LENGTH } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingNameJourneyStep({
  userNameInput,
  onChangeUserName,
  onJourneyGridLayout,
  journeyRows,
  journeyCellSize,
  journeyColumnGap,
  journeyRowGap,
  journeyGridContentHeight,
  journeyGridContentWidth,
}: {
  userNameInput: string;
  onChangeUserName: (text: string) => void;
  onJourneyGridLayout: (width: number, height: number) => void;
  journeyRows: number[][];
  journeyCellSize: number;
  journeyColumnGap: number;
  journeyRowGap: number;
  journeyGridContentHeight: number;
  journeyGridContentWidth: number;
}) {
  return (
    <CenteredStep>
      <View style={styles.nameEntryWrap}>
        <Text style={styles.nameEntryTitle}>Ready to start your 60 day faith journey?</Text>
        <Text style={styles.nameEntrySubtitle}>What should we call you?</Text>
        <View style={styles.journeyHeroCard}>
          <LinearGradient
            colors={["rgba(41,27,66,0.86)", "rgba(35,23,58,0.9)", "rgba(26,17,44,0.92)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.journeyHeroGradient}
          >
            <View
              style={styles.journeyBoardLayer}
              pointerEvents="none"
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                onJourneyGridLayout(width, height);
              }}
            >
              <View
                style={[
                  styles.journeyBoardGrid,
                  {
                    rowGap: journeyRowGap,
                    height: Math.round(journeyGridContentHeight),
                    width: Math.round(journeyGridContentWidth),
                  },
                ]}
              >
                {journeyRows.map((row, rowIndex) => (
                  <View key={`journey-row-${rowIndex}`} style={[styles.journeyBoardRow, { columnGap: journeyColumnGap }]}>
                    {row.map((i) => {
                      const isCompleted = i < JOURNEY_COMPLETED_DAYS;
                      const isRecentStreak = i >= JOURNEY_COMPLETED_DAYS && i < JOURNEY_TODAY_INDEX;
                      const isToday = i === JOURNEY_TODAY_INDEX;
                      const isPast = isCompleted || isRecentStreak;
                      const opacityBeat = JOURNEY_CELL_OPACITY_RHYTHM[i % JOURNEY_CELL_OPACITY_RHYTHM.length];

                      return (
                        <View
                          key={`cell-${i}`}
                          style={[
                            styles.journeyDayCell,
                            {
                              width: journeyCellSize,
                              height: journeyCellSize,
                              borderRadius: Math.max(6, Math.round(journeyCellSize * 0.3)),
                              opacity: opacityBeat,
                            },
                            !isPast && !isToday && styles.journeyDayCellFuture,
                            isCompleted && styles.journeyDayCellCompleted,
                            isRecentStreak && styles.journeyDayCellRecent,
                            isToday && styles.journeyDayCellToday,
                          ]}
                        >
                          {(isPast || isToday) && (
                            <Ionicons
                              name={isToday ? "star" : "checkmark"}
                              size={
                                isToday
                                  ? Math.max(11, Math.round(journeyCellSize * 0.56))
                                  : Math.max(10, Math.round(journeyCellSize * 0.48))
                              }
                              style={[
                                styles.journeyDayMark,
                                isRecentStreak && styles.journeyDayMarkRecent,
                                isToday && styles.journeyDayMarkToday,
                              ]}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.journeyBoardVeil} pointerEvents="none" />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.08)", "transparent", "rgba(10,7,18,0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.journeyCardEdge}
            />
          </LinearGradient>
        </View>
        <TextInput
          value={userNameInput}
          onChangeText={(t) => onChangeUserName(t.slice(0, USER_NAME_MAX_LENGTH))}
          placeholder="Enter your name"
          placeholderTextColor="rgba(196,162,247,0.55)"
          style={styles.nameEntryInput}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={USER_NAME_MAX_LENGTH}
          returnKeyType="done"
        />
      </View>
    </CenteredStep>
  );
}
