import { useCallback, useState } from "react";
import type { AgeGroupPref, CommunicationStyle, UserPreferences } from "@/lib/smart-match";

const STORAGE_KEY = "temenin_user_prefs";

const DEFAULT_PREFS: UserPreferences = {
  interests: [],
  communicationStyle: "",
  preferredActivities: [],
  ageGroupPref: "semua",
};

function loadPrefs(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<UserPreferences>) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function useUserPreferences() {
  const [prefs, setPrefsState] = useState<UserPreferences>(loadPrefs);

  const savePrefs = useCallback((updated: UserPreferences) => {
    setPrefsState(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  const toggleInterest = useCallback(
    (interest: string) => {
      const next = prefs.interests.includes(interest)
        ? prefs.interests.filter((i) => i !== interest)
        : [...prefs.interests, interest];
      savePrefs({ ...prefs, interests: next });
    },
    [prefs, savePrefs],
  );

  const setCommunicationStyle = useCallback(
    (style: CommunicationStyle | "") => {
      savePrefs({ ...prefs, communicationStyle: style });
    },
    [prefs, savePrefs],
  );

  const toggleActivity = useCallback(
    (activity: string) => {
      const next = prefs.preferredActivities.includes(activity)
        ? prefs.preferredActivities.filter((a) => a !== activity)
        : [...prefs.preferredActivities, activity];
      savePrefs({ ...prefs, preferredActivities: next });
    },
    [prefs, savePrefs],
  );

  const setAgeGroupPref = useCallback(
    (age: AgeGroupPref) => {
      savePrefs({ ...prefs, ageGroupPref: age });
    },
    [prefs, savePrefs],
  );

  const resetPrefs = useCallback(() => {
    savePrefs({ ...DEFAULT_PREFS });
  }, [savePrefs]);

  return {
    prefs,
    toggleInterest,
    setCommunicationStyle,
    toggleActivity,
    setAgeGroupPref,
    resetPrefs,
  };
}
