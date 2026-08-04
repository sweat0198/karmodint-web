---
description: Use when building, design, create, implement, review, fix, improve, optimize, enhance, refactor, check UI/UX code
---

# UI/UX Pro Max - Design Intelligence

Read and follow the full skill instructions:

// turbo

1. Read the skill file at `~/.agents/skills/ui-ux-pro-max/SKILL.md` using `view_file`

2. Follow the **Intelligent Design Workflow**:
   - **Step 1: Analyze Requirements** — Product type, industry, style keywords, stack.
   - **Step 2: Generate Design System (REQUIRED)** — Always start with `--design-system`.
     ```bash
     python3 /Users/enesfurkanornek/.agents/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
     ```
   - **Step 2b: Persist Design System** — Add `--persist` and `--page` to save for hierarchical retrieval.
   - **Step 3: Detailed Searches** — Use `--domain [style|chart|ux|typography|landing]` for specific details.
   - **Step 4: Stack Guidelines** — Use `--stack [react|nextjs|svelte|tailwind|...]` for best practices.

3. **Pre-Delivery Checklist**:
   - Verify accessibility (contrast, touch targets, ARIA)
   - Check visual quality (no emojis for icons, consistent set, correct brand logos)
   - Ensure interaction quality (cursor-pointer, transition-colors duration-200)
   - Test light/dark mode visibility and contrast

4. **Iron Law**: Always generate a Design System before implementation to ensure consistency and reasoning.
