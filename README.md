# DhikrApp
Premium Islamic dhikr &amp; habit-building mobile app with onboarding, streaks, and reminders.

## Analytics (PostHog)

- Setup lives in `lib/analytics/index.ts`.
- Initialize once in `app/_layout.tsx` via `initAnalytics()`.
- Environment variables:
  - `EXPO_PUBLIC_POSTHOG_KEY`
  - `EXPO_PUBLIC_POSTHOG_HOST`
- Core methods to use (do not call PostHog directly elsewhere):
  - `identify(userId, traits?)`
  - `capture(eventName, properties?)`
  - `screen(screenName, properties?)`
  - `reset()`
  - `setUserProperties(traits?)`

### Tracked Event Families

- App/session: `first_app_opened`, `app_opened`, `session_started`
- Onboarding: `onboarding_started`, `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_completed`
- Goals/intent: `goal_selected`, `obstacle_selected`
- Dhikr: `dhikr_started`, `dhikr_completed`, `first_dhikr_completed`, `streak_unlocked`
- Permissions: `permission_prompt_viewed`, `permission_granted`, `permission_denied`
- Paywall/subscription: `paywall_viewed`, `paywall_cta_clicked`, `subscription_started`, `subscription_completed`, `subscription_failed`
- Engagement: `app_blocking_setup_started`, `app_blocking_setup_completed`, `reminder_set`, `reminder_opened`

### Adding New Events Safely

- Add calls through `lib/analytics/index.ts` helpers only.
- Prefer firing on deterministic transitions (step change, successful completion, explicit user action).
- For one-time events, use AsyncStorage guard keys (same pattern as `first_app_opened` and `first_dhikr_completed`).
