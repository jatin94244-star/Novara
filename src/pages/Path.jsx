import React from "react";

const lessons = [
  {
    id: 1,
    title: "Greetings",
    subtitle: "Basic greetings and polite expressions",
    xp: 50,
    icon: "👋",
  },
  {
    id: 2,
    title: "Introduce Yourself",
    subtitle: "Say your name and basic information",
    xp: 75,
    icon: "🗣️",
  },
  {
    id: 3,
    title: "Everyday Life",
    subtitle: "Talk about your daily routine",
    xp: 100,
    icon: "☀️",
  },
  {
    id: 4,
    title: "Food & Cafés",
    subtitle: "Order food and communicate at cafés",
    xp: 100,
    icon: "🍜",
  },
  {
    id: 5,
    title: "Shopping",
    subtitle: "Prices, products and basic shopping",
    xp: 125,
    icon: "🛍️",
  },
  {
    id: 6,
    title: "Travel",
    subtitle: "Transport, stations and directions",
    xp: 125,
    icon: "🚆",
  },
];

export default function Path({
  setPage,
  openLesson,
  state,
}) {
  const safeState = state || {
    xp: 50,
    streak: 7,
    completedLessons: [1],
    currentLesson: 2,
  };

  const completedLessons = Array.isArray(
    safeState.completedLessons
  )
    ? safeState.completedLessons
    : [1];

  /*
    Automatically calculate the next lesson.

    Example:
    completed = [1,2,3]
    next lesson = 4
  */
  const highestCompleted =
    completedLessons.length > 0
      ? Math.max(...completedLessons)
      : 0;

  const currentLesson =
    highestCompleted + 1;

  const completedCount =
    completedLessons.length;

  const progress = Math.round(
    (completedCount / lessons.length) * 100
  );

  return (
    <section className="page path-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            YOUR JOURNEY
          </div>

          <h1>
            Learning Path
          </h1>

          <p>
            Build your language skills step by step.
            Complete each mission to unlock the next one.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* PROGRESS */}

      <div className="path-progress-card">

        <div className="progress-top">

          <div>
            <span className="progress-label">
              Beginner Path
            </span>

            <h2>
              {completedCount} / {lessons.length} lessons completed
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
            ✦ {safeState.xp} XP
          </span>

          <span>
            🔥 {safeState.streak} day streak
          </span>

        </div>

      </div>


      {/* LESSON PATH */}

      <div className="path-container">

        <div className="path-line" />

        {lessons.map((lesson) => {

          const isCompleted =
            completedLessons.includes(
              lesson.id
            );

          const isCurrent =
            lesson.id === currentLesson;

          const isLocked =
            lesson.id > currentLesson;

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

              {/* NUMBER */}

              <div className="node-number">

                {isCompleted
                  ? "✓"
                  : isLocked
                  ? "🔒"
                  : lesson.id}

              </div>


              {/* CARD */}

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


                {/* BUTTON */}

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
                      openLesson(lesson.id);
                    } else {
                      setPage("lesson");
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
        })}

      </div>


      {/* TIP */}

      <div className="path-tip">

        <span>
          💡
        </span>

        <div>

          <strong>
            Novara tip
          </strong>

          <p>
            Complete your current mission to
            automatically unlock the next stage.
          </p>

        </div>

      </div>

    </section>
  );
}