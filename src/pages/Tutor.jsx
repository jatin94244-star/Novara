import React, { useState } from "react";

const starterMessages = [
  {
    id: 1,
    role: "tutor",
    text: "こんにちは！ I'm your Novara Japanese tutor. Let's practice together 🇯🇵",
  },
  {
    id: 2,
    role: "tutor",
    text: "Try introducing yourself. You can start with: 「わたしは ___ です。」",
  },
];

const suggestions = [
  "How do I introduce myself?",
  "Teach me Japanese greetings",
  "How do I order food?",
  "Help me practice conversation",
];

const quickLessons = [
  {
    title: "Self Introduction",
    japanese: "わたしは学生です。",
    meaning: "I am a student.",
  },
  {
    title: "Greeting",
    japanese: "こんにちは！",
    meaning: "Hello!",
  },
  {
    title: "Thank You",
    japanese: "ありがとうございます。",
    meaning: "Thank you very much.",
  },
  {
    title: "Ask a Question",
    japanese: "これは何ですか？",
    meaning: "What is this?",
  },
];

function speakJapanese(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "ja-JP";
  speech.rate = 0.8;

  window.speechSynthesis.speak(speech);
}

function generateTutorReply(message) {
  const text = message.toLowerCase();

  if (
    text.includes("introduce") ||
    text.includes("name")
  ) {
    return {
      text:
        "Great choice! In Japanese, a simple self-introduction is 「わたしは ___ です。」. For example: 「わたしは Jatin です。」 means 'I am Jatin.'",
      japanese: "わたしは Jatin です。",
    };
  }

  if (
    text.includes("greeting") ||
    text.includes("hello")
  ) {
    return {
      text:
        "For a basic greeting, use 「こんにちは」. It means 'Hello'. Try saying it out loud!",
      japanese: "こんにちは",
    };
  }

  if (
    text.includes("food") ||
    text.includes("cafe") ||
    text.includes("order")
  ) {
    return {
      text:
        "At a café or restaurant, 「これをください」 is useful. It means 'This one, please.'",
      japanese: "これをください。",
    };
  }

  if (
    text.includes("conversation") ||
    text.includes("practice")
  ) {
    return {
      text:
        "Let's practice! Imagine you just met someone in Japan. Start with 「こんにちは」 and then introduce yourself.",
      japanese: "こんにちは。わたしは ___ です。",
    };
  }

  if (text.includes("thank")) {
    return {
      text:
        "「ありがとう」 means 'Thank you'. A more polite version is 「ありがとうございます」.",
      japanese: "ありがとうございます。",
    };
  }

  return {
    text:
      "Nice! Let's keep practicing. Try asking me about greetings, introductions, food, travel, or Japanese conversation.",
    japanese: "がんばりましょう！",
  };
}

export default function Tutor({ state }) {
  const [messages, setMessages] =
    useState(starterMessages);

  const [input, setInput] =
    useState("");

  const [isThinking, setIsThinking] =
    useState(false);

  const [xp, setXp] =
    useState(0);

  const [showHint, setShowHint] =
    useState(false);

  function sendMessage(customMessage) {
    const message =
      typeof customMessage === "string"
        ? customMessage.trim()
        : input.trim();

    if (!message || isThinking) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const reply =
        generateTutorReply(message);

      const tutorMessage = {
        id: Date.now() + 1,
        role: "tutor",
        text: reply.text,
        japanese: reply.japanese,
      };

      setMessages((previous) => [
        ...previous,
        tutorMessage,
      ]);

      setIsThinking(false);

      setXp(
        (previous) => previous + 5
      );
    }, 700);
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  const userMessageCount =
    messages.filter(
      (item) => item.role === "user"
    ).length;

  return (
    <section className="page tutor-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            AI LANGUAGE COACH
          </div>

          <h1>
            Novara Tutor
          </h1>

          <p>
            Practice Japanese naturally with
            your personal learning coach.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* STATS */}

      <div className="tutor-stats">

        <div className="result-card">
          <strong>AI</strong>
          <span>Tutor Mode</span>
        </div>

        <div className="result-card">
          <strong>{xp}</strong>
          <span>Session XP</span>
        </div>

        <div className="result-card">
          <strong>
            {userMessageCount}
          </strong>
          <span>Your Messages</span>
        </div>

        <div className="result-card">
          <strong>
            {state?.streak || 7}
          </strong>
          <span>Day Streak</span>
        </div>

      </div>


      {/* MAIN TUTOR LAYOUT */}

      <div className="tutor-layout">

        {/* CHAT */}

        <div
          className="question-card tutor-chat-card"
          style={{
            padding: 0,
            overflow: "hidden",
          }}
        >

          {/* CHAT HEADER */}

          <div className="tutor-chat-header">

            <div className="tutor-avatar">
              🤖
            </div>

            <div className="tutor-chat-title">

              <strong>
                Novara Sensei
              </strong>

              <div>
                ● Online • Japanese Coach
              </div>

            </div>

          </div>


          {/* MESSAGES */}

          <div className="tutor-messages">

            {messages.map((message) => (

              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "tutor-message-row user-message-row"
                    : "tutor-message-row"
                }
              >

                <div className="tutor-message">

                  <div className="tutor-message-text">
                    {message.text}
                  </div>

                  {message.japanese && (

                    <div className="tutor-japanese">

                      <span>
                        {message.japanese}
                      </span>

                      <button
                        className="secondary-button tutor-speak-button"
                        onClick={() =>
                          speakJapanese(
                            message.japanese
                          )
                        }
                        aria-label="Listen to Japanese pronunciation"
                        title="Listen"
                      >
                        🔊
                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}


            {/* THINKING */}

            {isThinking && (

              <div className="tutor-message-row">

                <div className="tutor-thinking">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>

              </div>

            )}

          </div>


          {/* SUGGESTIONS */}

          <div className="tutor-suggestions">

            {suggestions.map(
              (suggestion) => (

                <button
                  key={suggestion}
                  className="secondary-button"
                  onClick={() =>
                    sendMessage(
                      suggestion
                    )
                  }
                >
                  {suggestion}
                </button>

              )
            )}

          </div>


          {/* INPUT */}

          <div className="tutor-input-area">

            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask your Japanese tutor..."
              rows="1"
              aria-label="Ask your Japanese tutor"
            />

            <button
              className="primary-button"
              onClick={() =>
                sendMessage()
              }
              disabled={
                !input.trim() ||
                isThinking
              }
            >
              Send →
            </button>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="tutor-sidebar">

          {/* AI MODE */}

          <div className="question-card">

            <div className="eyebrow">
              TUTOR MODE
            </div>

            <h2>
              Conversation
            </h2>

            <p className="tutor-muted">
              Ask questions naturally and
              practice Japanese.
            </p>

            <div className="tutor-xp-box">

              <strong>
                ✦ +5 XP
              </strong>

              <div>
                per tutor interaction
              </div>

            </div>

          </div>


          {/* HINT */}

          <div className="question-card">

            <div className="eyebrow">
              SMART HINT
            </div>

            <h2>
              Need help?
            </h2>

            {!showHint ? (

              <button
                className="secondary-button"
                onClick={() =>
                  setShowHint(true)
                }
              >
                💡 Show Hint
              </button>

            ) : (

              <div className="tutor-hint">

                Try asking:
                <br />

                <strong>
                  "How do I introduce myself
                  in Japanese?"
                </strong>

              </div>

            )}

          </div>


          {/* QUICK PRACTICE */}

          <div className="question-card">

            <div className="eyebrow">
              QUICK PRACTICE
            </div>

            <h2>
              Useful Phrases
            </h2>

            <div className="quick-lesson-list">

              {quickLessons.map(
                (lesson) => (

                  <button
                    key={lesson.title}
                    className="secondary-button quick-lesson-button"
                    onClick={() =>
                      sendMessage(
                        `Teach me ${lesson.title}`
                      )
                    }
                  >

                    <strong>
                      {lesson.japanese}
                    </strong>

                    <small>
                      {lesson.meaning}
                    </small>

                  </button>

                )
              )}

            </div>

          </div>

        </div>

      </div>


      {/* FOOTER TIP */}

      <div className="path-tip tutor-footer-tip">

        <span>🧠</span>

        <div>

          <strong>
            Tutor tip
          </strong>

          <p>
            Don't worry about making mistakes.
            Novara is designed to let you
            practice, get feedback and try
            again.
          </p>

        </div>

      </div>

    </section>
  );
}