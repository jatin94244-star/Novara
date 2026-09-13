import { useState } from "react";

const DEFAULT_STATE = {
  xp: 50,
  streak: 7,
  completedLessons: [1],
  currentLesson: 2,
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
    };
  } catch {
    localStorage.removeItem("novara-state");
    return DEFAULT_STATE;
  }
}

export function useNovaraStore() {
  const [state, setState] = useState(getInitialState);

  const saveState = (nextState) => {
    setState(nextState);

    localStorage.setItem(
      "novara-state",
      JSON.stringify(nextState)
    );
  };

  const addXP = (amount) => {
    saveState({
      ...state,
      xp: state.xp + amount,
    });
  };

  const completeLesson = (lessonId, xpAmount) => {
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
      xp: state.xp + xpAmount,
      completedLessons: updatedCompleted,
      currentLesson: lessonId + 1,
    };

    saveState(nextState);
  };

  return {
    state,
    addXP,
    completeLesson,
  };
}