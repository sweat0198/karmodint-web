# Solution Selection 21:9 Outpaint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create non-destructive 21:9 outpaints for all 11 16:9 solution-selection PNGs.

**Architecture:** Generate scene-aware left/right extensions from each source, normalize each generated backdrop to its target canvas, then composite the untouched source into the exact center. Verify canvas dimensions, source checksums, and pixel identity of every centered source rectangle.

**Tech Stack:** Built-in image generation, ImageMagick, shell verification, Git.

---

### Task 1: Capture source manifest and invariants

**Files:**
- Read: `public/images/solutions/selection/*.png`

**Step 1: Record source dimensions and checksums**

Run `magick identify` and `shasum -a 256` across the 11 sources.

**Step 2: Calculate target dimensions and offsets**

Use `2016x864` with x offset 240 for ten exact sources; use `2196x941` with x offset 262 for the garden source.

### Task 2: Generate scene extensions

**Files:**
- Create: `public/images/solutions/selection/*-21x9-generated.png`

**Step 1: Inspect source imagery**

Create and inspect a contact sheet to understand edge geometry, perspective, lighting, and backdrop content.

**Step 2: Run one image edit per source**

Prompt each edit to continue only background context left and right, preserve the center, avoid text/logos/people/vehicles/new cabins, and produce a wide 21:9 scene.

**Step 3: Inspect generated backdrops**

Reject outputs with incoherent seams, inconsistent geometry, or intrusive new foreground objects.

### Task 3: Guarantee immutable source centers

**Files:**
- Create: `public/images/solutions/selection/*-21x9.png`
- Delete after verification: `public/images/solutions/selection/*-21x9-generated.png`

**Step 1: Normalize generated backdrops**

Resize/crop only generated backdrops to their target canvases.

**Step 2: Composite original sources**

Place each unchanged source at the exact horizontal center and y=0.

**Step 3: Remove intermediate generated backdrops**

Keep only final project assets.

### Task 4: Verify deliverables

**Files:**
- Test: `public/images/solutions/selection/*-21x9.png`

**Step 1: Verify output count and dimensions**

Expected: 11 output files; ten at `2016x864`, one at `2196x941`.

**Step 2: Verify centered source pixels**

Crop the centered source rectangle from every output and compare pixels with the source using ImageMagick. Expected absolute error: `0`.

**Step 3: Verify source checksums**

Compare current checksums to Task 1. Expected: unchanged.

**Step 4: Inspect final contact sheet**

Confirm coherent scene continuation on both sides and untouched original frames.

### Task 5: Review and commit

**Files:**
- Review: all new plans and final PNGs

**Step 1: Review against repository standards and approved design**

Check non-destructive naming, correct scope, forbidden changes, dimensions, and pixel identity.

**Step 2: Run final verification**

Repeat all invariant checks from Task 4 immediately before commit.

**Step 3: Commit**

```bash
git add docs/plans/2026-09-23-solution-selection-21x9-outpaint-design.md \
  docs/plans/2026-09-23-solution-selection-21x9-outpaint.md \
  public/images/solutions/selection/*-21x9.png
git commit -m "feat: add 21x9 solution imagery"
```
