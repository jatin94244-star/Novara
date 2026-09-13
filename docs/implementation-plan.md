# Novara implementation plan

## Phase 1 — foundation
- React/Vite shell
- design tokens
- responsive navigation
- local mock store
- mock AI service

## Phase 2 — identity
- real authentication
- profile model
- onboarding state
- target-language selection
- optional placement test

## Phase 3 — learner model
Track vocabulary, grammar, listening, reading, writing, speaking, response speed, repeated mistakes, weak topics, confidence, consistency and frequency.

## Phase 4 — learning engine
- courses/units/lessons
- exercise engine
- answer evaluation
- dynamic recommendations

## Phase 5 — memory engine
Use a proven spaced-repetition algorithm rather than arbitrary intervals. Persist mastery, difficulty, stability, history and next review.

## Phase 6 — AI
Server-side AI gateway implementing:
- generateExercise
- checkAnswer
- explainGrammar
- analyzeWriting
- generateConversation
- evaluateConversation
- generateLesson
- generateVocabulary
- personalizePractice

## Phase 7 — voice
Browser speech APIs for MVP; real pronunciation scoring through a dedicated provider later. Never show generated scores as real unless analysis actually happened.

## Phase 8 — production
PostgreSQL, API server, authentication, authorization, validation, rate limiting, observability, tests, CI/CD and deployment.

## Definition of done
- no broken routes/imports
- no console errors
- mobile and desktop responsive
- interactive lessons
- persistent progress
- real backend integration
- real AI provider behind service boundary
- real speech analysis
- accessibility checks
- performance checks
- automated tests
