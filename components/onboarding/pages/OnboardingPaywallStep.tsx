import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";

import { ONBOARDING_PAYWALL_ART } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";
import type { PlanType } from "@/lib/analytics";

export function OnboardingPaywallStep({
  onRestorePurchases,
  mutedForeground,
  selectedPlan,
  onSelectPlan,
}: {
  onRestorePurchases: () => void;
  mutedForeground: string;
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}) {
  const { width: windowWidth } = useWindowDimensions();
  /** Hero art: ~170–185pt; centers on ~176pt on typical phone widths. */
  const heroArtSize = Math.min(185, Math.max(170, Math.round(windowWidth * 0.451)));

  const yearlySelected = selectedPlan === "yearly_trial";
  const weeklySelected = selectedPlan === "weekly";

  return (
    <CenteredStep style={styles.paywallCenteredStep}>
      <View style={styles.paywallRoot}>
        <View style={styles.paywallHeroSection}>
          <View style={styles.heroArtContainer}>
            <View style={styles.paywallArtAmbient}>
              <Image
                source={ONBOARDING_PAYWALL_ART}
                style={[styles.heroArtImage, { width: heroArtSize, height: heroArtSize }]}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.paywallHeadlineBlock}>
            <Text style={styles.paywallTitle}>Choose your plan</Text>
            <Text style={styles.paywallSubtitle}>
              Start building your daily dhikr habit today.
            </Text>
          </View>
        </View>

        <View style={[styles.paywallCardsStack, styles.planCardSpacing]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: yearlySelected }}
            onPress={() => onSelectPlan("yearly_trial")}
            style={({ pressed }) => [
              styles.paywallCardPressable,
              pressed && { opacity: 0.92 },
            ]}
          >
            <View
              style={[
                styles.paywallCardInner,
                styles.paywallCardYearly,
                !yearlySelected && styles.paywallCardYearlyUnselected,
              ]}
            >
              <View style={styles.paywallTrialBadge} pointerEvents="none">
                <Text style={styles.paywallTrialBadgeText} numberOfLines={1}>
                  Free Trial Included
                </Text>
              </View>
              <View style={styles.paywallCardRow}>
                <View
                  style={[
                    styles.paywallSelectRing,
                    yearlySelected && styles.paywallSelectRingActive,
                  ]}
                >
                  {yearlySelected ? (
                    <Ionicons name="checkmark" size={16} color="#1a0a2e" />
                  ) : null}
                </View>
                <View style={[styles.paywallCardTextCol, styles.paywallCardTextColYearly]}>
                  <Text style={styles.paywallPlanYearly}>Yearly</Text>
                  <Text style={styles.paywallPriceYearly}>$0.76 / week</Text>
                  <Text style={styles.paywallSubYearly}>$39.99 billed annually</Text>
                </View>
              </View>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: weeklySelected }}
            onPress={() => onSelectPlan("weekly")}
            style={({ pressed }) => [
              styles.paywallCardPressable,
              pressed && { opacity: 0.92 },
            ]}
          >
            <View
              style={[
                styles.paywallCardInner,
                styles.paywallCardWeekly,
                weeklySelected && styles.paywallCardWeeklySelected,
              ]}
            >
              <View style={styles.paywallCardRow}>
                <View
                  style={[
                    styles.paywallSelectRing,
                    weeklySelected && styles.paywallSelectRingWeeklyActive,
                  ]}
                >
                  {weeklySelected ? (
                    <Ionicons name="checkmark" size={16} color="#f0eaff" />
                  ) : null}
                </View>
                <View style={styles.paywallCardTextCol}>
                  <Text style={styles.paywallPlanWeekly}>Weekly</Text>
                  <Text style={styles.paywallPriceWeekly}>$9.99 / week</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.paywallRestoreRow}>
          <Text style={[styles.restoreText, { color: mutedForeground }]}>
            Terms and Conditions
          </Text>
          <Pressable onPress={onRestorePurchases} style={styles.paywallRestoreWrap}>
            <Text style={[styles.restoreText, { color: mutedForeground }]}>
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </View>
    </CenteredStep>
  );
}
