# SchoolRecon Gemini Instructions

## Required context

Before implementation:
1. Read docs/PROJECT.md.
2. Read docs/CURRENT_STATUS.md.
3. Read the relevant section of docs/ARCHITECTURE.md.
4. Read relevant API/database/security documentation only when needed.

## Existing-project rule

This is an existing SchoolRecon application.

Never create a replacement application unless explicitly instructed.

Reuse the existing:
- React 18 frontend
- TypeScript
- Tailwind
- ASP.NET Core architecture
- SQL Server
- existing routes/components/services

## Implementation truthfulness

Every feature must be classified as:
- UI_ONLY
- MOCKED
- IMPLEMENTED
- TESTED
- LIVE_VERIFIED

Never describe MOCKED functionality as implemented.
Never mark PASS without executing the relevant test.

## Architecture

Frontend:
React + TypeScript + Tailwind

Backend:
ASP.NET Core

Database:
SQL Server

Browser automation:
Playwright

Realtime:
SignalR

Queue:
RabbitMQ

## Vendor automation

Normal vendor collection must use deterministic Playwright workflows.

AI may investigate unexpected portal changes.

AI must not autonomously:
- alter financial records
- approve reconciliation
- change credentials
- modify production connector rules
- perform financial adjustments

## Security

Never:
- expose vendor passwords to React
- store passwords in localStorage
- log passwords
- commit credentials
- include passwords in screenshots

## Completion protocol

After every task:
1. Run relevant tests.
2. Update CURRENT_STATUS.md.
3. Update TEST_RESULTS.md.
4. Record architecture changes in DECISIONS.md when applicable.
5. Report files changed.
6. Report remaining limitations.

Do not modify unrelated code.
