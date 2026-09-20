import React, { useEffect, useState } from "react";

const LANGUAGES = [
  { id: "japanese", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { id: "english", name: "English", native: "English", flag: "🇬🇧" },
  { id: "korean", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { id: "spanish", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { id: "french", name: "French", native: "Français", flag: "🇫🇷" },
  { id: "german", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { id: "mandarin", name: "Mandarin", native: "中文", flag: "🇨🇳" },
  { id: "italian", name: "Italian", native: "Italiano", flag: "🇮🇹" },
];

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I'm starting from the basics",
    icon: "🌱",
  },
  {
    id: "elementary",
    title: "Elementary",
    description: "I know some basics",
    icon: "📖",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can communicate fairly well",
    icon: "⚡",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "I want to polish my skills",
    icon: "🚀",
  },
];

const DAILY_GOALS = [
  { value: 5, label: "5 min", xp: 10 },
  { value: 15, label: "15 min", xp: 30 },
  { value: 30, label: "30 min", xp: 60 },
  { value: 60, label: "60 min", xp: 120 },
];

const DEFAULT_PROFILE = {
  name: "",
  nativeLanguage: "English",
  learningLanguages: ["japanese"],
  activeLanguage: "japanese",
  levels: {
    japanese: "beginner",
  },
  dailyGoal: 15,
  jlptTarget: "N5",
};

function loadProfile() {
  try {
    const saved = localStorage.getItem("novara_profile");

    if (!saved) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      levels: {
        ...DEFAULT_PROFILE.levels,
        ...(parsed.levels || {}),
      },
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile) {
  localStorage.setItem(
    "novara_profile",
    JSON.stringify(profile)
  );

  // Allows other Novara components to react later.
  window.dispatchEvent(
    new CustomEvent("novara-profile-updated", {
      detail: profile,
    })
  );
}

function getLanguage(id) {
  return (
    LANGUAGES.find(
      (language) => language.id === id
    ) || LANGUAGES[0]
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(
    loadProfile
  );

  const [saved, setSaved] = useState(false);

  const activeLanguage = getLanguage(
    profile.activeLanguage
  );

  const activeLevel =
    LEVELS.find(
      (level) =>
        level.id ===
        (profile.levels?.[
          profile.activeLanguage
        ] || "beginner")
    ) || LEVELS[0];

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  function updateProfile(changes) {
    setProfile((current) => ({
      ...current,
      ...changes,
    }));

    setSaved(false);
  }

  function toggleLanguage(languageId) {
    setProfile((current) => {
      const exists =
        current.learningLanguages.includes(
          languageId
        );

      // Don't remove the only language.
      if (
        exists &&
        current.learningLanguages.length === 1
      ) {
        return current;
      }

      const languages = exists
        ? current.learningLanguages.filter(
            (id) => id !== languageId
          )
        : [
            ...current.learningLanguages,
            languageId,
          ];

      let activeLanguage =
        current.activeLanguage;

      // If active language was removed,
      // switch to another available language.
      if (
        !languages.includes(activeLanguage)
      ) {
        activeLanguage = languages[0];
      }

      return {
        ...current,
        learningLanguages: languages,
        activeLanguage,
      };
    });

    setSaved(false);
  }

  function setLevel(levelId) {
    setProfile((current) => ({
      ...current,
      levels: {
        ...current.levels,
        [current.activeLanguage]:
          levelId,
      },
    }));

    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function resetProfile() {
    const confirmed =
      window.confirm(
        "Reset your Novara profile?"
      );

    if (!confirmed) return;

    setProfile(DEFAULT_PROFILE);
    setSaved(false);
  }

  return (
    <section className="page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            NOVARA IDENTITY
          </div>

          <h1>
            Profile
          </h1>

          <p>
            Personalize your Novara learning
            experience.
          </p>
        </div>

        <div className="language-pill">
          {activeLanguage.flag}{" "}
          {activeLanguage.name}
        </div>

      </div>


      {/* PROFILE CARD */}

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
            {profile.name
              ? profile.name
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
              {profile.name ||
                "Your Profile"}
            </h2>

            <span
              style={{
                opacity: 0.5,
                fontSize: "12px",
              }}
            >
              {activeLanguage.flag}{" "}
              Learning{" "}
              {activeLanguage.name}
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
          value={profile.name}
          onChange={(event) =>
            updateProfile({
              name: event.target.value,
            })
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

      </div>


      {/* NATIVE LANGUAGE */}

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
          value={profile.nativeLanguage}
          onChange={(event) =>
            updateProfile({
              nativeLanguage:
                event.target.value,
            })
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
            outline: "none",
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


      {/* LEARNING LANGUAGES */}

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
          Select multiple languages.
          Your active language controls
          the AI Tutor and Conversation.
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

          {LANGUAGES.map((language) => {

            const selected =
              profile.learningLanguages.includes(
                language.id
              );

            const active =
              profile.activeLanguage ===
              language.id;

            return (
              <button
                key={language.id}
                type="button"
                onClick={() =>
                  toggleLanguage(
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
                    alignItems: "center",
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
                      ? "✓"
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
          })}

        </div>


        {/* ACTIVE LANGUAGE */}

        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "12px",
            background:
              "rgba(0,212,255,.06)",
            border:
              "1px solid rgba(0,212,255,.12)",
            fontSize: "12px",
          }}
        >
          💡 Click a selected language
          again to make it your active
          learning language.
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
          {activeLanguage.name.toUpperCase()} LEVEL
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

          {LEVELS.map((level) => {

            const selected =
              activeLevel.id === level.id;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() =>
                  setLevel(level.id)
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
          })}

        </div>

      </div>


      {/* JLPT */}

      {profile.learningLanguages.includes(
        "japanese"
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

          <h2>
            JLPT target
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "13px",
            }}
          >

            {["N5", "N4", "N3", "N2", "N1"].map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    updateProfile({
                      jlptTarget: level,
                    })
                  }
                  className={
                    profile.jlptTarget ===
                    level
                      ? "primary-button"
                      : "secondary-button"
                  }
                >
                  JLPT {level}
                </button>
              )
            )}

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

          {DAILY_GOALS.map((goal) => {

            const selected =
              profile.dailyGoal ===
              goal.value;

            return (
              <button
                key={goal.value}
                type="button"
                onClick={() =>
                  updateProfile({
                    dailyGoal:
                      goal.value,
                  })
                }
                className={
                  selected
                    ? "primary-button"
                    : "secondary-button"
                }
              >
                {goal.label}
              </button>
            );
          })}

        </div>

      </div>


      {/* SAVE */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >

        <button
          className="secondary-button"
          onClick={resetProfile}
        >
          Reset Profile
        </button>

        <button
          className="primary-button"
          onClick={handleSave}
        >
          {saved
            ? "✓ Profile Saved"
            : "Save Profile →"}
        </button>

      </div>

    </section>
  );
}