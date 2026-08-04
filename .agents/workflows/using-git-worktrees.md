---
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans
---

# Using Git Worktrees

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/superpowers/using-git-worktrees/SKILL.md` using `view_file`

2. Announce: "I'm using the using-git-worktrees skill to set up an isolated workspace."

3. Follow directory selection priority: existing `.worktrees/` or `worktrees/` → project config → ask user.

4. Verify project-local directories are git-ignored before creating worktree.

5. After creation: run project setup (auto-detect from package.json/Cargo.toml etc.), verify clean test baseline.

6. Pairs with `/finishing-a-development-branch` for cleanup.
