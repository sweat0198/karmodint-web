---
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/systematic-debugging/SKILL.md` using `view_file`

2. Announce: "I'm using the systematic-debugging skill to investigate this issue."

3. Follow the **Four Phases** exactly:
   - **Phase 1: Root Cause Investigation** — Read errors, reproduce, check recent changes, gather evidence, trace data flow. NO FIXES until this is complete.
   - **Phase 2: Pattern Analysis** — Find working examples, compare against references, identify differences.
   - **Phase 3: Hypothesis and Testing** — Form single hypothesis, test minimally, verify before continuing.
   - **Phase 4: Implementation** — Create failing test case, implement single fix, verify fix.

4. If 3+ fixes have failed, STOP and question the architecture with the user.

5. Also read supporting techniques in the same directory:
   - `root-cause-tracing.md` — Trace bugs backward through call stack
   - `defense-in-depth.md` — Add validation at multiple layers
   - `condition-based-waiting.md` — Replace arbitrary timeouts with condition polling
