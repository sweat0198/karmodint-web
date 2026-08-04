---
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/writing-plans/SKILL.md` using `view_file`

2. Announce: "I'm using the writing-plans skill to create the implementation plan."

3. Write a comprehensive plan with bite-sized tasks (2-5 minutes each):
   - Each task follows RED-GREEN-REFACTOR: write failing test → verify fail → implement → verify pass → commit
   - Include exact file paths, complete code, exact commands with expected output
   - Save to `docs/plans/YYYY-MM-DD-<feature-name>.md`

4. After saving the plan, offer execution choice:
   - **Subagent-Driven** (this session) — use `/subagent-driven-development`
   - **Batch execution** — use `/executing-plans`
