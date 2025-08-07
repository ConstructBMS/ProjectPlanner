### 🧠 Prompt 003 – Task Linking

**Component(s):** TaskGrid, GanttChart, TaskContext

**Goal:** Implement task linking functionality to create predecessor/successor relationships between tasks with visual representation.

**Instructions:**

- Add linking functionality to TaskGrid
- Implement drag-to-link interface
- Create visual link indicators in GanttChart
- Support different link types:
  - Finish-to-Start (FS)
  - Start-to-Start (SS)
  - Finish-to-Finish (FF)
  - Start-to-Finish (SF)
- Add lag/lead time support
- Implement link validation (no circular dependencies)
- Update TaskContext to manage link relationships

**Files to Modify:**

- `src/modules/ProgrammeManager/components/TaskGrid.jsx`
- `src/modules/ProgrammeManager/components/GanttChart.jsx`
- `src/modules/ProgrammeManager/context/TaskContext.jsx`

**Expected Outcome:**

- Functional task linking system
- Visual link representation in Gantt chart
- Link type selection interface
- Validation and error handling
- Integration with existing task management

**Status:** Completed
**Priority:** High
**Estimated Effort:** High
