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

  const speech =
    new SpeechSynthesisUtterance(text);

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
      japanese:
        "わたしは Jatin です。",
    };
  }

  if (
    text.includes("greeting") ||
    text.includes("hello")
  ) {
    return {
      text:
        "For a basic greeting, use 「こんにちは」. It means 'Hello'. Try saying it out loud!",
      japanese:
        "こんにちは",
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
      japanese:
        "これをください。",
    };
  }

  if (
    text.includes("conversation") ||
    text.includes("practice")
  ) {
    return {
      text:
        "Let's practice! Imagine you just met someone in Japan. Start with 「こんにちは」 and then introduce yourself.",
      japanese:
        "こんにちは。わたしは ___ です。",
    };
  }

  if (
    text.includes("thank")
  ) {
    return {
      text:
        "「ありがとう」 means 'Thank you'. A more polite version is 「ありがとうございます」.",
      japanese:
        "ありがとうございます。",
    };
  }

  return {
    text:
      "Nice! Let's keep practicing. Try asking me about greetings, introductions, food, travel, or Japanese conversation.",
    japanese:
      "がんばりましょう！",
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
      setXp((previous) => previous + 5);
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

  return (
    <section className="page tutor-page">

      {/* =================================
          HEADER
      ================================= */}

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


      {/* =================================
          TUTOR STATS
      ================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >

        <div className="result-card">
          <strong>AI</strong>
          <span>Tutor Mode</span>
        </div>

        <div className="result-card">
          <strong>
            {xp}
          </strong>
          <span>Session XP</span>
        </div>

        <div className="result-card">
          <strong>
            {messages.filter(
              (item) =>
                item.role === "user"
            ).length}
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


      {/* =================================
          TUTOR LAYOUT
      ================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 280px",
          gap: "18px",
          alignItems: "start",
        }}
      >

        {/* =================================
            CHAT
        ================================= */}

        <div
          className="question-card"
          style={{
            padding: "0",
            overflow: "hidden",
          }}
        >

          {/* CHAT HEADER */}

          <div
            style={{
              padding: "18px 20px",
              borderBottom:
                "1px solid rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg,#7c5cff,#4f46e5)",
                fontSize: "20px",
              }}
            >
              🤖
            </div>

            <div>
              <strong>
                Novara Sensei
              </strong>

              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.5,
                  marginTop: "2px",
                }}
              >
                ● Online • Japanese Coach
              </div>
            </div>

          </div>


          {/* MESSAGES */}

          <div
            style={{
              height: "480px",
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >

            {messages.map((message) => (

              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent:
                    message.role === "user"
                      ? "flex-end"
                      : "flex-start",
                }}
              >

                <div
                  style={{
                    maxWidth: "78%",
                    padding: "13px 15px",
                    borderRadius:
                      message.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      message.role === "user"
                        ? "rgba(124,92,255,.18)"
                        : "rgba(255,255,255,.05)",
                    border:
                      "1px solid rgba(255,255,255,.07)",
                  }}
                >

                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {message.text}
                  </div>

                  {message.japanese && (

                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px",
                        borderRadius: "10px",
                        background:
                          "rgba(0,0,0,.18)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >

                      <span
                        style={{
                          fontSize: "18px",
                          flex: 1,
                        }}
                      >
                        {message.japanese}
                      </span>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          speakJapanese(
                            message.japanese
                          )
                        }
                      >
                        🔊
                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}


            {isThinking && (

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-start",
                }}
              >

                <div
                  style={{
                    padding: "13px 17px",
                    borderRadius:
                      "16px 16px 16px 4px",
                    background:
                      "rgba(255,255,255,.05)",
                  }}
                >
                  <span>
                    ● ● ●
                  </span>
                </div>

              </div>

            )}

          </div>


          {/* SUGGESTIONS */}

          <div
            style={{
              padding:
                "0 18px 12px",
              display: "flex",
              gap: "7px",
              overflowX: "auto",
            }}
          >

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
                  style={{
                    whiteSpace:
                      "nowrap",
                    fontSize: "12px",
                  }}
                >
                  {suggestion}
                </button>

              )
            )}

          </div>


          {/* INPUT */}

          <div
            style={{
              padding: "12px 18px 18px",
              display: "flex",
              gap: "10px",
            }}
          >

            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask your Japanese tutor..."
              rows="1"
              style={{
                flex: 1,
                resize: "none",
                padding: "14px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(255,255,255,.1)",
                background:
                  "rgba(255,255,255,.04)",
                color: "inherit",
                outline: "none",
                fontFamily:
                  "inherit",
              }}
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


        {/* =================================
            SIDEBAR
        ================================= */}

        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >

          {/* AI MODE */}

          <div className="question-card">

            <div className="eyebrow">
              TUTOR MODE
            </div>

            <h2>
              Conversation
            </h2>

            <p
              style={{
                opacity: 0.55,
                fontSize: "13px",
              }}
            >
              Ask questions naturally and
              practice Japanese.
            </p>

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "10px",
                background:
                  "rgba(124,92,255,.08)",
              }}
            >

              <strong>
                ✦ +5 XP
              </strong>

              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.55,
                  marginTop: "3px",
                }}
              >
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

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    "rgba(255,255,255,.04)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Try asking:
                <br />
                <strong>
                  "How do I introduce myself
                  in Japanese?"
                </strong>
              </div>

            )}

          </div>


          {/* MINI LESSONS */}

          <div className="question-card">

            <div className="eyebrow">
              QUICK PRACTICE
            </div>

            <h2>
              Useful Phrases
            </h2>

            <div
              style={{
                display: "grid",
                gap: "9px",
                marginTop: "15px",
              }}
            >

              {quickLessons.map(
                (lesson) => (

                  <button
                    key={lesson.title}
                    className="secondary-button"
                    onClick={() =>
                      sendMessage(
                        `Teach me ${lesson.title}`
                      )
                    }
                    style={{
                      textAlign: "left",
                      padding: "11px",
                    }}
                  >

                    <strong
                      style={{
                        display: "block",
                      }}
                    >
                      {lesson.japanese}
                    </strong>

                    <small
                      style={{
                        opacity: 0.5,
                      }}
                    >
                      {lesson.meaning}
                    </small>

                  </button>

                )
              )}

            </div>

          </div>

        </div>

      </div>


      {/* =================================
          FOOTER TIP
      ================================= */}

      <div
        className="path-tip"
        style={{
          marginTop: "20px",
        }}
      >

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