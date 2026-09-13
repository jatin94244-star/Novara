import React, { useMemo, useState } from "react";

const initialWords = [
  {
    id: 1,
    japanese: "こんにちは",
    romaji: "Konnichiwa",
    meaning: "Hello",
    category: "Greetings",
    level: "Mastered",
    example: "こんにちは！お元気ですか？",
    exampleMeaning: "Hello! How are you?",
  },
  {
    id: 2,
    japanese: "ありがとう",
    romaji: "Arigatou",
    meaning: "Thank you",
    category: "Greetings",
    level: "Learning",
    example: "ありがとう ございます。",
    exampleMeaning: "Thank you very much.",
  },
  {
    id: 3,
    japanese: "おはよう",
    romaji: "Ohayou",
    meaning: "Good morning",
    category: "Greetings",
    level: "Learning",
    example: "おはよう ございます。",
    exampleMeaning: "Good morning.",
  },
  {
    id: 4,
    japanese: "わたし",
    romaji: "Watashi",
    meaning: "I / Me",
    category: "Basics",
    level: "Learning",
    example: "わたしは がくせいです。",
    exampleMeaning: "I am a student.",
  },
  {
    id: 5,
    japanese: "がくせい",
    romaji: "Gakusei",
    meaning: "Student",
    category: "Basics",
    level: "New",
    example: "わたしは がくせいです。",
    exampleMeaning: "I am a student.",
  },
  {
    id: 6,
    japanese: "ともだち",
    romaji: "Tomodachi",
    meaning: "Friend",
    category: "People",
    level: "New",
    example: "ともだちと はなします。",
    exampleMeaning: "I talk with my friend.",
  },
  {
    id: 7,
    japanese: "みず",
    romaji: "Mizu",
    meaning: "Water",
    category: "Food",
    level: "New",
    example: "みずを ください。",
    exampleMeaning: "Water, please.",
  },
  {
    id: 8,
    japanese: "ごはん",
    romaji: "Gohan",
    meaning: "Rice / Meal",
    category: "Food",
    level: "New",
    example: "ごはんを たべます。",
    exampleMeaning: "I eat a meal.",
  },
  {
    id: 9,
    japanese: "おいしい",
    romaji: "Oishii",
    meaning: "Delicious",
    category: "Food",
    level: "New",
    example: "ラーメンは おいしいです。",
    exampleMeaning: "Ramen is delicious.",
  },
  {
    id: 10,
    japanese: "えき",
    romaji: "Eki",
    meaning: "Station",
    category: "Travel",
    level: "New",
    example: "えきは どこですか？",
    exampleMeaning: "Where is the station?",
  },
  {
    id: 11,
    japanese: "でんしゃ",
    romaji: "Densha",
    meaning: "Train",
    category: "Travel",
    level: "New",
    example: "でんしゃに のります。",
    exampleMeaning: "I take the train.",
  },
  {
    id: 12,
    japanese: "いくら",
    romaji: "Ikura",
    meaning: "How much?",
    category: "Shopping",
    level: "New",
    example: "これは いくらですか？",
    exampleMeaning: "How much is this?",
  },
];

const categories = [
  "All",
  "Greetings",
  "Basics",
  "People",
  "Food",
  "Travel",
  "Shopping",
];

function speak(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = "ja-JP";
  voice.rate = 0.8;

  window.speechSynthesis.speak(voice);
}

export default function Vocabulary({ addXP }) {
  const [words, setWords] = useState(initialWords);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [selectedWord, setSelectedWord] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch =
        word.japanese
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        word.romaji
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        word.meaning
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        word.category === category;

      const matchesLevel =
        level === "All" ||
        word.level === level;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel
      );
    });
  }, [words, search, category, level]);

  const mastered = words.filter(
    (word) => word.level === "Mastered"
  ).length;

  const learning = words.filter(
    (word) => word.level === "Learning"
  ).length;

  const newWords = words.filter(
    (word) => word.level === "New"
  ).length;

  const mastery =
    words.length === 0
      ? 0
      : Math.round(
          (mastered / words.length) * 100
        );

  function markMastered(id) {
    setWords((previous) =>
      previous.map((word) =>
        word.id === id
          ? {
              ...word,
              level: "Mastered",
            }
          : word
      )
    );

    if (addXP) {
      addXP(10);
    }
  }

  return (
    <section className="page vocabulary-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            WORD VAULT
          </div>

          <h1>
            Vocabulary
          </h1>

          <p>
            Build your Japanese vocabulary,
            one word at a time.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >

        <div className="result-card">
          <strong>{words.length}</strong>
          <span>Total Words</span>
        </div>

        <div className="result-card">
          <strong>{mastered}</strong>
          <span>Mastered</span>
        </div>

        <div className="result-card">
          <strong>{learning}</strong>
          <span>Learning</span>
        </div>

        <div className="result-card">
          <strong>{newWords}</strong>
          <span>New</span>
        </div>

      </div>


      {/* MASTERY */}

      <div className="path-progress-card">

        <div className="progress-top">

          <div>
            <span className="progress-label">
              Vocabulary Mastery
            </span>

            <h2>
              Keep building your word power
            </h2>
          </div>

          <strong>
            {mastery}%
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: `${mastery}%`,
            }}
          />

        </div>

        <div className="progress-footer">

          <span>
            ✦ {mastered} mastered
          </span>

          <span>
            🎯 {words.length - mastered} to go
          </span>

        </div>

      </div>


      {/* CONTROLS */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          margin: "22px 0",
        }}
      >

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search Japanese, romaji or meaning..."
          style={{
            flex: "1 1 260px",
            padding: "14px 16px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.04)",
            color: "inherit",
            outline: "none",
          }}
        />

        <button
          className="primary-button"
          onClick={() =>
            setShowQuiz(true)
          }
        >
          🧠 Quick Quiz
        </button>

      </div>


      {/* CATEGORIES */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >

        {categories.map((item) => (

          <button
            key={item}
            className={
              category === item
                ? "primary-button"
                : "secondary-button"
            }
            onClick={() =>
              setCategory(item)
            }
          >
            {item}
          </button>

        ))}

      </div>


      {/* LEVEL FILTER */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "22px",
        }}
      >

        {["All", "New", "Learning", "Mastered"].map(
          (item) => (

            <button
              key={item}
              className={
                level === item
                  ? "primary-button"
                  : "secondary-button"
              }
              onClick={() =>
                setLevel(item)
              }
            >
              {item}
            </button>

          )
        )}

      </div>


      {/* WORD GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >

        {filteredWords.map((word) => (

          <div
            key={word.id}
            className="question-card"
            style={{
              cursor: "pointer",
            }}
            onClick={() =>
              setSelectedWord(word)
            }
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
              }}
            >

              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "10px",
                }}
              >
                🇯🇵
              </div>

              <span
                style={{
                  fontSize: "11px",
                  padding:
                    "5px 8px",
                  borderRadius: "20px",
                  background:
                    word.level === "Mastered"
                      ? "rgba(34,197,94,.12)"
                      : word.level === "Learning"
                      ? "rgba(245,158,11,.12)"
                      : "rgba(255,255,255,.06)",
                }}
              >
                {word.level}
              </span>

            </div>


            <h2
              style={{
                margin:
                  "0 0 4px",
              }}
            >
              {word.japanese}
            </h2>

            <div
              style={{
                opacity: 0.55,
                marginBottom: "8px",
              }}
            >
              {word.romaji}
            </div>

            <h3>
              {word.meaning}
            </h3>

            <div
              style={{
                fontSize: "12px",
                opacity: 0.5,
                marginTop: "8px",
              }}
            >
              {word.category}
            </div>


            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "18px",
              }}
            >

              <button
                className="secondary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.japanese);
                }}
              >
                🔊
              </button>

              {word.level !==
                "Mastered" && (

                <button
                  className="primary-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markMastered(word.id);
                  }}
                >
                  ✓ Master
                </button>

              )}

            </div>

          </div>

        ))}

      </div>


      {filteredWords.length === 0 && (

        <div
          className="question-card"
          style={{
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <h2>
            No words found
          </h2>

          <p>
            Try another search or category.
          </p>
        </div>

      )}


      {/* WORD DETAIL MODAL */}

      {selectedWord && (

        <div
          onClick={() =>
            setSelectedWord(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.7)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >

          <div
            className="question-card"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "min(600px, 100%)",
            }}
          >

            <div className="eyebrow">
              WORD DETAIL
            </div>

            <h1
              style={{
                fontSize: "48px",
                margin:
                  "15px 0 5px",
              }}
            >
              {selectedWord.japanese}
            </h1>

            <p
              style={{
                opacity: 0.55,
              }}
            >
              {selectedWord.romaji}
            </p>

            <h2>
              {selectedWord.meaning}
            </h2>

            <div
              style={{
                padding: "15px",
                borderRadius: "12px",
                background:
                  "rgba(255,255,255,.04)",
                margin:
                  "20px 0",
              }}
            >

              <strong>
                Example
              </strong>

              <p>
                {selectedWord.example}
              </p>

              <small>
                {selectedWord.exampleMeaning}
              </small>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >

              <button
                className="primary-button"
                onClick={() =>
                  speak(
                    selectedWord.japanese
                  )
                }
              >
                🔊 Listen
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedWord(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* QUIZ MODAL */}

      {showQuiz && (
        <VocabularyQuiz
          words={words}
          close={() =>
            setShowQuiz(false)
          }
          addXP={addXP}
        />
      )}

    </section>
  );
}


/* ==========================================
   VOCABULARY QUIZ
========================================== */

function VocabularyQuiz({
  words,
  close,
  addXP,
}) {
  const [index, setIndex] =
    useState(0);

  const [selected, setSelected] =
    useState(null);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const current =
    words[index % words.length];

  const options = [
    current.meaning,
    ...words
      .filter(
        (word) =>
          word.id !== current.id
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(
        (word) =>
          word.meaning
      ),
  ].sort(() => Math.random() - 0.5);

  function answer(option) {
    if (selected) return;

    setSelected(option);

    if (
      option === current.meaning
    ) {
      setScore(
        (previous) =>
          previous + 1
      );
    }
  }

  function next() {
    if (
      index >= 4
    ) {
      const finalScore =
        score +
        (selected ===
        current.meaning
          ? 1
          : 0);

      if (addXP) {
        addXP(
          finalScore * 10
        );
      }

      setFinished(true);
      return;
    }

    setIndex(
      (previous) =>
        previous + 1
    );

    setSelected(null);
  }

  if (finished) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          background:
            "rgba(0,0,0,.78)",
          display: "grid",
          placeItems: "center",
          padding: "20px",
        }}
      >

        <div
          className="lesson-complete"
          style={{
            width:
              "min(600px, 100%)",
          }}
        >

          <div className="complete-icon">
            🧠
          </div>

          <div className="eyebrow">
            QUIZ COMPLETE
          </div>

          <h1>
            Vocabulary boost!
          </h1>

          <p>
            You scored{" "}
            <strong>
              {score}/5
            </strong>
          </p>

          <div className="result-grid">

            <div className="result-card">
              <strong>
                {score}/5
              </strong>
              <span>Correct</span>
            </div>

            <div className="result-card">
              <strong>
                +{score * 10}
              </strong>
              <span>XP earned</span>
            </div>

          </div>

          <button
            className="primary-button"
            onClick={close}
          >
            Back to Vocabulary
          </button>

        </div>

      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background:
          "rgba(0,0,0,.78)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >

      <div
        className="question-card"
        style={{
          width:
            "min(650px, 100%)",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >

          <div className="eyebrow">
            QUICK VOCAB QUIZ
          </div>

          <span>
            {index + 1}/5
          </span>

        </div>

        <h1
          style={{
            fontSize: "48px",
            margin:
              "25px 0 5px",
          }}
        >
          {current.japanese}
        </h1>

        <p
          style={{
            opacity: 0.55,
          }}
        >
          {current.romaji}
        </p>

        <div
          style={{
            display: "grid",
            gap: "10px",
            marginTop: "25px",
          }}
        >

          {options.map(
            (option) => {

              const correct =
                option ===
                current.meaning;

              let background =
                "rgba(255,255,255,.04)";

              if (selected) {
                if (correct) {
                  background =
                    "rgba(34,197,94,.15)";
                } else if (
                  option === selected
                ) {
                  background =
                    "rgba(239,68,68,.15)";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() =>
                    answer(option)
                  }
                  disabled={
                    !!selected
                  }
                  style={{
                    padding:
                      "15px",
                    borderRadius:
                      "12px",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    background,
                    color:
                      "inherit",
                    textAlign:
                      "left",
                    cursor:
                      selected
                        ? "default"
                        : "pointer",
                  }}
                >
                  {option}
                </button>
              );
            }
          )}

        </div>

        <div
          className="question-footer"
        >

          <span>
            {selected
              ? selected ===
                current.meaning
                ? "✓ Correct!"
                : `Answer: ${current.meaning}`
              : "Choose an answer"}
          </span>

          <button
            className="primary-button"
            disabled={!selected}
            onClick={next}
          >
            {index >= 4
              ? "Finish"
              : "Next →"}
          </button>

        </div>

      </div>

    </div>
  );
}