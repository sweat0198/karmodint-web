# Solution Cover Imagery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate 12 product-faithful, review-only Solution cover images grounded in catalogue renders and real Gallery projects.

**Architecture:** Use Codex built-in image generation once per Solution. Feed one exact product render and one relevant Gallery photo as references, then validate product identity, feasibility, composition, and file properties before saving selected outputs.

**Tech Stack:** Codex built-in image generation, local PNG assets, `sips`, Graphify CLI

---

### Task 1: Prepare Review Manifest

**Files:**
- Create: `public/images/solutions/review/prompts.md`

**Step 1:** Record all 12 Solution slugs, intended scenes, product-reference paths, Gallery-reference paths, and shared constraints.

**Step 2:** Confirm no reference path points into `public/images/solutions/`.

**Step 3:** Confirm every product reference belongs to a product linked by the live Solution document.

### Task 2: Generate Product-Grounded Covers

**Files:**
- Create: `public/images/solutions/review/<solution-slug>-v2.png` for all 12 slugs

**Step 1:** Inspect each local product and Gallery reference before generation.

**Step 2:** Run one built-in image-generation request per Solution using the structured prompt in `prompts.md`.

**Step 3:** Save each selected result under its versioned review filename. Do not overwrite existing Solution assets.

### Task 3: Validate Deliverables

**Files:**
- Inspect: `public/images/solutions/review/*.png`

**Step 1:** Check file count, dimensions, and readable image metadata with `sips`.

**Step 2:** Visually inspect all 12 outputs for product fidelity, project feasibility, crop safety, text artifacts, and scene duplication.

**Step 3:** Regenerate only failed assets with one targeted correction per retry.

### Task 4: Refresh Project Graph

**Files:**
- Update: `graphify-out/`

**Step 1:** Run `graphify update .` after final files land.

**Step 2:** Verify Graphify indexes the prompt manifest and design records.
