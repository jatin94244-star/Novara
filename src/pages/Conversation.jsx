import React, { useEffect, useRef, useState } from "react";

const scenarios = [
  {
    id: "cafe",
    title: "Café",
    icon: "☕",
    description: "Order drinks and food naturally.",
    starter: "こんにちは。何を注文しますか？",
    english: "Hello. What would you like to order?",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    icon: "🍜",
    description: "Order a meal at a Japanese restaurant.",
    starter: "いらっしゃいませ。何名様ですか？",
    english: "Welcome. How many people are in your party?",
  },
  {
    id: "meeting",
    title: "Meeting Someone",
    icon: "🤝",
    description: "Meet someone and introduce yourself.",
    starter: "こんにちは。お名前は何ですか？",
    english: "Hello. What is your name?",
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: "🛍️",
    description: "Buy something in Japanese.",
    starter: "いらっしゃいませ。何をお探しですか？",
    english: "Welcome. What are you looking for?",
  },
  {
    id: "travel",
    title: "Travel",
    icon: "✈️",
    description: "Practice useful travel Japanese.",
    starter: "こんにちは。どこへ行きたいですか？",
    english: "Hello. Where would you like to go?",
  },
  {
    id: "hotel",
    title: "Hotel",
    icon: "🏨",
    description: "Check in and communicate at a hotel.",
    starter: "いらっしゃいませ。ご予約はありますか？",
    english: "Welcome. Do you have a reservation?",
  },
  {
    id: "airport",
    title: "Airport",
    icon: "🛫",
    description: "Handle common airport situations.",
    starter: "こんにちは。どちらへ行かれますか？",
    english: "Hello. Where are you traveling to?",
  },
  {
    id: "classroom",
    title: "Classroom",
    icon: "📚",
    description: "Talk with a teacher or student.",
    starter: "こんにちは。日本語の勉強はどうですか？",
    english: "Hello. How is your Japanese study going?",
  },
  {
    id: "interview",
    title: "Interview",
    icon: "💼",
    description: "Practice a Japanese interview.",
    starter: "では、自己紹介をお願いします。",
    english: "Alright, please introduce yourself.",
  },
  {
    id: "daily",
    title: "Daily Life",
    icon: "🌤️",
    description: "Have a natural everyday conversation.",
    starter: "こんにちは。今日は何をしていますか？",
    english: "Hello. What are you doing today?",
  },
];

function createStarter(scenario) {
  return {
    role: "assistant",
    content: scenario.starter,
    english: scenario.english,
    correction: null,
    tip: null,
    score: null,
    followUp: null,
  };
}

function getInitialStats() {
  return {
    messages: 0,
    totalScore: 0,
    scoredMessages: 0,
    xp: 0,
  };
}

export default function Conversation() {
  const [selectedScenario, setSelectedScenario] =
    useState(scenarios[0]);

  const [messages, setMessages] = useState([
    createStarter(scenarios[0]),
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showEnglish, setShowEnglish] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [stats, setStats] = useState(
    getInitialStats()
  );

  const [sessionFinished, setSessionFinished] =
    useState(false);

  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function changeScenario(scenario) {
    if (loading) return;

    setSelectedScenario(scenario);
    setMessages([createStarter(scenario)]);
    setInput("");
    setError("");
    setShowEnglish({});
    setCopiedIndex(null);
    setStats(getInitialStats());
    setSessionFinished(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  function clearConversation() {
    if (loading) return;

    setMessages([
      createStarter(selectedScenario),
    ]);

    setInput("");
    setError("");
    setShowEnglish({});
    setCopiedIndex(null);
    setStats(getInitialStats());
    setSessionFinished(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading || sessionFinished) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      content: text,
    };

    const historyForApi = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://novara-ruby.vercel.app/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: text,
            mode: "conversation",
            scenario: selectedScenario.title,
            messages: historyForApi,
          }),
        }
      );

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

      const reply =
        data.reply ||
        data.japanese ||
        "";

      if (!reply.trim()) {
        throw new Error(
          "Novara AI returned an empty response."
        );
      }

      const score =
        typeof data.score === "number"
          ? data.score
          : null;

      const assistantMessage = {
        role: "assistant",
        content: reply,
        english: data.english || "",
        correction: data.correction || null,
        tip: data.tip || null,
        score,
        followUp: data.followUp || null,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setStats((current) => {
        const scored =
          typeof score === "number";

        const newTotal =
          current.totalScore +
          (scored ? score : 0);

        const newScored =
          current.scoredMessages +
          (scored ? 1 : 0);

        const earnedXP =
          scored
            ? Math.max(
                5,
                Math.round(score / 5)
              )
            : 5;

        return {
          messages:
            current.messages + 1,

          totalScore: newTotal,

          scoredMessages: newScored,

          xp:
            current.xp + earnedXP,
        };
      });
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

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  function speak(text) {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      !text
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  }

  async function copyText(text, index) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1200);
    } catch {
      console.warn(
        "Clipboard unavailable."
      );
    }
  }

  function toggleEnglish(index) {
    setShowEnglish((current) => ({
      ...current,
      [index]: !current[index],
    }));
  }

  function finishSession() {
    if (loading) return;

    setSessionFinished(true);
  }

  const averageScore =
    stats.scoredMessages > 0
      ? Math.round(
          stats.totalScore /
            stats.scoredMessages
        )
      : 0;

  const progress = Math.min(
    100,
    Math.round(
      (stats.messages / 10) * 100
    )
  );

  return (
    <section className="page novara-conversation-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <div className="eyebrow">
            NOVARA AI CONVERSATION 2.0
          </div>

          <h1>
            Conversation
          </h1>

          <p>
            Practice real Japanese with
            contextual AI conversations.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* SESSION STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(130px,1fr))",
          gap: "10px",
          marginBottom: "16px",
        }}
      >

        <div className="result-card">
          <strong>
            {stats.messages}
          </strong>

          <span>
            Replies
          </span>
        </div>

        <div className="result-card">
          <strong>
            {averageScore || "—"}
          </strong>

          <span>
            Avg. Score
          </span>
        </div>

        <div className="result-card">
          <strong>
            +{stats.xp}
          </strong>

          <span>
            Session XP
          </span>
        </div>

      </div>


      {/* PROGRESS */}

      <div
        style={{
          marginBottom: "18px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            fontSize: "11px",
            opacity: 0.55,
            marginBottom: "6px",
          }}
        >
          <span>
            Conversation Progress
          </span>

          <span>
            {progress}%
          </span>
        </div>

        <div
          style={{
            height: "6px",
            borderRadius: "99px",
            background:
              "rgba(255,255,255,.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: "99px",
              background:
                "linear-gradient(90deg,#7c5cff,#00d4ff)",
              transition:
                "width .3s ease",
            }}
          />
        </div>

      </div>


      {/* SCENARIOS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >

        {scenarios.map((scenario) => {

          const active =
            selectedScenario.id ===
            scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              disabled={loading}
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
                flexShrink: 0,
              }}
            >
              {scenario.icon}{" "}
              {scenario.title}
            </button>
          );
        })}

      </div>


      {/* CURRENT SCENARIO */}

      <div
        className="question-card"
        style={{
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <div className="eyebrow">
            CURRENT SCENARIO
          </div>

          <h2
            style={{
              marginBottom: "5px",
            }}
          >
            {selectedScenario.icon}{" "}
            {selectedScenario.title}
          </h2>

          <p
            style={{
              opacity: 0.55,
              margin: 0,
            }}
          >
            {selectedScenario.description}
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >

          <button
            className="secondary-button"
            onClick={clearConversation}
            disabled={loading}
          >
            ↻ New Chat
          </button>

          <button
            className="secondary-button"
            onClick={finishSession}
            disabled={
              loading ||
              stats.messages === 0
            }
          >
            ✓ Finish
          </button>

        </div>

      </div>


      {/* CHAT */}

      <div
        className="question-card"
        style={{
          padding: "16px",
        }}
      >

        <div
          ref={chatRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "13px",
            minHeight: "390px",
            maxHeight: "58vh",
            overflowY: "auto",
            paddingRight: "3px",
          }}
        >

          {messages.map(
            (message, index) => {

              const isUser =
                message.role === "user";

              return (
                <div
                  key={`${index}-${message.content}`}
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
                      width:
                        isUser
                          ? "auto"
                          : "min(100%, 700px)",

                      maxWidth: "88%",

                      padding:
                        "13px 15px",

                      borderRadius:
                        "16px",

                      background:
                        isUser
                          ? "rgba(124,92,255,.15)"
                          : "rgba(255,255,255,.04)",

                      border:
                        isUser
                          ? "1px solid rgba(124,92,255,.25)"
                          : "1px solid rgba(255,255,255,.08)",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "10px",
                        opacity: 0.45,
                        marginBottom: "6px",
                        letterSpacing:
                          ".08em",
                      }}
                    >
                      {isUser
                        ? "YOU"
                        : "✦ NOVARA"}
                    </div>


                    <div
                      style={{
                        fontSize: "17px",
                        lineHeight: 1.7,
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {message.content}
                    </div>


                    {!isUser && (
                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap: "wrap",
                          marginTop: "10px",
                        }}
                      >

                        <button
                          className="secondary-button"
                          onClick={() =>
                            speak(
                              message.content
                            )
                          }
                          style={{
                            fontSize: "11px",
                            padding:
                              "5px 9px",
                          }}
                        >
                          🔊 Listen
                        </button>


                        <button
                          className="secondary-button"
                          onClick={() =>
                            copyText(
                              message.content,
                              index
                            )
                          }
                          style={{
                            fontSize: "11px",
                            padding:
                              "5px 9px",
                          }}
                        >
                          {copiedIndex ===
                          index
                            ? "✓ Copied"
                            : "Copy"}
                        </button>


                        {message.english && (
                          <button
                            className="secondary-button"
                            onClick={() =>
                              toggleEnglish(
                                index
                              )
                            }
                            style={{
                              fontSize:
                                "11px",
                              padding:
                                "5px 9px",
                            }}
                          >
                            🇬🇧{" "}
                            {showEnglish[
                              index
                            ]
                              ? "Hide"
                              : "English"}
                          </button>
                        )}

                      </div>
                    )}


                    {!isUser &&
                      message.english &&
                      showEnglish[index] && (
                        <div
                          style={{
                            marginTop: "10px",
                            padding: "11px",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,255,255,.035)",
                            fontSize: "13px",
                            lineHeight: 1.6,
                            opacity: 0.75,
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
                            padding: "11px",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(255,180,70,.08)",
                            border:
                              "1px solid rgba(255,180,70,.15)",
                            fontSize: "13px",
                            lineHeight: 1.6,
                          }}
                        >
                          ✏️{" "}
                          <strong>
                            Correction
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "3px",
                              opacity:
                                0.75,
                            }}
                          >
                            {
                              message.correction
                            }
                          </div>
                        </div>
                      )}


                    {!isUser &&
                      message.tip && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "10px",
                            borderRadius:
                              "10px",
                            background:
                              "rgba(124,92,255,.08)",
                            fontSize: "12px",
                            lineHeight: 1.6,
                          }}
                        >
                          💡{" "}
                          <strong>
                            Novara Tip
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "3px",
                              opacity:
                                0.7,
                            }}
                          >
                            {message.tip}
                          </div>
                        </div>
                      )}


                    {!isUser &&
                      typeof message.score ===
                        "number" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginTop:
                              "10px",
                            paddingTop:
                              "9px",
                            borderTop:
                              "1px solid rgba(255,255,255,.07)",
                            fontSize:
                              "11px",
                            opacity:
                              0.65,
                          }}
                        >
                          <span>
                            Japanese Score
                          </span>

                          <strong>
                            {message.score}/100
                          </strong>
                        </div>
                      )}

                  </div>

                </div>
              );
            }
          )}


          {/* TYPING */}

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
                  padding:
                    "13px 15px",
                  borderRadius:
                    "15px",
                  background:
                    "rgba(255,255,255,.04)",
                  opacity: 0.6,
                }}
              >
                🧠 Novara is thinking...
              </div>
            </div>
          )}

        </div>


        {/* SESSION COMPLETE */}

        {sessionFinished && (
          <div
            style={{
              marginTop: "14px",
              padding: "18px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg,rgba(124,92,255,.12),rgba(0,212,255,.07))",
              border:
                "1px solid rgba(124,92,255,.2)",
            }}
          >

            <div className="eyebrow">
              SESSION COMPLETE
            </div>

            <h2>
              🎉 Nice practice!
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,1fr)",
                gap: "10px",
                marginTop: "12px",
              }}
            >

              <div>
                <strong>
                  {stats.messages}
                </strong>

                <div
                  style={{
                    opacity: 0.5,
                    fontSize: "11px",
                  }}
                >
                  Replies
                </div>
              </div>

              <div>
                <strong>
                  {averageScore || "—"}
                </strong>

                <div
                  style={{
                    opacity: 0.5,
                    fontSize: "11px",
                  }}
                >
                  Score
                </div>
              </div>

              <div>
                <strong>
                  +{stats.xp} XP
                </strong>

                <div
                  style={{
                    opacity: 0.5,
                    fontSize: "11px",
                  }}
                >
                  Earned
                </div>
              </div>

            </div>

            <button
              className="primary-button"
              style={{
                marginTop: "15px",
              }}
              onClick={clearConversation}
            >
              Start Another Conversation →
            </button>

          </div>
        )}


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

              <button
                className="secondary-button"
                onClick={() =>
                  setError("")
                }
                style={{
                  fontSize: "11px",
                  padding: "5px 9px",
                }}
              >
                Dismiss
              </button>

            </div>

          </div>
        )}


        {/* INPUT */}

        {!sessionFinished && (
          <div
            style={{
              display: "flex",
              gap: "9px",
              marginTop: "14px",
              alignItems: "flex-end",
            }}
          >

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Type in Japanese, English or Hinglish..."
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
                fontFamily:
                  "inherit",
                boxSizing:
                  "border-box",
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
        )}


        {!sessionFinished && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              opacity: 0.4,
            }}
          >
            Enter to send · Shift + Enter
            for a new line
          </div>
        )}

      </div>

    </section>
  );
}