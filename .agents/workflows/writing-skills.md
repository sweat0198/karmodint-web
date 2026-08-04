---
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/writing-skills/SKILL.md` using `view_file`

2. Follow TDD for skill creation:
   - **RED:** Run pressure scenarios WITHOUT the skill, document baseline behavior
   - **GREEN:** Write minimal SKILL.md addressing specific failures
   - **REFACTOR:** Close loopholes, add rationalization counters, re-test

3. SKILL.md structure: YAML frontmatter (name + description), Overview, When to Use, Core Pattern, Quick Reference, Common Mistakes.

4. Save skills to `~/.agents/skills/superpowers/<skill-name>/SKILL.md`.
