import React, { useState } from "react";

const examples = [
  "私は学生です。",
  "コーヒーをください。",
  "これは何ですか？",
  "日本語を勉強します。",
];

export default function Grammar() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function checkGrammar() {
    if (!input.trim() || checking) {
      return;
    }

    setChecking(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: input.trim(),
            mode: "grammar",
            scenario:
              "Japanese Grammar Checker",
            messages: [],
          }),
        }
      );

      const raw =
        await response.text();

      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          raw ||
            "The server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        data.ok === false
      ) {
        throw new Error(
          data.error ||
            "Grammar AI request failed."
        );
      }

      const score =
        typeof data.score === "number"
          ? data.score
          : 0;

      const correction =
        data.correction ||
        data.reply ||
        input.trim();

      const meaning =
        data.english ||
        "No English explanation was provided.";

      const grammar =
        data.tip ||
        data.english ||
        "Novara could not provide a detailed explanation.";

      let status =
        "Needs Review";

      if (score >= 90) {
        status = "Excellent";
      } else if (score >= 75) {
        status = "Good";
      } else if (score >= 50) {
        status = "Needs Practice";
      } else {
        status = "Needs Correction";
      }

      let level =
        "Japanese";

      if (
        input.trim().length <= 10
      ) {
        level = "Beginner";
      } else if (
        input.trim().length <= 25
      ) {
        level = "Elementary";
      } else {
        level = "Intermediate";
      }

      setResult({
        score,
        level,
        status,
        category: "Grammar",
        correction,
        meaning,
        grammar,
        tip:
          data.tip ||
          "Keep practicing natural Japanese sentence patterns.",
      });
    } catch (error) {
      console.error(
        "Novara Grammar Error:",
        error
      );

      setError(
        error.message ||
          "Sorry. I couldn't connect to the AI server."
      );
    } finally {
      setChecking(false);
    }
  }

  function useExample(example) {
    setInput(example);
    setResult(null);
    setError("");
  }

  function clearAll() {
    setInput("");
    setResult(null);
    setError("");
  }

  return (
    <section className="page">

      <div className="page-header">

        <div>
          <div className="eyebrow">
            NOVARA LANGUAGE ENGINE
          </div>

          <h1>
            Grammar Checker
          </h1>

          <p>
            Let Novara analyze your Japanese
            sentence with AI.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      <div
        className="question-card"
        style={{
          marginBottom: "18px",
        }}
      >

        <div className="eyebrow">
          WRITE A SENTENCE
        </div>

        <h2>
          What do you want to check?
        </h2>

        <textarea
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.ctrlKey &&
              event.key === "Enter"
            ) {
              checkGrammar();
            }
          }}
          placeholder="例：私は学生です。"
          rows={5}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "15px",
            resize: "vertical",
            borderRadius: "13px",
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.035)",
            color: "inherit",
            outline: "none",
            fontSize: "18px",
            lineHeight: 1.6,
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />


        <div
          style={{
            display: "flex",
            gap: "7px",
            overflowX: "auto",
            marginTop: "10px",
          }}
        >

          {examples.map((example) => (
            <button
              key={example}
              className="secondary-button"
              onClick={() =>
                useExample(example)
              }
              style={{
                whiteSpace:
                  "nowrap",
                fontSize: "11px",
                padding:
                  "7px 10px",
              }}
            >
              {example}
            </button>
          ))}

        </div>


        <div
          style={{
            display: "flex",
            gap: "9px",
            marginTop: "14px",
          }}
        >

          <button
            className="primary-button"
            onClick={checkGrammar}
            disabled={
              !input.trim() ||
              checking
            }
          >
            {checking
              ? "Analyzing..."
              : "Check Grammar →"}
          </button>

          <button
            className="secondary-button"
            onClick={clearAll}
          >
            Clear
          </button>

        </div>

      </div>


      {error && (
        <div
          className="path-tip"
          style={{
            marginBottom: "18px",
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


      {checking && (
        <div
          className="question-card"
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >

          <div
            style={{
              fontSize: "32px",
            }}
          >
            🧠
          </div>

          <h3>
            Novara is analyzing...
          </h3>

          <p
            style={{
              opacity: 0.5,
            }}
          >
            Checking Japanese grammar,
            particles and sentence structure.
          </p>

        </div>
      )}


      {result &&
        !checking && (
          <div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(160px,1fr))",
                gap: "12px",
                marginBottom: "18px",
              }}
            >

              <div className="result-card">
                <strong>
                  {result.score}
                </strong>

                <span>
                  Grammar Score
                </span>
              </div>


              <div className="result-card">
                <strong>
                  {result.level}
                </strong>

                <span>
                  Level
                </span>
              </div>


              <div className="result-card">
                <strong>
                  {result.status}
                </strong>

                <span>
                  Status
                </span>
              </div>


              <div className="result-card">
                <strong>
                  {result.category}
                </strong>

                <span>
                  Category
                </span>
              </div>

            </div>


            <div
              className="question-card"
              style={{
                marginBottom: "14px",
              }}
            >

              <div className="eyebrow">
                NOVARA ANALYSIS
              </div>

              <h2>
                Your sentence
              </h2>


              <div
                style={{
                  marginTop: "14px",
                  padding: "16px",
                  borderRadius: "13px",
                  background:
                    "rgba(255,255,255,.035)",
                  fontSize: "21px",
                  lineHeight: 1.6,
                }}
              >
                {input}
              </div>


              <h3
                style={{
                  marginTop: "20px",
                  marginBottom: "8px",
                }}
              >
                Correct / Recommended
              </h3>


              <div
                style={{
                  padding: "16px",
                  borderRadius: "13px",
                  background:
                    "rgba(124,92,255,.10)",
                  border:
                    "1px solid rgba(124,92,255,.22)",
                  fontSize: "21px",
                  lineHeight: 1.6,
                }}
              >
                {result.correction}
              </div>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: "14px",
              }}
            >

              <div className="question-card">

                <div className="eyebrow">
                  MEANING
                </div>

                <h3>
                  🇬🇧 English
                </h3>

                <p
                  style={{
                    opacity: 0.72,
                    lineHeight: 1.7,
                  }}
                >
                  {result.meaning}
                </p>

              </div>


              <div className="question-card">

                <div className="eyebrow">
                  GRAMMAR
                </div>

                <h3>
                  🧠 Why?
                </h3>

                <p
                  style={{
                    opacity: 0.72,
                    lineHeight: 1.7,
                  }}
                >
                  {result.grammar}
                </p>

              </div>

            </div>


            <div
              className="path-tip"
              style={{
                marginTop: "14px",
              }}
            >

              <span>💡</span>

              <div>

                <strong>
                  Novara Tip
                </strong>

                <p>
                  {result.tip}
                </p>

              </div>

            </div>

          </div>
        )}

    </section>
  );
}