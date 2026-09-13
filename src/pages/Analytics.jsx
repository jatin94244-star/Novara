import React, { useMemo } from "react";

const lessons = [
  {
    id: 1,
    title: "Greetings",
    xp: 50,
  },
  {
    id: 2,
    title: "Introduce Yourself",
    xp: 75,
  },
  {
    id: 3,
    title: "Everyday Life",
    xp: 100,
  },
  {
    id: 4,
    title: "Food & Cafés",
    xp: 100,
  },
  {
    id: 5,
    title: "Shopping",
    xp: 125,
  },
  {
    id: 6,
    title: "Travel",
    xp: 125,
  },
];

const defaultState = {
  xp: 50,
  streak: 7,
  completedLessons: [1],
  currentLesson: 2,
};

export default function Analytics({ state }) {
  /*
   * -----------------------------------------
   * SAFE STATE
   * -----------------------------------------
   */

  const safeState = useMemo(() => {
    const source = state || {};

    return {
      xp:
        typeof source.xp === "number"
          ? source.xp
          : defaultState.xp,

      streak:
        typeof source.streak === "number"
          ? source.streak
          : defaultState.streak,

      completedLessons:
        Array.isArray(source.completedLessons)
          ? source.completedLessons
          : defaultState.completedLessons,

      currentLesson:
        typeof source.currentLesson === "number"
          ? source.currentLesson
          : defaultState.currentLesson,
    };
  }, [state]);

  /*
   * -----------------------------------------
   * BASIC CALCULATIONS
   * -----------------------------------------
   */

  const completedCount =
    safeState.completedLessons.length;

  const totalLessons = lessons.length;

  const completionPercentage =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedCount / totalLessons) * 100
        );

  const totalPossibleXP = lessons.reduce(
    (total, lesson) => total + lesson.xp,
    0
  );

  const xpPercentage =
    totalPossibleXP === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (safeState.xp / totalPossibleXP) * 100
          )
        );

  /*
   * -----------------------------------------
   * LEVEL SYSTEM
   * -----------------------------------------
   */

  const level = Math.max(
    1,
    Math.floor(safeState.xp / 100) + 1
  );

  const currentLevelXP =
    safeState.xp % 100;

  const nextLevelXP = 100;

  const levelPercentage =
    Math.min(
      100,
      Math.round(
        (currentLevelXP / nextLevelXP) * 100
      )
    );

  /*
   * -----------------------------------------
   * LESSON DATA
   * -----------------------------------------
   */

  const lessonProgress = lessons.map(
    (lesson) => ({
      ...lesson,
      completed:
        safeState.completedLessons.includes(
          lesson.id
        ),
    })
  );

  /*
   * -----------------------------------------
   * WEEKLY ACTIVITY
   *
   * This is a visual activity overview.
   * -----------------------------------------
   */

  const weeklyActivity = [
    {
      day: "Mon",
      value: 30,
    },
    {
      day: "Tue",
      value: 55,
    },
    {
      day: "Wed",
      value: 40,
    },
    {
      day: "Thu",
      value: 75,
    },
    {
      day: "Fri",
      value: 50,
    },
    {
      day: "Sat",
      value: 90,
    },
    {
      day: "Sun",
      value:
        safeState.streak > 0 ? 65 : 20,
    },
  ];

  /*
   * -----------------------------------------
   * SKILLS
   * -----------------------------------------
   */

  const skills = [
    {
      name: "Vocabulary",
      value: Math.min(
        100,
        completedCount * 12 + 10
      ),
      icon: "📚",
    },
    {
      name: "Grammar",
      value: Math.min(
        100,
        completedCount * 10 + 8
      ),
      icon: "🧩",
    },
    {
      name: "Reading",
      value: Math.min(
        100,
        completedCount * 11 + 12
      ),
      icon: "📖",
    },
    {
      name: "Conversation",
      value: Math.min(
        100,
        completedCount * 9 + 5
      ),
      icon: "💬",
    },
  ];

  return (
    <section className="page analytics-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            PERFORMANCE CENTER
          </div>

          <h1>
            Analytics
          </h1>

          <p>
            See your Novara learning progress,
            XP and skill development.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* =====================================
          OVERVIEW CARDS
      ===================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >

        <AnalyticsCard
          icon="✦"
          value={safeState.xp}
          label="Total XP"
          extra={`Level ${level}`}
        />

        <AnalyticsCard
          icon="🔥"
          value={safeState.streak}
          label="Day Streak"
          extra="Keep it alive"
        />

        <AnalyticsCard
          icon="✓"
          value={`${completedCount}/${totalLessons}`}
          label="Lessons"
          extra={`${completionPercentage}% complete`}
        />

        <AnalyticsCard
          icon="🎯"
          value={`${levelPercentage}%`}
          label="Level Progress"
          extra={`${100 - currentLevelXP} XP to next`}
        />

      </div>


      {/* =====================================
          LEVEL CARD
      ===================================== */}

      <div
        className="path-progress-card"
        style={{
          marginBottom: "22px",
        }}
      >

        <div className="progress-top">

          <div>

            <span className="progress-label">
              CURRENT LEVEL
            </span>

            <h2>
              Level {level} Language Explorer
            </h2>

          </div>

          <strong>
            {safeState.xp} XP
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: `${levelPercentage}%`,
            }}
          />

        </div>

        <div className="progress-footer">

          <span>
            {currentLevelXP} / 100 XP
          </span>

          <span>
            {100 - currentLevelXP} XP remaining
          </span>

        </div>

      </div>


      {/* =====================================
          MAIN ANALYTICS GRID
      ===================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "18px",
          marginBottom: "22px",
        }}
      >

        {/* WEEKLY ACTIVITY */}

        <div className="question-card">

          <div className="eyebrow">
            ACTIVITY
          </div>

          <h2>
            Weekly Learning
          </h2>

          <p
            style={{
              opacity: 0.55,
              marginBottom: "25px",
            }}
          >
            Your learning activity over the
            last 7 days.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent:
                "space-between",
              gap: "8px",
              height: "150px",
            }}
          >

            {weeklyActivity.map(
              (item) => (

                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "flex-end",
                    alignItems:
                      "center",
                    gap: "8px",
                  }}
                >

                  <div
                    title={`${item.value}% activity`}
                    style={{
                      width: "100%",
                      maxWidth: "32px",
                      height:
                        `${item.value}%`,
                      minHeight: "8px",
                      borderRadius:
                        "8px 8px 3px 3px",
                      background:
                        "linear-gradient(180deg, #7c5cff, #4f46e5)",
                    }}
                  />

                  <small
                    style={{
                      opacity: 0.5,
                    }}
                  >
                    {item.day}
                  </small>

                </div>

              )
            )}

          </div>

        </div>


        {/* COMPLETION */}

        <div className="question-card">

          <div className="eyebrow">
            LEARNING PATH
          </div>

          <h2>
            Course Completion
          </h2>

          <p
            style={{
              opacity: 0.55,
            }}
          >
            Your overall beginner-path progress.
          </p>

          <div
            style={{
              display: "grid",
              placeItems: "center",
              margin: "25px 0",
            }}
          >

            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: `conic-gradient(
                  #7c5cff ${completionPercentage}%,
                  rgba(255,255,255,.06) ${completionPercentage}%
                )`,
                display: "grid",
                placeItems: "center",
              }}
            >

              <div
                style={{
                  width: "115px",
                  height: "115px",
                  borderRadius: "50%",
                  background:
                    "var(--bg2, #080816)",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                }}
              >

                <div>
                  <strong
                    style={{
                      fontSize: "28px",
                    }}
                  >
                    {completionPercentage}%
                  </strong>

                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.5,
                    }}
                  >
                    COMPLETE
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="progress-footer">

            <span>
              ✓ {completedCount} completed
            </span>

            <span>
              🔒{" "}
              {totalLessons -
                completedCount} remaining
            </span>

          </div>

        </div>

      </div>


      {/* =====================================
          SKILLS
      ===================================== */}

      <div
        className="question-card"
        style={{
          marginBottom: "22px",
        }}
      >

        <div className="eyebrow">
          SKILL MATRIX
        </div>

        <h2>
          Your Language Skills
        </h2>

        <p
          style={{
            opacity: 0.55,
            marginBottom: "22px",
          }}
        >
          Track how your core language abilities
          are developing.
        </p>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >

          {skills.map((skill) => (

            <div key={skill.name}>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >

                <span>
                  {skill.icon}{" "}
                  {skill.name}
                </span>

                <strong>
                  {skill.value}%
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      `${skill.value}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* =====================================
          LESSON BREAKDOWN
      ===================================== */}

      <div className="question-card">

        <div className="eyebrow">
          MISSION HISTORY
        </div>

        <h2>
          Lesson Progress
        </h2>

        <p
          style={{
            opacity: 0.55,
            marginBottom: "20px",
          }}
        >
          Your progress through the Japanese
          beginner path.
        </p>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >

          {lessonProgress.map(
            (lesson) => (

              <div
                key={lesson.id}
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  padding:
                    "14px",
                  borderRadius:
                    "12px",
                  background:
                    "rgba(255,255,255,.035)",
                }}
              >

                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "50%",
                    display: "grid",
                    placeItems:
                      "center",
                    background:
                      lesson.completed
                        ? "rgba(34,197,94,.15)"
                        : "rgba(255,255,255,.06)",
                  }}
                >
                  {lesson.completed
                    ? "✓"
                    : lesson.id}
                </div>

                <div
                  style={{
                    flex: 1,
                  }}
                >

                  <strong>
                    {lesson.title}
                  </strong>

                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.5,
                      marginTop: "3px",
                    }}
                  >
                    {lesson.xp} XP mission
                  </div>

                </div>

                <span
                  style={{
                    fontSize: "12px",
                    opacity:
                      lesson.completed
                        ? 1
                        : 0.4,
                  }}
                >
                  {lesson.completed
                    ? "Completed"
                    : lesson.id ===
                      safeState.currentLesson
                    ? "Current"
                    : "Locked"}
                </span>

              </div>

            )
          )}

        </div>

      </div>


      {/* =====================================
          INSIGHT
      ===================================== */}

      <div
        className="path-tip"
        style={{
          marginTop: "22px",
        }}
      >

        <span>💡</span>

        <div>

          <strong>
            Novara insight
          </strong>

          <p>
            {completedCount === 0
              ? "Start your first mission to begin building your learning history."
              : completedCount <
                totalLessons
              ? `You're ${completionPercentage}% through the beginner path. Keep completing missions to unlock the next stages.`
              : "Amazing! You've completed the entire beginner path. Time to move into advanced learning."}
          </p>

        </div>

      </div>

    </section>
  );
}


/* ==========================================
   ANALYTICS CARD
========================================== */

function AnalyticsCard({
  icon,
  value,
  label,
  extra,
}) {
  return (
    <div
      className="result-card"
      style={{
        textAlign: "left",
        padding: "20px",
      }}
    >

      <div
        style={{
          fontSize: "22px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <strong
        style={{
          fontSize: "27px",
          display: "block",
          marginBottom: "4px",
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: "block",
          marginBottom: "5px",
        }}
      >
        {label}
      </span>

      <small
        style={{
          opacity: 0.45,
        }}
      >
        {extra}
      </small>

    </div>
  );
}