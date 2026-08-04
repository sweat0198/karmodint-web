---
description: Use when about to claim work is complete, fixed, or passing - requires running verification commands before making any success claims
---

# Verification Before Completion

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/verification-before-completion/SKILL.md` using `view_file`

2. Before claiming ANY status (tests pass, build succeeds, bug fixed):
   - **IDENTIFY:** What command proves this claim?
   - **RUN:** Execute the FULL command (fresh, complete)
   - **READ:** Full output, check exit code, count failures
   - **VERIFY:** Does output confirm the claim?
   - **ONLY THEN:** Make the claim

3. Iron Law: **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

4. Red flags: Using "should", "probably", "seems to", or expressing satisfaction before verification.
