---
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Agents

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/dispatching-parallel-agents/SKILL.md` using `view_file`

2. Follow the pattern:
   - **Identify Independent Domains** — Group failures/tasks by what's broken
   - **Create Focused Agent Tasks** — Specific scope, clear goal, constraints, expected output
   - **Dispatch in Parallel** — One agent per independent problem domain
   - **Review and Integrate** — Read summaries, verify no conflicts, run full test suite

3. Don't use when failures are related, need full system context, or agents would interfere.
