---
description: Use when implementing any feature or bugfix, before writing implementation code
---

# Test-Driven Development (TDD)

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/test-driven-development/SKILL.md` using `view_file`

2. Announce: "I'm using the test-driven-development skill."

3. Follow the **RED-GREEN-REFACTOR** cycle for every change:
   - **RED** — Write one minimal failing test. Run it. Verify it fails for the right reason.
   - **GREEN** — Write the simplest code to make the test pass. Run it. Verify it passes.
   - **REFACTOR** — Clean up. Keep tests green. Don't add new behavior.
   - **Repeat** for the next behavior.

4. Iron Law: **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

5. Also read `testing-anti-patterns.md` in the same directory when adding mocks or test utilities.
