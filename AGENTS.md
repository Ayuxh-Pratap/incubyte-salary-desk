# Salary Desk engineering rules

Read REQUIREMENTS.md, docs/ENGINEERING.md and docs/DELIVERY.md before changes. The assessment scope is user-approved but pending external clarification; never label it employer-approved. No product LLM or speculative services.

Money is exact, currency/period aware, string-serialized and tested before implementation. Shared filters govern bounded list queries and full-population statistics. All data APIs enforce evaluator access; mutations validate origin. Never bypass access in development or tests; tests authenticate deliberately.

Use independent hosted development/test/demo databases. Integration tests must fail closed without an explicitly isolated test connection. Never seed on build/request or overwrite edits during normal seeding. No secrets, source email, resume, tailoring notes or private correspondence in Git.

Use semantic Tailwind roles and shared Base UI/shadcn primitives; DESIGN.md documents CSS and a check detects drift. Do not copy the Job Desk application wholesale.

For consequential behavior, run a failing test before implementation. Record actual AI decisions and verification in docs/AI_COLLABORATION.md. Commit coherent milestones after inspecting staged paths/diff; no fabricated test-first sequence or history. Keep the app runnable and docs truthful. Do not publish, purchase, email or submit without explicit scope authorization.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
