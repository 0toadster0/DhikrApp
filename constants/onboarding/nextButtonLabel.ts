import { TOTAL_STEPS } from "@/constants/onboarding/content";

/** Primary footer CTA label for the given onboarding step index. */
export function getOnboardingNextButtonLabel(step: number): string {
  const isLastStep = step === TOTAL_STEPS - 1;
  const isPaywallStep = step === 17;
  if (isLastStep) return "Begin";
  if (isPaywallStep) return "Get Started";
  if (step === 15) return "Enable Protection";
  if (step === 16) return "Allow";
  if (step === 14) return "Keep going";
  return "Continue";
}
