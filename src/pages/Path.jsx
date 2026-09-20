import React from "react";

const LANGUAGE_INFO = {
  Japanese: {
    flag: "🇯🇵",
    level: "Beginner",
  },
  English: {
    flag: "🇬🇧",
    level: "Beginner",
  },
  Korean: {
    flag: "🇰🇷",
    level: "Beginner",
  },
  Spanish: {
    flag: "🇪🇸",
    level: "Beginner",
  },
  French: {
    flag: "🇫🇷",
    level: "Beginner",
  },
  German: {
    flag: "🇩🇪",
    level: "Beginner",
  },
  Mandarin: {
    flag: "🇨🇳",
    level: "Beginner",
  },
  Italian: {
    flag: "🇮🇹",
    level: "Beginner",
  },
};

const lessons = [
  {
    id: 1,
    title: "Greetings",
    subtitle:
      "Basic greetings and polite expressions",
    xp: 50,
    icon: "👋",
  },
  {
    id: 2,
    title: "Introduce Yourself",
    subtitle:
      "Say your name and basic information",
    xp: 75,
    icon: "🗣️",
  },
  {
    id: 3,
    title: "Everyday Life",
    subtitle:
      "Talk about your daily routine",
    xp: 100,
    icon: "☀️",
  },
  {
    id: 4,
    title: "Food & Cafés",
    subtitle:
      "Order food and communicate at cafés",
    xp: 100,
    icon: "🍜",
  },
  {
    id: 5,
    title: "Shopping",
    subtitle:
      "Prices, products and basic shopping",
    xp: 125,
    icon: "🛍️",
  },
  {
    id: 6,
    title: "Travel",
    subtitle:
      "Transport, stations and directions",
    xp: 125,
    icon: "🚆",
  },
];

export default function Path({
  setPage,
  openLesson,
  state,
}) {
  const safeState =
    state || {};

  const activeLanguage =
    safeState.activeLanguage ||
    "Japanese";

  const language =
    LANGUAGE_INFO[
      activeLanguage
    ] ||
    LANGUAGE_INFO.Japanese;

  const languageProgress =
    safeState.languageProgress?.[
      activeLanguage
    ] || {
      completedLessons:
        activeLanguage ===
        "Japanese"
          ? [1]
          : [],
      currentLesson:
        activeLanguage ===
        "Japanese"
          ? 2
          : 1,
    };

  const completedLessons =
    Array.isArray(
      languageProgress.completedLessons
    )
      ? languageProgress.completedLessons
      : [];

  const highestCompleted =
    completedLessons.length > 0
      ? Math.max(
          ...completedLessons
        )
      : 0;

  const currentLesson =
    Math.max(
      languageProgress.currentLesson ||
        1,
      highestCompleted + 1
    );

  const completedCount =
    completedLessons.length;

  const progress = Math.min(
    100,
    Math.round(
      (completedCount /
        lessons.length) *
        100
    )
  );

  return (
    <section className="page path-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            YOUR JOURNEY
          </div>

          <h1>
            Learning Path
          </h1>

          <p>
            Build your {activeLanguage}{" "}
            skills step by step.
          </p>
        </div>

        <div className="language-pill">
          {language.flag}{" "}
          {activeLanguage}
        </div>
      </div>

      <div className="path-progress-card">
        <div className="progress-top">
          <div>
            <span className="progress-label">
              {language.level} Path
            </span>

            <h2>
              {completedCount} /{" "}
              {lessons.length}{" "}
              lessons completed
            </h2>
          </div>

          <strong>
            {progress}%
          </strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="progress-footer">
          <span>
            ✦ {safeState.xp || 0} XP
          </span>

          <span>
            🔥{" "}
            {safeState.streak ||
              0}{" "}
            day streak
          </span>
        </div>
      </div>

      <div className="path-container">
        <div className="path-line" />

        {lessons.map(
          (lesson) => {
            const isCompleted =
              completedLessons.includes(
                lesson.id
              );

            const isCurrent =
              lesson.id ===
              currentLesson;

            const isLocked =
              lesson.id >
              currentLesson;

            return (
              <div
                className={`path-node ${
                  isCompleted
                    ? "completed"
                    : isCurrent
                    ? "current"
                    : "locked"
                }`}
                key={lesson.id}
              >
                <div className="node-number">
                  {isCompleted
                    ? "✓"
                    : isLocked
                    ? "🔒"
                    : lesson.id}
                </div>

                <div className="lesson-card">
                  <div className="lesson-icon">
                    {lesson.icon}
                  </div>

                  <div className="lesson-info">
                    <div className="lesson-status">
                      {isCompleted
                        ? "COMPLETED"
                        : isCurrent
                        ? "CURRENT MISSION"
                        : "LOCKED"}
                    </div>

                    <h3>
                      {lesson.title}
                    </h3>

                    <p>
                      {lesson.subtitle}
                    </p>

                    <div className="lesson-meta">
                      <span>
                        ✦ {lesson.xp} XP
                      </span>

                      {isCompleted && (
                        <span className="success-text">
                          ✓ Completed
                        </span>
                      )}

                      {isCurrent && (
                        <span className="current-text">
                          Continue learning →
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={`lesson-button ${
                      isLocked
                        ? "disabled"
                        : ""
                    }`}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) {
                        return;
                      }

                      if (
                        typeof openLesson ===
                        "function"
                      ) {
                        openLesson(
                          lesson.id
                        );
                      } else {
                        setPage(
                          "lesson"
                        );
                      }
                    }}
                  >
                    {isCompleted
                      ? "Review"
                      : isCurrent
                      ? "Start"
                      : "Locked"}
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>

      <div className="path-tip">
        <span>💡</span>

        <div>
          <strong>
            {activeLanguage} Path
          </strong>

          <p>
            Your progress is saved
            separately for each language.
            Switching languages will not
            overwrite another language's
            progress.
          </p>
        </div>
      </div>
    </section>
  );
}