import type { NotificationResponse } from "expo-notifications";

/** Attach to local notifications that should open the guided ritual when tapped. */
export const DHIKR_REMINDER_NOTIFICATION_DATA = {
  dhikr_reminder: true,
} as const;

export function isDhikrReminderNotificationResponse(response: NotificationResponse): boolean {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  return data?.dhikr_reminder === true;
}
