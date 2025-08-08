# Prompt 081 – Implement "Show Critical Path" Toggle in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Add "Show Critical Path" Toggle to View Ribbon Tab

## 🎯 Goal

Enable a "Show Critical Path" toggle in the View tab of the ribbon so users can:

- Highlight tasks on the project's critical path (total float = 0) in the Gantt chart
- Toggle the highlighting on and off
- Persist the user's preference across sessions

## 📐 Functional Requirements

### Toggle Control

- Add a checkbox labeled Show Critical Path under the View ribbon tab
- When checked, tasks on the critical path are visually distinguished (e.g., red bars or a distinct CSS class)
- When unchecked, revert to standard task bar styling

### Critical Path Calculation

- Recompute the critical path whenever task start/end dates or durations change
- Identify all tasks with zero total float as critical

### Visual Styling

- Define a CSS class (e.g. .critical-task) to style critical tasks (red border/fill)
- Ensure the styling is accessible (sufficient contrast)

### Persistence

- Store the toggle state in localStorage under key gantt.showCriticalPath so it persists on reload

### Performance

- Only recalculate and re-render when task data or the toggle state changes

## ⚙️ Technical Guidance

### ViewTab.jsx

```jsx
import { useContext } from 'react';
import { GanttContext } from '../../context/GanttContext';

const ViewTab = () => {
  const { showCriticalPath, toggleCriticalPath } = useContext(GanttContext);

  return (
    /* existing buttons */
    <label className='flex items-center space-x-2'>
      <input
        type='checkbox'
        checked={showCriticalPath}
        onChange={toggleCriticalPath}
      />
      <span>Show Critical Path</span>
    </label>
  );
};
```

### GanttContext.js

```js
import React, { createContext, useState, useEffect } from 'react';
import { calculateCriticalPath } from '../utils/criticalPath';

export const GanttContext = createContext();

export const GanttProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [criticalPath, setCriticalPath] = useState([]);
  const [showCriticalPath, setShowCriticalPath] = useState(() => {
    const saved = localStorage.getItem('gantt.showCriticalPath');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    setCriticalPath(calculateCriticalPath(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      'gantt.showCriticalPath',
      JSON.stringify(showCriticalPath)
    );
  }, [showCriticalPath]);

  const toggleCriticalPath = () => setShowCriticalPath(prev => !prev);

  return (
    <GanttContext.Provider
      value={{
        tasks,
        setTasks,
        criticalPath,
        showCriticalPath,
        toggleCriticalPath,
        /* other context values */
      }}
    >
      {children}
    </GanttContext.Provider>
  );
};
```

### GanttChart.jsx

```jsx
import { useContext } from 'react';
import { GanttContext } from '../context/GanttContext';

const GanttChart = () => {
  const { tasks, criticalPath, showCriticalPath } = useContext(GanttContext);

  return (
    <div className='overflow-auto relative'>
      {tasks.map(task => {
        const isCritical = showCriticalPath && criticalPath.includes(task.id);
        return (
          <div
            key={task.id}
            className={`task-bar ${isCritical ? 'critical-task' : ''}`}
            /* positioning props */
          />
        );
      })}
    </div>
  );
};
```

### utils/criticalPath.js

```js
// Implement forward/backward pass to compute earliest/latest dates and float
export function calculateCriticalPath(tasks) {
  // Returns an array of task IDs with total float === 0
  // ...
}
```

### styles/Gantt.css

```css
.critical-task {
  stroke: #c62828;
  fill: #ef5350;
  stroke-width: 2px;
}
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 081

- Added "Show Critical Path" toggle in View tab ribbon (ViewTab.jsx)
- Implemented critical path calculation in utils/criticalPath.js
- GanttChart now highlights critical tasks when toggle is on
- Toggle state persisted in localStorage
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned]
- Prompt 081: Implement Show Critical Path toggle in View tab
```

To:

```sql
[Completed]
- Prompt 081: Show Critical Path toggle wired with calculation and styling (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/components/ViewTab.jsx src/context/GanttContext.js src/components/GanttChart.jsx src/utils/criticalPath.js src/styles/Gantt.css CHANGELOG.md Roadmap.md
git commit -m "Prompt 081 – Implemented Show Critical Path toggle in View tab with calculation and styling"
git push origin main
```

## Status

Completed
