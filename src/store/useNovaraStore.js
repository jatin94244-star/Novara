import { useState } from "react";

const DEFAULT_STATE = {
  xp: 50,
  streak: 7,

  completedLessons: [1],
  currentLesson: 2,

  // Profile
  profile: {
    name: "",
    username: "",
    bio: "",
    avatar: "",
  },

  // Languages
  selectedLanguages: ["Japanese"],
  activeLanguage: "Japanese",
};

function getInitialState() {
  try {
    const saved = localStorage.getItem("novara-state");

    if (!saved) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(saved);

    return {
      xp:
        typeof parsed.xp === "number"
          ? parsed.xp
          : DEFAULT_STATE.xp,

      streak:
        typeof parsed.streak === "number"
          ? parsed.streak
          : DEFAULT_STATE.streak,

      completedLessons:
        Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : DEFAULT_STATE.completedLessons,

      currentLesson:
        typeof parsed.currentLesson === "number"
          ? parsed.currentLesson
          : DEFAULT_STATE.currentLesson,

      profile:
        parsed.profile &&
        typeof parsed.profile === "object"
          ? {
              name:
                typeof parsed.profile.name === "string"
                  ? parsed.profile.name
                  : "",

              username:
                typeof parsed.profile.username === "string"
                  ? parsed.profile.username
                  : "",

              bio:
                typeof parsed.profile.bio === "string"
                  ? parsed.profile.bio
                  : "",

              avatar:
                typeof parsed.profile.avatar === "string"
                  ? parsed.profile.avatar
                  : "",
            }
          : DEFAULT_STATE.profile,

      selectedLanguages:
        Array.isArray(parsed.selectedLanguages) &&
        parsed.selectedLanguages.length > 0
          ? parsed.selectedLanguages
          : DEFAULT_STATE.selectedLanguages,

      activeLanguage:
        typeof parsed.activeLanguage === "string"
          ? parsed.activeLanguage
          : DEFAULT_STATE.activeLanguage,
    };
  } catch {
    localStorage.removeItem("novara-state");

    return DEFAULT_STATE;
  }
}

export function useNovaraStore() {
  const [state, setState] =
    useState(getInitialState);

  function saveState(nextState) {
    setState(nextState);

    localStorage.setItem(
      "novara-state",
      JSON.stringify(nextState)
    );
  }

  function addXP(amount) {
    saveState({
      ...state,
      xp: state.xp + amount,
    });
  }

  function completeLesson(
    lessonId,
    xpAmount
  ) {
    const completed = Array.isArray(
      state.completedLessons
    )
      ? state.completedLessons
      : [];

    if (completed.includes(lessonId)) {
      return;
    }

    const updatedCompleted = [
      ...completed,
      lessonId,
    ];

    const nextState = {
      ...state,

      xp:
        state.xp + xpAmount,

      completedLessons:
        updatedCompleted,

      currentLesson:
        lessonId + 1,
    };

    saveState(nextState);
  }

  // =========================
  // PROFILE
  // =========================

  function updateProfile(profileData) {
    const nextState = {
      ...state,

      profile: {
        ...state.profile,
        ...profileData,
      },
    };

    saveState(nextState);
  }

  // =========================
  // LANGUAGES
  // =========================

  function setLanguages(languages) {
    if (
      !Array.isArray(languages) ||
      languages.length === 0
    ) {
      return;
    }

    const nextState = {
      ...state,

      selectedLanguages:
        languages,

      // If current language was removed,
      // automatically select the first available one.
      activeLanguage:
        languages.includes(
          state.activeLanguage
        )
          ? state.activeLanguage
          : languages[0],
    };

    saveState(nextState);
  }

  function addLanguage(language) {
    if (!language) return;

    if (
      state.selectedLanguages.includes(
        language
      )
    ) {
      return;
    }

    const nextState = {
      ...state,

      selectedLanguages: [
        ...state.selectedLanguages,
        language,
      ],
    };

    saveState(nextState);
  }

  function removeLanguage(language) {
    const updated =
      state.selectedLanguages.filter(
        (item) => item !== language
      );

    if (updated.length === 0) {
      return;
    }

    const nextState = {
      ...state,

      selectedLanguages: updated,

      activeLanguage:
        state.activeLanguage === language
          ? updated[0]
          : state.activeLanguage,
    };

    saveState(nextState);
  }

  function setActiveLanguage(language) {
    if (
      !state.selectedLanguages.includes(
        language
      )
    ) {
      return;
    }

    saveState({
      ...state,
      activeLanguage: language,
    });
  }

  return {
    state,

    // XP / Lessons
    addXP,
    completeLesson,

    // Profile
    updateProfile,

    // Languages
    setLanguages,
    addLanguage,
    removeLanguage,
    setActiveLanguage,
  };
}