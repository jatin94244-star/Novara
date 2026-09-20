import { useState } from "react";

const DEFAULT_PROFILE = {
  name: "",
  username: "",
  bio: "",
  avatar: "",
};

const DEFAULT_LANGUAGE_PROGRESS = {
  Japanese: {
    completedLessons: [1],
    currentLesson: 2,
  },
};

const DEFAULT_STATE = {
  xp: 50,
  streak: 7,

  profile: DEFAULT_PROFILE,

  selectedLanguages: ["Japanese"],
  activeLanguage: "Japanese",

  languageProgress: DEFAULT_LANGUAGE_PROGRESS,
};

function createLanguageProgress(language) {
  return {
    completedLessons:
      language === "Japanese" ? [1] : [],
    currentLesson:
      language === "Japanese" ? 2 : 1,
  };
}

function normalizeProgress(progress) {
  if (
    !progress ||
    typeof progress !== "object"
  ) {
    return {};
  }

  const normalized = {};

  Object.keys(progress).forEach((language) => {
    const item = progress[language];

    normalized[language] = {
      completedLessons:
        Array.isArray(item?.completedLessons)
          ? item.completedLessons
          : [],

      currentLesson:
        typeof item?.currentLesson === "number"
          ? item.currentLesson
          : 1,
    };
  });

  return normalized;
}

function getInitialState() {
  try {
    const saved =
      localStorage.getItem("novara-state");

    if (!saved) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(saved);

    const selectedLanguages =
      Array.isArray(
        parsed.selectedLanguages
      ) &&
      parsed.selectedLanguages.length > 0
        ? parsed.selectedLanguages
        : DEFAULT_STATE.selectedLanguages;

    const activeLanguage =
      typeof parsed.activeLanguage ===
        "string" &&
      selectedLanguages.includes(
        parsed.activeLanguage
      )
        ? parsed.activeLanguage
        : selectedLanguages[0];

    let languageProgress =
      normalizeProgress(
        parsed.languageProgress
      );

    /*
      Migration from the old global progress system.
    */
    if (
      Object.keys(languageProgress).length === 0
    ) {
      const oldCompleted =
        Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [1];

      const oldCurrent =
        typeof parsed.currentLesson === "number"
          ? parsed.currentLesson
          : Math.max(
              ...oldCompleted,
              0
            ) + 1;

      languageProgress = {
        [activeLanguage]: {
          completedLessons:
            oldCompleted,
          currentLesson:
            oldCurrent,
        },
      };
    }

    /*
      Make sure every selected language
      has its own progress object.
    */
    selectedLanguages.forEach(
      (language) => {
        if (!languageProgress[language]) {
          languageProgress[language] =
            createLanguageProgress(
              language
            );
        }
      }
    );

    const activeProgress =
      languageProgress[activeLanguage] ||
      createLanguageProgress(
        activeLanguage
      );

    return {
      xp:
        typeof parsed.xp === "number"
          ? parsed.xp
          : DEFAULT_STATE.xp,

      streak:
        typeof parsed.streak === "number"
          ? parsed.streak
          : DEFAULT_STATE.streak,

      profile:
        parsed.profile &&
        typeof parsed.profile === "object"
          ? {
              name:
                typeof parsed.profile.name ===
                "string"
                  ? parsed.profile.name
                  : "",

              username:
                typeof parsed.profile.username ===
                "string"
                  ? parsed.profile.username
                  : "",

              bio:
                typeof parsed.profile.bio ===
                "string"
                  ? parsed.profile.bio
                  : "",

              avatar:
                typeof parsed.profile.avatar ===
                "string"
                  ? parsed.profile.avatar
                  : "",
            }
          : DEFAULT_PROFILE,

      selectedLanguages,

      activeLanguage,

      languageProgress,

      /*
        Keep these for compatibility with
        existing pages/components.
      */
      completedLessons:
        activeProgress.completedLessons,

      currentLesson:
        activeProgress.currentLesson,
    };
  } catch {
    localStorage.removeItem(
      "novara-state"
    );

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
      xp:
        state.xp +
        (Number(amount) || 0),
    });
  }

  function completeLesson(
    lessonId,
    xpAmount
  ) {
    const language =
      state.activeLanguage;

    const currentProgress =
      state.languageProgress?.[language] ||
      createLanguageProgress(
        language
      );

    const completed =
      Array.isArray(
        currentProgress.completedLessons
      )
        ? currentProgress.completedLessons
        : [];

    if (completed.includes(lessonId)) {
      return;
    }

    const updatedCompleted = [
      ...completed,
      lessonId,
    ].sort((a, b) => a - b);

    const nextCurrentLesson =
      Math.max(
        ...updatedCompleted,
        0
      ) + 1;

    const updatedLanguageProgress = {
      ...state.languageProgress,

      [language]: {
        completedLessons:
          updatedCompleted,

        currentLesson:
          nextCurrentLesson,
      },
    };

    saveState({
      ...state,

      xp:
        state.xp +
        (Number(xpAmount) || 0),

      languageProgress:
        updatedLanguageProgress,

      completedLessons:
        updatedCompleted,

      currentLesson:
        nextCurrentLesson,
    });
  }

  // =========================
  // PROFILE
  // =========================

  function updateProfile(profileData) {
    if (
      !profileData ||
      typeof profileData !== "object"
    ) {
      return;
    }

    saveState({
      ...state,

      profile: {
        ...state.profile,
        ...profileData,
      },
    });
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

    const uniqueLanguages = [
      ...new Set(languages),
    ];

    const nextActiveLanguage =
      uniqueLanguages.includes(
        state.activeLanguage
      )
        ? state.activeLanguage
        : uniqueLanguages[0];

    const nextProgress = {
      ...state.languageProgress,
    };

    uniqueLanguages.forEach(
      (language) => {
        if (!nextProgress[language]) {
          nextProgress[language] =
            createLanguageProgress(
              language
            );
        }
      }
    );

    const activeProgress =
      nextProgress[nextActiveLanguage];

    saveState({
      ...state,

      selectedLanguages:
        uniqueLanguages,

      activeLanguage:
        nextActiveLanguage,

      languageProgress:
        nextProgress,

      completedLessons:
        activeProgress.completedLessons,

      currentLesson:
        activeProgress.currentLesson,
    });
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

    const nextLanguages = [
      ...state.selectedLanguages,
      language,
    ];

    const nextProgress = {
      ...state.languageProgress,
    };

    if (!nextProgress[language]) {
      nextProgress[language] =
        createLanguageProgress(
          language
        );
    }

    saveState({
      ...state,

      selectedLanguages:
        nextLanguages,

      languageProgress:
        nextProgress,
    });
  }

  function removeLanguage(language) {
    if (
      state.selectedLanguages.length <= 1
    ) {
      return;
    }

    const updated =
      state.selectedLanguages.filter(
        (item) => item !== language
      );

    const nextActiveLanguage =
      state.activeLanguage === language
        ? updated[0]
        : state.activeLanguage;

    const nextProgress = {
      ...state.languageProgress,
    };

    delete nextProgress[language];

    const activeProgress =
      nextProgress[nextActiveLanguage] ||
      createLanguageProgress(
        nextActiveLanguage
      );

    if (
      !nextProgress[nextActiveLanguage]
    ) {
      nextProgress[nextActiveLanguage] =
        activeProgress;
    }

    saveState({
      ...state,

      selectedLanguages:
        updated,

      activeLanguage:
        nextActiveLanguage,

      languageProgress:
        nextProgress,

      completedLessons:
        activeProgress.completedLessons,

      currentLesson:
        activeProgress.currentLesson,
    });
  }

  function setActiveLanguage(language) {
    if (
      !state.selectedLanguages.includes(
        language
      )
    ) {
      return;
    }

    const nextProgress = {
      ...state.languageProgress,
    };

    if (!nextProgress[language]) {
      nextProgress[language] =
        createLanguageProgress(
          language
        );
    }

    const progress =
      nextProgress[language];

    saveState({
      ...state,

      activeLanguage:
        language,

      languageProgress:
        nextProgress,

      completedLessons:
        progress.completedLessons,

      currentLesson:
        progress.currentLesson,
    });
  }

  return {
    state,

    // XP
    addXP,

    // Lessons
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