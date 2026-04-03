import { TOTAL_STEPS } from "@/constants/onboarding/content";

/** Primary footer CTA label for the given onboarding step index. */
export function getOnboardingNextButtonLabel(step: number): string {
  const isLastStep = step === TOTAL_STEPS - 1;
  const isPaywallStep = step === 18;
  if (isLastStep) return "Begin";
  if (isPaywallStep) return "Start Free Trial";
  if (step === 15 || step === 16) return "Allow";
  return "Continue";
}
