### 🧠 Prompt 001 – Build Home Ribbon Layout (Exact Asta Replica)

**Component(s):** RibbonTabs, HomeTab

**Goal:** Reconstruct the Home ribbon tab to visually and structurally match Asta Powerproject's layout using smaller icons, correctly spaced buttons, and grouped sections.

**Instructions:**

- Replace current HomeTab layout with:
  - Editing group: 3-column, 3-row icon grid (no labels)
  - Clipboard group: icons with labels
  - Layout: preserve spacing seen in Asta (ref image provided)
- Ensure:
  - Icons are correctly sized (16–20px where applicable)
  - Only certain buttons have labels (as per Asta design)
  - Toolbar groups are clearly separated
- Use Tailwind grid or flex layouts to achieve compact ribbon blocks
- No tooltips or logic needed yet — layout only

**Files to Modify:**

- `src/modules/ProgrammeManager/components/RibbonTabs/tabs/HomeTab.jsx`

**Expected Outcome:**

- HomeTab ribbon matches Asta Powerproject's visual layout
- Proper icon sizing and spacing
- Clean group separation
- Responsive grid/flex layout

**Status:** Completed
**Priority:** High
**Estimated Effort:** Medium
