import React, { useState } from "react";

const scenarios = [
  {
    id: "cafe",
    title: "Café",
    icon: "☕",
    description: "Order food and drinks in Japanese.",
    starter: "こんにちは。何を注文しますか？",
  },
  {
    id: "meeting",
    title: "Meeting Someone",
    icon: "🤝",
    description: "Introduce yourself and meet someone.",
    starter: "こんにちは。お名前は何ですか？",
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: "🛍️",
    description: "Practice shopping conversations.",
    starter: "いらっしゃいませ。何をお探しですか？",
  },
  {
    id: "travel",
    title: "Travel",
    icon: "✈️",
    description: "Practice useful travel Japanese.",
    starter: "こんにちは。どこへ行きたいですか？",
  },
];

export default function Conversation() {
  const [selectedScenario, setSelectedScenario] =
    useState(scenarios[0]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: scenarios[0].starter,
      english: "Hello. What would you like to order?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function changeScenario(scenario) {
    setSelectedScenario(scenario);

    setMessages([
      {
        role: "assistant",
        content: scenario.starter,
        english:
          scenario.id === "cafe"
            ? "Hello. What would you like to order?"
            : scenario.id === "meeting"
            ? "Hello. What is your name?"
            : scenario.id === "shopping"
            ? "Welcome. What are you looking for?"
            : "Hello. Where would you like to go?",
      },
    ]);

    setInput("");
    setError("");
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      content: text,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
          mode: "conversation",
          scenario: selectedScenario.title,
          messages: messages.slice(-10),
        }),
      });

      const raw = await response.text();

      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          raw ||
            "The server returned an invalid response."
        );
      }

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error ||
            "Novara AI request failed."
        );
      }

      const assistantMessage = {
        role: "assistant",
        content:
          data.reply ||
          data.japanese ||
          "すみません。もう一度試してください。",
        english:
          data.english || "",
        correction:
          data.correction || null,
        tip:
          data.tip || null,
        score:
          typeof data.score === "number"
            ? data.score
            : null,
        followUp:
          data.followUp || null,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(
        "Novara Conversation Error:",
        err
      );

      setError(
        err.message ||
          "Sorry, I couldn't connect to Novara AI."
      );
    } finally {
      setLoading(false);
    }
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

  function speak(text) {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";
    utterance.rate = 0.9;

    window.speechSynthesis.speak(
      utterance
    );
  }

  return (
    <section className="page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            NOVARA AI CONVERSATION
          </div>

          <h1>
            Conversation
          </h1>

          <p>
            Practice real Japanese conversations
            with Novara AI.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* SCENARIOS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "6px",
          marginBottom: "18px",
        }}
      >

        {scenarios.map((scenario) => {

          const active =
            selectedScenario.id ===
            scenario.id;

          return (
            <button
              key={scenario.id}
              onClick={() =>
                changeScenario(scenario)
              }
              className={
                active
                  ? "primary-button"
                  : "secondary-button"
              }
              style={{
                minWidth: "145px",
                textAlign: "left",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  marginRight: "6px",
                }}
              >
                {scenario.icon}
              </span>

              {scenario.title}
            </button>
          );
        })}

      </div>


      {/* SCENARIO INFO */}

      <div
        className="question-card"
        style={{
          marginBottom: "16px",
        }}
      >

        <div className="eyebrow">
          CURRENT SCENARIO
        </div>

        <h2>
          {selectedScenario.icon}{" "}
          {selectedScenario.title}
        </h2>

        <p
          style={{
            opacity: 0.65,
            marginBottom: 0,
          }}
        >
          {selectedScenario.description}
        </p>

      </div>


      {/* CHAT */}

      <div
        className="question-card"
        style={{
          padding: "16px",
        }}
      >

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: "360px",
            maxHeight: "58vh",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >

          {messages.map(
            (message, index) => {

              const isUser =
                message.role === "user";

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      isUser
                        ? "flex-end"
                        : "flex-start",
                  }}
                >

                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "13px 15px",
                      borderRadius: "15px",
                      background: isUser
                        ? "rgba(124,92,255,.16)"
                        : "rgba(255,255,255,.045)",
                      border: isUser
                        ? "1px solid rgba(124,92,255,.25)"
                        : "1px solid rgba(255,255,255,.08)",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "17px",
                        lineHeight: 1.65,
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {message.content}
                    </div>


                    {!isUser &&
                      message.english && (
                        <div
                          style={{
                            marginTop: "9px",
                            paddingTop: "9px",
                            borderTop:
                              "1px solid rgba(255,255,255,.07)",
                            fontSize: "13px",
                            opacity: 0.6,
                            lineHeight: 1.5,
                          }}
                        >
                          🇬🇧{" "}
                          {message.english}
                        </div>
                      )}


                    {!isUser &&
                      message.correction && (
                        <div
                          style={{
                            marginTop: "10px",
                            fontSize: "13px",
                            opacity: 0.75,
                          }}
                        >
                          ✏️{" "}
                          {message.correction}
                        </div>
                      )}


                    {!isUser &&
                      message.tip && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            opacity: 0.6,
                          }}
                        >
                          💡 {message.tip}
                        </div>
                      )}


                    {!isUser && (
                      <button
                        onClick={() =>
                          speak(
                            message.content
                          )
                        }
                        className="secondary-button"
                        style={{
                          marginTop: "10px",
                          padding:
                            "5px 9px",
                          fontSize: "11px",
                        }}
                      >
                        🔊 Listen
                      </button>
                    )}

                  </div>

                </div>
              );
            }
          )}


          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-start",
              }}
            >
              <div
                style={{
                  padding: "13px 15px",
                  borderRadius: "15px",
                  background:
                    "rgba(255,255,255,.045)",
                  opacity: 0.65,
                }}
              >
                🧠 Novara is thinking...
              </div>
            </div>
          )}

        </div>


        {/* ERROR */}

        {error && (
          <div
            className="path-tip"
            style={{
              marginTop: "14px",
            }}
          >
            <span>⚠️</span>

            <div>
              <strong>
                AI Connection Error
              </strong>

              <p>
                {error}
              </p>
            </div>
          </div>
        )}


        {/* INPUT */}

        <div
          style={{
            display: "flex",
            gap: "9px",
            marginTop: "14px",
            alignItems: "flex-end",
          }}
        >

          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="日本語で話してみてください..."
            rows={2}
            disabled={loading}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px",
              resize: "none",
              borderRadius: "13px",
              border:
                "1px solid rgba(255,255,255,.1)",
              background:
                "rgba(255,255,255,.035)",
              color: "inherit",
              outline: "none",
              fontSize: "16px",
              lineHeight: 1.5,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          <button
            className="primary-button"
            onClick={sendMessage}
            disabled={
              !input.trim() ||
              loading
            }
            style={{
              flexShrink: 0,
            }}
          >
            {loading
              ? "..."
              : "Send →"}
          </button>

        </div>


        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            opacity: 0.4,
          }}
        >
          Press Enter to send · Shift + Enter
          for a new line
        </div>

      </div>

    </section>
  );
}