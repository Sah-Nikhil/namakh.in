# AGENTS.md

## Task Completion Requirements

- Both `pnpm lint` and `pnpm typecheck` must pass before considering tasks completed.
- There is no `pnpm fmt` — no formatter is installed. Match surrounding style by hand.
- There is no test suite and no test runner. Don't invent a test command.

## Read first

- `CLAUDE.md` — stack, commands, structure, conventions, gotchas.
- `CONTEXT.md` — domain vocabulary. Use those terms exactly; they have "avoid" lists.

## Project Snapshot

namakh is the marketing site for Namakh.in's electrolyte products, intended to grow
into an e-commerce store.

Today it is marketing-only: two hardcoded products, no cart, no checkout, no backend,
no auth. `razorpay` is installed but has zero importers.

This repository is a VERY EARLY WIP. Proposing sweeping changes that improve long-term maintainability is encouraged.

## Core Priorities

1. Performance first.
2. Reliability first.
3. Keep behavior predictable under load and during failures (session restarts, reconnects, partial streams).

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.
