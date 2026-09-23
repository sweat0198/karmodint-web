# Car Park Lane Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Produce a corrected 21:9 car-park image whose left-lane vehicles and road markings form one coherent entrance path toward the left barrier.

**Architecture:** Use a constrained image edit with the existing PNG as the edit target. Preserve all scene elements outside the left entrance lane, validate geometry and dimensions, then replace the source asset while retaining a recoverable original copy during generation.

**Tech Stack:** Built-in image generation/editing, PNG inspection, ImageMagick metadata checks when available.

---

### Task 1: Generate corrected candidate

**Files:**
- Read: `public/images/solutions/selection/21x9/car-park-valet-and-weighbridge-cabins.png`
- Create: `public/images/solutions/selection/21x9/car-park-valet-and-weighbridge-cabins-aligned.png`

**Step 1:** Edit source with high-fidelity constraints: align vehicles inside left entrance lane; redraw affected dashed markings and arrow toward left barrier; preserve all other pixels conceptually.

**Step 2:** Save generated candidate at exact project path.

### Task 2: Validate candidate

**Files:**
- Inspect: `public/images/solutions/selection/21x9/car-park-valet-and-weighbridge-cabins-aligned.png`

**Step 1:** Visually verify cars, arrow, dashed lines, barrier, and common vanishing point.

**Step 2:** Verify no cabin/barrier/building/landscaping drift, duplicates, text, or watermark.

**Step 3:** Compare source and candidate dimensions; expected identical 21:9 dimensions.

### Task 3: Promote corrected asset

**Files:**
- Modify: `public/images/solutions/selection/21x9/car-park-valet-and-weighbridge-cabins.png`
- Remove after promotion: `public/images/solutions/selection/21x9/car-park-valet-and-weighbridge-cabins-aligned.png`

**Step 1:** Replace source with validated candidate.

**Step 2:** Reinspect promoted file and verify dimensions.

**Step 3:** Run `git diff --stat` and confirm only intended asset and plan files changed.
