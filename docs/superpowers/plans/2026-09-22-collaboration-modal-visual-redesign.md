# Collaboration Modal Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the collaboration dialog around the Figma sharing-modal hierarchy while retaining the existing teacher-picker behavior and brand-green accent.

**Architecture:** Keep the existing vanilla JavaScript dialog and state model. Make one small markup change for the access-list heading and permission helper placement, then replace the collaboration CSS with a single coherent visual layer instead of accumulated overrides.

**Tech Stack:** Vanilla JavaScript, CSS, native HTML dialog.

---

### Task 1: Align dialog semantics with the sharing-modal structure

**Files:**
- Modify: `collaboration.js`

- [ ] Change the member-section label from `协作成员` to `有权访问` while retaining `co-count`.
- [ ] Keep all existing IDs and event handlers used by the picker, permission selector, add button, members list, and copy-link button.
- [ ] Run `node --check collaboration.js` and expect exit code 0.

### Task 2: Replace nested-card styling with Figma-style hierarchy

**Files:**
- Modify: `collaboration.css`

- [ ] Reduce the dialog to a 560px white container with 14px outer radius and one restrained tinted shadow.
- [ ] Remove the invite panel background, border, and card radius; use spacing and a single section divider.
- [ ] Keep the search field as the dominant control with an 8px radius, neutral border, and restrained green focus ring.
- [ ] Arrange permission and add controls as a compact adjacent action group; stack safely under 520px.
- [ ] Restyle selected chips as thin neutral tags and keep their remove controls accessible.

### Task 3: Restyle the picker popover and people list

**Files:**
- Modify: `collaboration.css`

- [ ] Render the two batch actions as equal-width flat text actions separated by one vertical divider.
- [ ] Use white candidate rows with 6px row radius, subtle hover, and only a very pale selected background.
- [ ] Keep the checkbox as the primary selected-state signal and use the brand green only there.
- [ ] Use low-contrast dividers for the selection footer and existing-member rows.
- [ ] Keep the copy-link footer visually secondary and aligned to the right.

### Task 4: Visual and interaction verification

**Files:**
- Verify: `workbench.html`, `collaboration.js`, `collaboration.css`

- [ ] Run `node --check collaboration.js` and `git diff --check`.
- [ ] Open `workbench.html#collaboration` in the browser and capture the collapsed state.
- [ ] Open the picker and verify batch actions, candidate rows, selection footer, scrolling, and clipping.
- [ ] Select individuals and both batch groups; verify selected styling stays restrained and all interaction logic remains unchanged.
- [ ] Change permission, add members, reopen the picker, and verify joined members and member-list styling.
- [ ] Verify desktop and narrow viewport layouts do not overflow.
