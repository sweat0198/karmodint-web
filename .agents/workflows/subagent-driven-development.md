---
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/subagent-driven-development/SKILL.md` using `view_file`

2. Also read the prompt templates in the same directory:
   - `implementer-prompt.md`
   - `spec-reviewer-prompt.md`
   - `code-quality-reviewer-prompt.md`

3. Follow the process:
   - Read plan, extract all tasks with full text, create task list
   - For each task: dispatch implementer → spec compliance review → code quality review
   - Fix issues between review stages; re-review until approved
   - After all tasks: final code review → use `/finishing-a-development-branch`

4. Never skip reviews (spec compliance OR code quality). Never start code quality review before spec compliance passes.
