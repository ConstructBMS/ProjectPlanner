# Prompt 082 – Implement "Show Slack" Toggle in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Add "Show Slack" Toggle to View Ribbon Tab

## 🎯 Goal

Enable a "Show Slack" toggle in the View tab of the ribbon so users can:

- Visualize slack (float) for each task in the Gantt chart
- Toggle the slack overlay on and off
- Persist the user's preference across sessions

## 📐 Functional Requirements

### Toggle Control

- Add a checkbox labeled Show Slack under the View ribbon tab
- When checked, tasks should display a slack overlay (e.g., a semi-transparent bar extending from task end to latest allowable end)
- When unchecked, hide all slack overlays

### Slack Calculation

- Use existing critical path logic or a new utility to compute float for each task:

```js
float = latestFinish - earlyFinish;
```

- Store float values in context (taskFloat map)

### Visual Styling

- Define a CSS class (e.g. .slack-overlay) for the overlay:

```css
.slack-overlay {
  background-color: rgba(255, 193, 7, 0.4);
}
```

- Overlay should render after the main task bar within the same row

### Persistence

- Store toggle state in localStorage under key gantt.showSlack so setting persists on reload

### Performance

- Only recalculate float values when task data changes
- Only re-render overlays when toggle state or float values change

## ⚙️ Technical Guidance

### ViewTab.jsx

```jsx
import { useContext } from 'react';
import { GanttContext } from '../../context/GanttContext';

const ViewTab = () => {
  const { showSlack, toggleSlack } = useContext(GanttContext);

  return (
    /* existing buttons */
    <label className='flex items-center space-x-2'>
      <input type='checkbox' checked={showSlack} onChange={toggleSlack} />
      <span>Show Slack</span>
    </label>
  );
};
```

### GanttContext.js

```js
const [showSlack, setShowSlack] = useState(() => {
  const saved = localStorage.getItem('gantt.showSlack');
  return saved !== null ? JSON.parse(saved) : false;
});

useEffect(() => {
  localStorage.setItem('gantt.showSlack', JSON.stringify(showSlack));
}, [showSlack]);

// Compute float for tasks whenever tasks change
const [taskFloats, setTaskFloats] = useState({});
useEffect(() => {
  const floats = calculateFloats(tasks); // utility
  setTaskFloats(floats);
}, [tasks]);

const toggleSlack = () => setShowSlack(prev => !prev);

return (
  <GanttContext.Provider
    value={{
      showSlack,
      toggleSlack,
      taskFloats,
      /* other context */
    }}
  >
    {children}
  </GanttContext.Provider>
);
```

### GanttChart.jsx

```jsx
const { showSlack, taskFloats } = useContext(GanttContext);

return (
  <div className='overflow-auto relative'>
    {tasks.map(task => {
      const float = taskFloats[task.id] || 0;
      return (
        <div key={task.id} className='relative'>
          <div className='task-bar' /* positioning */ />
          {showSlack && float > 0 && (
            <div
              className='slack-overlay absolute'
              style={{
                left: computeEndPosition(task),
                width: computeWidth(float),
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);
```

### utils/floatUtils.js

```js
export function calculateFloats(tasks) {
  // Perform forward/backward pass, return { [id]: float }
}
```

### styles/Gantt.css

```css
.slack-overlay {
  background-color: rgba(255, 193, 7, 0.4);
  height: 100%;
}
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 082

- Added "Show Slack" toggle in View tab ribbon
- Computed and stored task float values in GanttContext
- GanttChart now renders slack overlays when toggle is on
- Toggle state persisted in localStorage
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned]
- Prompt 082: Implement Show Slack toggle in View tab
```

To:

```sql
[Completed]
- Prompt 082: Show Slack toggle wired with float calculation and rendering (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/components/ViewTab.jsx src/context/GanttContext.js src/components/GanttChart.jsx src/utils/floatUtils.js src/styles/Gantt.css CHANGELOG.md Roadmap.md
git commit -m "Prompt 082 – Implemented Show Slack toggle with float overlays in Gantt"
git push origin main
```

## Status

Completed
