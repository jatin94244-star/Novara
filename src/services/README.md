# Service boundary

Keep provider-specific code out of React components.

`AIService.js` is the stable application-facing interface.

Production implementations should replace `mockAI` behind this boundary and keep API keys server-side.