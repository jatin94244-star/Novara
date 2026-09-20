import React, {
  useEffect,
  useState,
} from "react";

const LANGUAGES = [
  {
    id: "japanese",
    name: "Japanese",
    native: "日本語",
    flag: "🇯🇵",
  },
  {
    id: "english",
    name: "English",
    native: "English",
    flag: "🇬🇧",
  },
  {
    id: "korean",
    name: "Korean",
    native: "한국어",
    flag: "🇰🇷",
  },
  {
    id: "spanish",
    name: "Spanish",
    native: "Español",
    flag: "🇪🇸",
  },
  {
    id: "french",
    name: "French",
    native: "Français",
    flag: "🇫🇷",
  },
  {
    id: "german",
    name: "German",
    native: "Deutsch",
    flag: "🇩🇪",
  },
  {
    id: "mandarin",
    name: "Mandarin",
    native: "中文",
    flag: "🇨🇳",
  },
  {
    id: "italian",
    name: "Italian",
    native: "Italiano",
    flag: "🇮🇹",
  },
];

const NAME_TO_LANGUAGE = {
  japanese: "Japanese",
  english: "English",
  korean: "Korean",
  spanish: "Spanish",
  french: "French",
  german: "German",
  mandarin: "Mandarin",
  italian: "Italian",
};

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description:
      "I'm starting from the basics",
    icon: "🌱",
  },
  {
    id: "elementary",
    title: "Elementary",
    description:
      "I know some basics",
    icon: "📖",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description:
      "I can communicate fairly well",
    icon: "⚡",
  },
  {
    id: "advanced",
    title: "Advanced",
    description:
      "I want to polish my skills",
    icon: "🚀",
  },
];

const DAILY_GOALS = [
  {
    value: 5,
    label: "5 min",
  },
  {
    value: 15,
    label: "15 min",
  },
  {
    value: 30,
    label: "30 min",
  },
  {
    value: 60,
    label: "60 min",
  },
];

function getLanguage(name) {
  return (
    LANGUAGES.find(
      (item) => item.name === name
    ) || LANGUAGES[0]
  );
}

export default function Profile({
  state,
  updateProfile,
  setLanguages,
  setActiveLanguage,
}) {
  const safeState =
    state || {};

  const profile =
    safeState.profile || {};

  const selectedLanguages =
    Array.isArray(
      safeState.selectedLanguages
    )
      ? safeState.selectedLanguages
      : ["Japanese"];

  const activeLanguage =
    safeState.activeLanguage ||
    selectedLanguages[0] ||
    "Japanese";

  const [name, setName] =
    useState(profile.name || "");

  const [username, setUsername] =
    useState(profile.username || "");

  const [bio, setBio] =
    useState(profile.bio || "");

  const [dailyGoal, setDailyGoal] =
    useState(
      profile.dailyGoal || 15
    );

  const [nativeLanguage, setNativeLanguage] =
    useState(
      profile.nativeLanguage ||
        "English"
    );

  const [jlptTarget, setJlptTarget] =
    useState(
      profile.jlptTarget || "N5"
    );

  const [levels, setLevels] =
    useState(
      profile.levels || {
        Japanese: "beginner",
      }
    );

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    setName(profile.name || "");
    setUsername(
      profile.username || ""
    );
    setBio(profile.bio || "");

    setDailyGoal(
      profile.dailyGoal || 15
    );

    setNativeLanguage(
      profile.nativeLanguage ||
        "English"
    );

    setJlptTarget(
      profile.jlptTarget || "N5"
    );

    setLevels(
      profile.levels || {
        Japanese: "beginner",
      }
    );
  }, [state]);

  const active =
    getLanguage(activeLanguage);

  const activeLevelId =
    levels[activeLanguage] ||
    "beginner";

  const activeLevel =
    LEVELS.find(
      (level) =>
        level.id ===
        activeLevelId
    ) || LEVELS[0];

  const progress =
    safeState.languageProgress?.[
      activeLanguage
    ] || {
      completedLessons: [],
      currentLesson: 1,
    };

  function saveProfile() {
    updateProfile({
      name,
      username,
      bio,
      dailyGoal,
      nativeLanguage,
      jlptTarget,
      levels,
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function handleLanguageClick(
    languageId
  ) {
    const languageName =
      NAME_TO_LANGUAGE[
        languageId
      ];

    if (!languageName) return;

    const selected =
      selectedLanguages.includes(
        languageName
      );

    /*
      First click:
      add + make active
    */
    if (!selected) {
      setLanguages([
        ...selectedLanguages,
        languageName,
      ]);

      setActiveLanguage(
        languageName
      );

      return;
    }

    /*
      Already selected:
      make active.
    */
    setActiveLanguage(
      languageName
    );
  }

  function setLevel(levelId) {
    setLevels((current) => ({
      ...current,
      [activeLanguage]:
        levelId,
    }));
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            NOVARA IDENTITY
          </div>

          <h1>Profile</h1>

          <p>
            Personalize your Novara
            learning experience.
          </p>
        </div>

        <div className="language-pill">
          {active.flag}{" "}
          {active.name}
        </div>
      </div>

      {/* PROFILE */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: "28px",
              background:
                "linear-gradient(135deg,#7c5cff,#00d4ff)",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            {name
              ? name
                  .charAt(0)
                  .toUpperCase()
              : "N"}
          </div>

          <div>
            <div className="eyebrow">
              NOVARA LEARNER
            </div>

            <h2
              style={{
                margin: "3px 0",
              }}
            >
              {name ||
                "Your Profile"}
            </h2>

            <span
              style={{
                opacity: 0.5,
                fontSize: "12px",
              }}
            >
              {active.flag} Learning{" "}
              {active.name}
            </span>
          </div>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "12px",
            opacity: 0.65,
          }}
        >
          Your name
        </label>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Enter your name"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.035)",
            color: "inherit",
            outline: "none",
            fontSize: "15px",
            fontFamily: "inherit",
          }}
        />

        <label
          style={{
            display: "block",
            marginTop: "14px",
            marginBottom: "7px",
            fontSize: "12px",
            opacity: 0.65,
          }}
        >
          Username
        </label>

        <input
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          placeholder="@username"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.035)",
            color: "inherit",
            outline: "none",
            fontSize: "15px",
            fontFamily: "inherit",
          }}
        />

        <label
          style={{
            display: "block",
            marginTop: "14px",
            marginBottom: "7px",
            fontSize: "12px",
            opacity: 0.65,
          }}
        >
          Bio
        </label>

        <textarea
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
          placeholder="Tell Novara about you..."
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.035)",
            color: "inherit",
            outline: "none",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </div>

      {/* STATS */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="eyebrow">
          YOUR PROGRESS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(130px,1fr))",
            gap: "10px",
            marginTop: "14px",
          }}
        >
          <div className="result-card">
            <strong>
              {safeState.xp || 0}
            </strong>
            <span>XP</span>
          </div>

          <div className="result-card">
            <strong>
              🔥{" "}
              {safeState.streak ||
                0}
            </strong>
            <span>Streak</span>
          </div>

          <div className="result-card">
            <strong>
              {
                progress
                  .completedLessons
                  .length
              }
            </strong>
            <span>
              {active.name} lessons
            </span>
          </div>
        </div>
      </div>

      {/* NATIVE */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="eyebrow">
          NATIVE LANGUAGE
        </div>

        <h2>
          What language do you speak?
        </h2>

        <select
          value={nativeLanguage}
          onChange={(e) =>
            setNativeLanguage(
              e.target.value
            )
          }
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "13px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background: "#11111c",
            color: "inherit",
            fontSize: "14px",
          }}
        >
          <option value="English">
            🇬🇧 English
          </option>

          <option value="Hindi">
            🇮🇳 Hindi
          </option>

          <option value="Japanese">
            🇯🇵 Japanese
          </option>

          <option value="Korean">
            🇰🇷 Korean
          </option>
        </select>
      </div>

      {/* LANGUAGES */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="eyebrow">
          LANGUAGES
        </div>

        <h2>
          What do you want to learn?
        </h2>

        <p
          style={{
            opacity: 0.5,
            fontSize: "13px",
          }}
        >
          Select languages and click one
          to make it active.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: "9px",
            marginTop: "15px",
          }}
        >
          {LANGUAGES.map(
            (language) => {
              const selected =
                selectedLanguages.includes(
                  language.name
                );

              const active =
                activeLanguage ===
                language.name;

              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() =>
                    handleLanguageClick(
                      language.id
                    )
                  }
                  style={{
                    textAlign: "left",
                    padding: "13px",
                    borderRadius: "13px",
                    border: active
                      ? "1px solid rgba(124,92,255,.7)"
                      : selected
                      ? "1px solid rgba(124,92,255,.3)"
                      : "1px solid rgba(255,255,255,.08)",
                    background: active
                      ? "rgba(124,92,255,.14)"
                      : selected
                      ? "rgba(124,92,255,.07)"
                      : "rgba(255,255,255,.025)",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "24px",
                      }}
                    >
                      {language.flag}
                    </span>

                    <span>
                      {active
                        ? "● Active"
                        : selected
                        ? "✓ Selected"
                        : "+"}
                    </span>
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    {language.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "3px",
                      opacity: 0.45,
                      fontSize: "11px",
                    }}
                  >
                    {language.native}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* LEVEL */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="eyebrow">
          {active.name.toUpperCase()} LEVEL
        </div>

        <h2>
          What's your current level?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: "9px",
            marginTop: "14px",
          }}
        >
          {LEVELS.map(
            (level) => {
              const selected =
                activeLevel.id ===
                level.id;

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() =>
                    setLevel(
                      level.id
                    )
                  }
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderRadius: "13px",
                    border: selected
                      ? "1px solid rgba(124,92,255,.65)"
                      : "1px solid rgba(255,255,255,.08)",
                    background: selected
                      ? "rgba(124,92,255,.12)"
                      : "rgba(255,255,255,.025)",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    {level.icon}
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "7px",
                    }}
                  >
                    {level.title}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "11px",
                      opacity: 0.5,
                    }}
                  >
                    {level.description}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* JLPT */}

      {selectedLanguages.includes(
        "Japanese"
      ) && (
        <div
          className="question-card"
          style={{
            marginBottom: "16px",
          }}
        >
          <div className="eyebrow">
            JAPANESE GOAL
          </div>

          <h2>JLPT target</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "13px",
            }}
          >
            {[
              "N5",
              "N4",
              "N3",
              "N2",
              "N1",
            ].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setJlptTarget(
                    level
                  )
                }
                className={
                  jlptTarget === level
                    ? "primary-button"
                    : "secondary-button"
                }
              >
                JLPT {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DAILY GOAL */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div className="eyebrow">
          DAILY GOAL
        </div>

        <h2>
          How much do you want to practice?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(120px,1fr))",
            gap: "8px",
            marginTop: "13px",
          }}
        >
          {DAILY_GOALS.map(
            (goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() =>
                  setDailyGoal(
                    goal.value
                  )
                }
                className={
                  dailyGoal ===
                  goal.value
                    ? "primary-button"
                    : "secondary-button"
                }
              >
                {goal.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* SAVE */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          marginBottom: "25px",
        }}
      >
        <button
          className="primary-button"
          onClick={saveProfile}
        >
          {saved
            ? "✓ Profile Saved"
            : "Save Profile →"}
        </button>
      </div>
    </section>
  );
}