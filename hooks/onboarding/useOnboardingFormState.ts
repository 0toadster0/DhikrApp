import { useState } from "react";

/** Local onboarding UI state (screen container only). */
export function useOnboardingFormState() {
  const [step, setStep] = useState(0);
  const [userNameInput, setUserNameInput] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>(["instagram", "tiktok", "twitter"]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [mood, setMood] = useState(5);
  const [closeness, setCloseness] = useState(5);
  const [dailyPhoneHours, setDailyPhoneHours] = useState(4);
  const [phoneHoursScrollLock, setPhoneHoursScrollLock] = useState(false);
  const [reflectAnimSession, setReflectAnimSession] = useState(0);
  const [goalsOptionRowHeight, setGoalsOptionRowHeight] = useState(0);
  const [showGoalsPickHint, setShowGoalsPickHint] = useState(false);
  const [showRelationshipPickHint, setShowRelationshipPickHint] = useState(false);

  return {
    step,
    setStep,
    userNameInput,
    setUserNameInput,
    selectedGoals,
    setSelectedGoals,
    selectedApps,
    setSelectedApps,
    selectedTimes,
    setSelectedTimes,
    mood,
    setMood,
    closeness,
    setCloseness,
    dailyPhoneHours,
    setDailyPhoneHours,
    phoneHoursScrollLock,
    setPhoneHoursScrollLock,
    reflectAnimSession,
    setReflectAnimSession,
    goalsOptionRowHeight,
    setGoalsOptionRowHeight,
    showGoalsPickHint,
    setShowGoalsPickHint,
    showRelationshipPickHint,
    setShowRelationshipPickHint,
  };
}
