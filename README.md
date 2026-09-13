# NOVARA

Premium AI-first language learning platform starter.

## Stack
- React + Vite
- Modular feature/page architecture
- Local mock data and mock AI service
- localStorage progress persistence
- Responsive desktop/mobile UI
- Lucide icons

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL.

## Architecture

- `src/pages` — product screens
- `src/components` — reusable UI
- `src/services` — AI/API abstraction
- `src/store` — local learner state
- `src/data` — starter content

## Production roadmap

1. Authentication + database
2. PostgreSQL schema/API
3. Real AI provider behind `AIService`
4. Speech recognition + pronunciation provider
5. Server-side auth, validation and rate limiting
6. Real adaptive placement engine
7. SM-2/FSRS-style review scheduling
8. Automated tests and CI
9. Analytics event pipeline
10. Production deployment

The current AI and speech screens explicitly run in demo/mock mode; they do not claim to perform real AI analysis.