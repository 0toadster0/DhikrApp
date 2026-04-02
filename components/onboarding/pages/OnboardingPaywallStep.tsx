import React from "react";
import { Pressable, Text, View } from "react-native";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingPaywallStep({
  onRestorePurchases,
  mutedForeground,
}: {
  onRestorePurchases: () => void;
  mutedForeground: string;
}) {
  return (
    <CenteredStep>
      <Text style={styles.stepTitle}>Start your free trial.</Text>
      <Text style={styles.stepSub}>Everything you need to choose faith first, every day.</Text>
      <View style={[styles.paywallCard, styles.paywallCardBest]}>
        <View style={styles.paywallBestBadge}>
          <Text style={styles.paywallBestText}>Best Value</Text>
        </View>
        <Text style={styles.paywallPlan}>Yearly</Text>
        <Text style={styles.paywallPrice}>$3.99 / month</Text>
        <Text style={styles.paywallSub}>$47.99 billed annually · 3-day free trial</Text>
      </View>
      <View style={styles.paywallCard}>
        <Text style={styles.paywallPlan}>Weekly</Text>
        <Text style={styles.paywallPrice}>$1.99 / week</Text>
      </View>
      <Pressable onPress={onRestorePurchases}>
        <Text style={[styles.restoreText, { color: mutedForeground }]}>Restore Purchases</Text>
      </Pressable>
    </CenteredStep>
  );
}
