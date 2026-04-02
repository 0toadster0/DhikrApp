import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingVerseMorningStep() {
  return (
    <CenteredStep>
      <Ionicons name="book-outline" size={60} color="#C4A2F7" />
      <Text style={styles.stepTitle}>Begin each day{"\n"}with something grounding.</Text>
      <View style={styles.verseCard}>
        <Text style={styles.verseArabic}>وَلَذِكْرُ اللَّهِ أَكْبَرُ</Text>
        <Text style={styles.verseTranslit}>Wa ladhikru-Llāhi akbar</Text>
        <Text style={styles.verseTranslation}>"And the remembrance of Allah is greatest."</Text>
        <Text style={styles.verseRef}>— Quran 29:45</Text>
      </View>
      <Text style={styles.stepSub}>A new verse every morning. Your anchor before the day begins.</Text>
    </CenteredStep>
  );
}
