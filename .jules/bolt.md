# Bolt's Journal ⚡

This journal is for CRITICAL learnings only.

## 2025-01-31 - [Avoid DOMPurify in render loops]
**Learning:** Calling `DOMPurify.sanitize` inside a React render loop (especially for lists/tables) is extremely expensive and often unnecessary if the data is already trusted or if React's standard text rendering can be used instead of `dangerouslySetInnerHTML`.
**Action:** Always prefer standard JSX `{text}` over `dangerouslySetInnerHTML`. If HTML rendering is required, sanitize the data ONCE when loading from storage or an API, rather than on every render.
