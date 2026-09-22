# Teacher Picker Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the nested, layout-expanding teacher selector with one compact searchable multi-picker while preserving whole-school and same-subject batch selection.

**Architecture:** Keep the existing self-contained `collaboration.js` dialog and localStorage state model. Change only the picker markup/event wiring and its CSS: the search input becomes the primary field, selected chips live inside it, and the existing candidate list becomes an absolutely positioned popover. Existing selection, group eligibility, permission, member rendering, and persistence functions remain the source of truth.

**Tech Stack:** Vanilla JavaScript, HTML dialog markup generated in JavaScript, CSS, browser localStorage.

---

### Task 1: Convert the picker markup and behavior

**Files:**
- Modify: `collaboration.js:13-71`

- [ ] **Step 1: Replace the nested toggle/search markup**

Use one field containing the chips and input, followed by an initially hidden popover. Keep existing IDs for results and group actions where practical:

```html
<div class="co-picker" id="co-picker">
  <div class="co-picker-field" id="co-picker-field" role="combobox" aria-expanded="false" aria-controls="co-picker-popover" aria-haspopup="listbox">
    <div id="co-selected" class="co-selected"></div>
    <input id="co-search" placeholder="搜索姓名" aria-label="搜索老师" autocomplete="off" aria-controls="co-results">
    <svg class="co-picker-chevron" aria-hidden="true">...</svg>
  </div>
  <div id="co-picker-popover" class="co-picker-popover" hidden>
    <div class="co-quick" role="group" aria-label="批量选择老师">...</div>
    <div id="co-results" class="co-results" role="listbox" aria-multiselectable="true"></div>
    <div class="co-picker-footer">...</div>
  </div>
</div>
```

- [ ] **Step 2: Make the input the sole open/close controller**

Update `setPicker` so it sets `aria-expanded` on `co-picker-field`, refreshes groups/results on open, and focuses `co-search` only when requested. Open on input focus and field click; remove `co-picker-toggle` and `co-picker-done` handlers. Preserve dialog Escape interception and outside-click close.

- [ ] **Step 3: Preserve and clarify selection state**

In `renderSelection`, render removable chips, update `co-selection-count`, `co-clear`, batch button state, and `co-add`. Do not update a separate placeholder or pending hint. Keep the button label as `添加 N 位老师`.

- [ ] **Step 4: Keep batch selection reversible**

Retain `eligibleGroup`, `updateGroups`, and `selectGroup`. The group buttons must report `aria-pressed`, display their eligible counts, add all eligible teachers when partially/unselected, and remove the group when fully selected.

- [ ] **Step 5: Verify JavaScript syntax**

Run: `node --check collaboration.js`

Expected: exit code 0 with no output.

### Task 2: Restyle the picker as a compact popover

**Files:**
- Modify: `collaboration.css:1-32`

- [ ] **Step 1: Remove obsolete duplicate picker rules**

Delete rules for `.co-search` as a separate block, `#co-picker-toggle`, `#co-picker-done`, `.co-pending-hint`, and the later override that changes `.co-picker-popover` back to relative positioning.

- [ ] **Step 2: Style the unified field**

Use a minimum 46px field with wrapping chips, an unbordered flexible search input, and a chevron that rotates while `aria-expanded="true"`. Keep a 120px maximum field height with internal scrolling for many chips.

- [ ] **Step 3: Style the floating candidate panel**

Position `.co-picker-popover` absolutely below the field with a higher stacking context, border, rounded corners, and shadow. Keep the candidate list at a fixed maximum height with its own scrolling so the dialog body does not grow.

- [ ] **Step 4: Differentiate batch actions from filters**

Prefix the quick-action area with `批量选择`, retain count labels and selected/partial states, and keep these actions visually separate from candidate rows with a divider.

- [ ] **Step 5: Check CSS and diff hygiene**

Run: `git diff --check`

Expected: exit code 0 with no whitespace errors.

### Task 3: Browser verification

**Files:**
- Verify: `index.html`, `collaboration.js`, `collaboration.css`
- Update: `README.md` only if the implemented behavior differs from its existing picker description.

- [ ] **Step 1: Start the local preview**

Run: `python3 -m http.server 8765 --bind 127.0.0.1`

Expected: server listens on `http://127.0.0.1:8765/`.

- [ ] **Step 2: Verify focused picker and searching**

Open `http://127.0.0.1:8765/#collaboration`. Confirm the dialog stays compact before focus, focusing `搜索姓名` opens an overlaid list, typing a teacher name filters it, and each candidate row displays only a name.

- [ ] **Step 3: Verify individual and batch selection**

Select two individual teachers without closing the list. Verify chips appear in the field. Select and then deselect the same-subject group; repeat for the whole-school group. Confirm group counts exclude existing collaborators.

- [ ] **Step 4: Verify submission and state transitions**

Change the permission, click `添加 N 位老师`, and confirm the popover closes, selection clears, new members appear, and the success toast is shown. Reopen the picker and confirm those members are disabled and marked `已加入`.

- [ ] **Step 5: Verify keyboard and dismissal behavior**

Confirm ArrowDown enters results, ArrowUp/ArrowDown navigate, Enter toggles a result without closing, Escape closes the popover before the dialog, and outside click closes only the popover without clearing selection.

- [ ] **Step 6: Run final checks and commit**

Run:

```bash
node --check collaboration.js
git diff --check
git status --short
```

Expected: JavaScript syntax and whitespace checks pass; status lists only the intended picker files and this plan before commit.
