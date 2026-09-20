import React, {
  useEffect,
  useState,
} from "react";

import { useNovaraStore } from "../store/useNovaraStore";

/* =========================================================
   NOVARA LESSON DATABASE
========================================================= */

const lessonData = {
  1: {
    title: "Greetings",
    subtitle: "Learn the most useful Japanese greetings.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "こんにちは",
        romaji: "Konnichiwa",
        meaning: "Hello",
      },
      {
        jp: "おはよう",
        romaji: "Ohayou",
        meaning: "Good morning",
      },
      {
        jp: "ありがとう",
        romaji: "Arigatou",
        meaning: "Thank you",
      },
      {
        jp: "さようなら",
        romaji: "Sayounara",
        meaning: "Goodbye",
      },
    ],

    questions: [
      {
        question: "What does 「こんにちは」 mean?",
        options: [
          "Hello",
          "Thank you",
          "Good night",
          "Sorry",
        ],
        answer: "Hello",
        explanation:
          "こんにちは means Hello.",
      },
      {
        question: "What does 「ありがとう」 mean?",
        options: [
          "Goodbye",
          "Thank you",
          "Hello",
          "Sorry",
        ],
        answer: "Thank you",
        explanation:
          "ありがとう means Thank you.",
      },
      {
        question: "Which phrase means Good morning?",
        options: [
          "おはよう",
          "こんばんは",
          "ありがとう",
          "さようなら",
        ],
        answer: "おはよう",
        explanation:
          "おはよう means Good morning.",
      },
      {
        question: "Which phrase means Goodbye?",
        options: [
          "こんにちは",
          "ありがとう",
          "さようなら",
          "おはよう",
        ],
        answer: "さようなら",
        explanation:
          "さようなら means Goodbye.",
      },
    ],
  },

  2: {
    title: "Introduce Yourself",
    subtitle: "Learn how to introduce yourself in Japanese.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "わたし",
        romaji: "Watashi",
        meaning: "I / Me",
      },
      {
        jp: "なまえ",
        romaji: "Namae",
        meaning: "Name",
      },
      {
        jp: "はじめまして",
        romaji: "Hajimemashite",
        meaning: "Nice to meet you",
      },
      {
        jp: "です",
        romaji: "Desu",
        meaning: "Am / Is / Are",
      },
    ],

    questions: [
      {
        question: "How do you say 'My name is Jatin'?",
        options: [
          "わたしは ジャティンです",
          "ありがとう ジャティン",
          "おはよう ジャティン",
          "さようなら ジャティン",
        ],
        answer: "わたしは ジャティンです",
        explanation:
          "わたしは〜です is a basic self-introduction pattern.",
      },
      {
        question: "What does 「はじめまして」 mean?",
        options: [
          "Good night",
          "Nice to meet you",
          "Thank you",
          "See you",
        ],
        answer: "Nice to meet you",
        explanation:
          "はじめまして is used when meeting someone for the first time.",
      },
      {
        question: "What does 「わたし」 mean?",
        options: [
          "You",
          "Friend",
          "I / Me",
          "Teacher",
        ],
        answer: "I / Me",
        explanation:
          "わたし means I or me.",
      },
      {
        question: "Which word means name?",
        options: [
          "なまえ",
          "ともだち",
          "せんせい",
          "がくせい",
        ],
        answer: "なまえ",
        explanation:
          "なまえ means name.",
      },
    ],
  },

  3: {
    title: "Everyday Life",
    subtitle: "Talk about your daily routine in Japanese.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "あさ",
        romaji: "Asa",
        meaning: "Morning",
      },
      {
        jp: "がっこう",
        romaji: "Gakkou",
        meaning: "School",
      },
      {
        jp: "たべます",
        romaji: "Tabemasu",
        meaning: "Eat",
      },
      {
        jp: "ねます",
        romaji: "Nemasu",
        meaning: "Sleep",
      },
    ],

    questions: [
      {
        question: "What does 「あさ」 mean?",
        options: [
          "Morning",
          "Night",
          "Food",
          "School",
        ],
        answer: "Morning",
        explanation:
          "あさ means morning.",
      },
      {
        question: "What does 「たべます」 mean?",
        options: [
          "Sleep",
          "Eat",
          "Go",
          "Study",
        ],
        answer: "Eat",
        explanation:
          "たべます means to eat.",
      },
      {
        question: "What does 「ねます」 mean?",
        options: [
          "Wake up",
          "Eat",
          "Sleep",
          "Work",
        ],
        answer: "Sleep",
        explanation:
          "ねます means to sleep.",
      },
      {
        question: "What does 「がっこう」 mean?",
        options: [
          "Home",
          "School",
          "Station",
          "Office",
        ],
        answer: "School",
        explanation:
          "がっこう means school.",
      },
    ],
  },

  4: {
    title: "Food & Cafés",
    subtitle: "Learn useful Japanese for cafés and restaurants.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "みず",
        romaji: "Mizu",
        meaning: "Water",
      },
      {
        jp: "おちゃ",
        romaji: "Ocha",
        meaning: "Tea",
      },
      {
        jp: "コーヒー",
        romaji: "Koohii",
        meaning: "Coffee",
      },
      {
        jp: "ください",
        romaji: "Kudasai",
        meaning: "Please / I'd like",
      },
    ],

    questions: [
      {
        question: "What does 「みず」 mean?",
        options: [
          "Rice",
          "Water",
          "Tea",
          "Coffee",
        ],
        answer: "Water",
        explanation:
          "みず means water.",
      },
      {
        question: "How do you say coffee in Japanese?",
        options: [
          "コーヒー",
          "おちゃ",
          "みず",
          "ごはん",
        ],
        answer: "コーヒー",
        explanation:
          "コーヒー means coffee.",
      },
      {
        question: "What does 「おちゃ」 mean?",
        options: [
          "Coffee",
          "Tea",
          "Water",
          "Juice",
        ],
        answer: "Tea",
        explanation:
          "おちゃ means tea.",
      },
      {
        question: "What does 「ください」 mean when ordering?",
        options: [
          "Please / I'd like",
          "Goodbye",
          "Sorry",
          "Where?",
        ],
        answer: "Please / I'd like",
        explanation:
          "ください is commonly used when politely requesting something.",
      },
    ],
  },

  5: {
    title: "Shopping",
    subtitle: "Learn useful Japanese for shopping.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "これ",
        romaji: "Kore",
        meaning: "This",
      },
      {
        jp: "いくら",
        romaji: "Ikura",
        meaning: "How much",
      },
      {
        jp: "たかい",
        romaji: "Takai",
        meaning: "Expensive / High",
      },
      {
        jp: "ください",
        romaji: "Kudasai",
        meaning: "Please / I'd like",
      },
    ],

    questions: [
      {
        question: "What does 「いくらですか」 mean?",
        options: [
          "Where is it?",
          "How much is it?",
          "What is this?",
          "Can I go?",
        ],
        answer: "How much is it?",
        explanation:
          "いくらですか means How much is it?",
      },
      {
        question: "What does 「これ」 mean?",
        options: [
          "That",
          "This",
          "Where",
          "Who",
        ],
        answer: "This",
        explanation:
          "これ means this.",
      },
      {
        question: "What does 「たかい」 mean?",
        options: [
          "Cheap",
          "Expensive / High",
          "Small",
          "New",
        ],
        answer: "Expensive / High",
        explanation:
          "たかい can mean expensive or high.",
      },
      {
        question: "What does 「ください」 mean?",
        options: [
          "Please give me / I'd like",
          "How much?",
          "Where?",
          "Goodbye",
        ],
        answer: "Please give me / I'd like",
        explanation:
          "ください is used when politely asking for something.",
      },
    ],
  },

  6: {
    title: "Travel",
    subtitle: "Learn Japanese for transport and directions.",
    category: "JAPANESE • BEGINNER",
    maxXP: 100,

    vocabulary: [
      {
        jp: "えき",
        romaji: "Eki",
        meaning: "Station",
      },
      {
        jp: "でんしゃ",
        romaji: "Densha",
        meaning: "Train",
      },
      {
        jp: "どこ",
        romaji: "Doko",
        meaning: "Where",
      },
      {
        jp: "みぎ",
        romaji: "Migi",
        meaning: "Right",
      },
    ],

    questions: [
      {
        question: "What does 「えき」 mean?",
        options: [
          "Airport",
          "Station",
          "Hotel",
          "School",
        ],
        answer: "Station",
        explanation:
          "えき means station.",
      },
      {
        question: "What does 「でんしゃ」 mean?",
        options: [
          "Bus",
          "Train",
          "Taxi",
          "Plane",
        ],
        answer: "Train",
        explanation:
          "でんしゃ means train.",
      },
      {
        question: "What does 「どこ」 mean?",
        options: [
          "Who",
          "What",
          "Where",
          "When",
        ],
        answer: "Where",
        explanation:
          "どこ means where.",
      },
      {
        question: "What does 「みぎ」 mean?",
        options: [
          "Left",
          "Right",
          "Straight",
          "Back",
        ],
        answer: "Right",
        explanation:
          "みぎ means right.",
      },
    ],
  },
};


/* =========================================================
   COMPONENT
========================================================= */

export default function Lesson({
  setPage,
  completeLesson,
  lessonId,
}) {
  const { state } =
    useNovaraStore();

  const activeLanguage =
    state.activeLanguage ||
    "Japanese";
  const activeLessonId =
    Number(lessonId) || 1;

  const lesson =
    lessonData[activeLessonId] ||
    lessonData[1];

  const questions =
    lesson.questions;

  /* -------------------------------------------------------
     MODES
  ------------------------------------------------------- */

  const [mode, setMode] =
    useState("learn");

  const [wordIndex, setWordIndex] =
    useState(0);

  const [current, setCurrent] =
    useState(0);

  const [selected, setSelected] =
    useState(null);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [rewarded, setRewarded] =
    useState(false);


  /* -------------------------------------------------------
     CURRENT QUESTION
  ------------------------------------------------------- */

  const question =
    questions[current];

  const answered =
    selected !== null;

  const correct =
    selected === question.answer;


  /* -------------------------------------------------------
     XP / COMPLETION
  ------------------------------------------------------- */

  useEffect(() => {

    if (!finished || rewarded) {
      return;
    }

    const xp =
      score * 25;

    if (
      typeof completeLesson ===
      "function"
    ) {
      completeLesson(
        activeLessonId,
        xp
      );
    }

    setRewarded(true);

  }, [
    finished,
    rewarded,
    score,
    completeLesson,
    activeLessonId,
  ]);


  /* -------------------------------------------------------
     SPEAK JAPANESE
  ------------------------------------------------------- */

  function speak(text) {

    if (
      typeof window ===
        "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    const speechLanguages = {
  Japanese: "ja-JP",
  English: "en-US",
  Korean: "ko-KR",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Mandarin: "zh-CN",
  Italian: "it-IT",
};

utterance.lang =
  speechLanguages[
    activeLanguage
  ] || "ja-JP";
    utterance.rate = 0.8;

    window.speechSynthesis.speak(
      utterance
    );
  }


  /* -------------------------------------------------------
     ANSWER
  ------------------------------------------------------- */

  function chooseAnswer(option) {

    if (answered) {
      return;
    }

    setSelected(option);

    if (
      option === question.answer
    ) {
      setScore(
        previous =>
          previous + 1
      );
    }
  }


  /* -------------------------------------------------------
     NEXT QUIZ QUESTION
  ------------------------------------------------------- */

  function nextQuestion() {

    if (
      current ===
      questions.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrent(
      previous =>
        previous + 1
    );

    setSelected(null);
  }


  /* -------------------------------------------------------
     NEXT VOCABULARY
  ------------------------------------------------------- */

  function nextWord() {

    if (
      wordIndex ===
      lesson.vocabulary.length - 1
    ) {
      setMode("practice");
      return;
    }

    setWordIndex(
      previous =>
        previous + 1
    );
  }


  /* -------------------------------------------------------
     RESTART
  ------------------------------------------------------- */

  function restartLesson() {

    setMode("learn");

    setWordIndex(0);

    setCurrent(0);

    setSelected(null);

    setScore(0);

    setFinished(false);

    setRewarded(false);
  }


  /* =========================================================
     RESULT SCREEN
  ========================================================= */

  if (finished) {

    const xp =
      score * 25;

    const accuracy =
      Math.round(
        (score /
          questions.length) *
          100
      );

    return (
      <section className="page lesson-page">

        <div className="lesson-complete">

          <div className="complete-icon">
            {accuracy >= 75
              ? "🎉"
              : "💪"}
          </div>

          <div className="eyebrow">
            MISSION COMPLETE
          </div>

          <h1>
            {accuracy >= 75
              ? "Great work!"
              : "Keep practicing!"}
          </h1>

          <p>
            You completed{" "}
            <strong>
              {lesson.title}
            </strong>.
          </p>

          <div className="result-grid">

            <div className="result-card">
              <strong>
                {score}/
                {questions.length}
              </strong>

              <span>
                Correct
              </span>
            </div>

            <div className="result-card">
              <strong>
                +{xp}
              </strong>

              <span>
                XP earned
              </span>
            </div>

            <div className="result-card">
              <strong>
                {accuracy}%
              </strong>

              <span>
                Accuracy
              </span>
            </div>

          </div>

          <div className="complete-actions">

            <button
              className="primary-button"
              onClick={() =>
                setPage("path")
              }
            >
              Back to Learning Path
            </button>

            <button
              className="secondary-button"
              onClick={
                restartLesson
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </section>
    );
  }


  /* =========================================================
     LEARN MODE
  ========================================================= */

  if (mode === "learn") {

    const word =
      lesson.vocabulary[wordIndex];

    const learnProgress =
      ((wordIndex + 1) /
        lesson.vocabulary.length) *
      100;

    return (
      <section className="page lesson-page">

        <div className="lesson-top">

          <button
            className="back-button"
            onClick={() =>
              setPage("path")
            }
          >
            ← Learning Path
          </button>

          <div className="lesson-counter">
            Learn {wordIndex + 1} /{" "}
            {lesson.vocabulary.length}
          </div>

        </div>


        <div className="lesson-progress">

          <div
            className="lesson-progress-fill"
            style={{
              width:
                `${learnProgress}%`,
            }}
          />

        </div>


        <div className="lesson-heading">

          <div>

            <div className="eyebrow">
              {lesson.category}
            </div>

            <h1>
              {lesson.title}
            </h1>

            <p>
              Learn these words before
              starting the mission.
            </p>

          </div>

          <div className="xp-badge">
            ✦ Up to {lesson.maxXP} XP
          </div>

        </div>


        {/* VOCAB CARD */}

        <div className="question-card">

          <div className="question-number">
            VOCABULARY
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "30px 10px",
            }}
          >

            <div
              style={{
                fontSize: "52px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              {word.jp}
            </div>

            <div
              style={{
                fontSize: "20px",
                opacity: 0.7,
                marginBottom: "8px",
              }}
            >
              {word.romaji}
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "600",
                marginBottom: "24px",
              }}
            >
              {word.meaning}
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                speak(word.jp)
              }
            >
              🔊 Listen
            </button>

          </div>


          <div className="question-footer">

            <span>
              Word {wordIndex + 1} of{" "}
              {lesson.vocabulary.length}
            </span>

            <button
              className="primary-button"
              onClick={
                nextWord
              }
            >
              {wordIndex ===
              lesson.vocabulary.length - 1
                ? "Start Practice →"
                : "Next Word →"}
            </button>

          </div>

        </div>

      </section>
    );
  }


  /* =========================================================
     PRACTICE MODE
  ========================================================= */

  if (mode === "practice") {

    return (
      <section className="page lesson-page">

        <div className="lesson-top">

          <button
            className="back-button"
            onClick={() =>
              setPage("path")
            }
          >
            ← Learning Path
          </button>

          <div className="lesson-counter">
            QUICK PRACTICE
          </div>

        </div>


        <div className="lesson-heading">

          <div>

            <div className="eyebrow">
              READY?
            </div>

            <h1>
              Practice before the mission
            </h1>

            <p>
              You just learned{" "}
              {lesson.vocabulary.length}{" "}
              useful words.
            </p>

          </div>

        </div>


        <div className="question-card">

          <div className="question-number">
            QUICK REVIEW
          </div>

          <h2>
            Can you recognize these
            Japanese words?
          </h2>

          <div
            className="answer-grid"
          >

            {lesson.vocabulary.map(
              (word) => (
                <div
                  className="answer-option"
                  key={word.jp}
                  style={{
                    cursor: "default",
                  }}
                >

                  <span
                    style={{
                      fontSize: "24px",
                    }}
                  >
                    {word.jp}
                  </span>

                  <span>
                    {word.meaning}
                  </span>

                </div>
              )
            )}

          </div>


          <div className="question-footer">

            <span>
              Mission unlocked
            </span>

            <button
              className="primary-button"
              onClick={() =>
                setMode("quiz")
              }
            >
              Start Mission →
            </button>

          </div>

        </div>

      </section>
    );
  }


  /* =========================================================
     QUIZ MODE
  ========================================================= */

  const quizProgress =
    (
      (current +
        (answered ? 1 : 0)) /
      questions.length
    ) * 100;


  return (
    <section className="page lesson-page">


      {/* TOP */}

      <div className="lesson-top">

        <button
          className="back-button"
          onClick={() =>
            setPage("path")
          }
        >
          ← Learning Path
        </button>

        <div className="lesson-counter">
          {current + 1} /{" "}
          {questions.length}
        </div>

      </div>


      {/* PROGRESS */}

      <div className="lesson-progress">

        <div
          className="lesson-progress-fill"
          style={{
            width:
              `${quizProgress}%`,
          }}
        />

      </div>


      {/* HEADING */}

      <div className="lesson-heading">

        <div>

          <div className="eyebrow">
            MISSION • {lesson.category}
          </div>

          <h1>
            {lesson.title}
          </h1>

          <p>
            Choose the best answer.
          </p>

        </div>

        <div className="xp-badge">
          ✦ +25 XP / correct
        </div>

      </div>


      {/* QUESTION */}

      <div className="question-card">

        <div className="question-number">
          QUESTION {current + 1}
        </div>

        <h2>
          {question.question}
        </h2>


        {/* ANSWERS */}

        <div className="answer-grid">

          {question.options.map(
            (option, index) => {

              let className =
                "answer-option";

              if (
                selected === option
              ) {
                className +=
                  correct
                    ? " correct"
                    : " incorrect";
              }

              if (
                answered &&
                option ===
                  question.answer &&
                selected !== option
              ) {
                className +=
                  " correct";
              }

              return (
                <button
                  key={option}
                  className={className}
                  onClick={() =>
                    chooseAnswer(
                      option
                    )
                  }
                >

                  <span className="answer-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span>
                    {option}
                  </span>

                  {answered &&
                    option ===
                      question.answer && (
                      <span className="answer-check">
                        ✓
                      </span>
                    )}

                </button>
              );
            }
          )}

        </div>


        {/* FEEDBACK */}

        {answered && (

          <div
            className={`answer-feedback ${
              correct
                ? "feedback-correct"
                : "feedback-wrong"
            }`}
          >

            <strong>
              {correct
                ? "✓ Correct!"
                : "Not quite"}
            </strong>

            <p>
              {question.explanation}
            </p>

          </div>

        )}


        {/* FOOTER */}

        <div className="question-footer">

          <span>

            {answered
              ? correct
                ? "+25 XP"
                : "Keep practicing"
              : "Choose an answer"}

          </span>

          <button
            className="primary-button"
            disabled={!answered}
            onClick={
              nextQuestion
            }
          >

            {current ===
            questions.length - 1
              ? "Finish Mission"
              : "Next Question →"}

          </button>

        </div>

      </div>

    </section>
  );
}