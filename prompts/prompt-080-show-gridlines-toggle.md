# Prompt 080 – Implement "Show Gridlines" Toggle in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Wire Up "Show Gridlines" Toggle in View Ribbon Tab

## 🎯 Goal

Enable the "Show Gridlines" toggle (checkbox) in the View tab of the Ribbon so that users can:

- Toggle the visibility of vertical and horizontal gridlines on the Gantt timeline
- Immediately update the GanttChart rendering
- Persist the user preference across sessions

## 📐 Functional Requirements

### Toggle Behavior

- When checked, gridlines appear between rows and date columns
- When unchecked, gridlines are hidden

### State Management

- Use a `showGridlines` boolean in ViewContext
- Initialize from `localStorage.getItem('gantt.showGridlines')` (default true)
- Update and persist to `localStorage.setItem('gantt.showGridlines', JSON.stringify(showGridlines))`

### UI

- In ViewTab.jsx, render a labeled checkbox:

```jsx
<label className='flex items-center space-x-2'>
  <input
    type='checkbox'
    checked={showGridlines}
    onChange={handleToggleGridlines}
  />
  <span>Show Gridlines</span>
</label>
```

### Gantt Rendering

- In GanttChart.jsx, wrap the timeline rows and columns with conditional Tailwind classes:

```jsx
const gridClass = showGridlines
  ? 'divide-y divide-gray-300 border-r border-gray-300'
  : '';
return (
  <div className={`overflow-auto relative ${gridClass}`}>
    {/* date columns and task rows */}
  </div>
);
```

- Ensure both horizontal (divide-y) and vertical (border-r) lines are controlled by showGridlines

### Persistence

- Toggling immediately writes to localStorage so that on reload the previous setting is restored

## ⚙️ Technical Guidance

### In ViewContext.jsx:

```js
const [showGridlines, setShowGridlines] = useState(() => {
  const saved = localStorage.getItem('gantt.showGridlines');
  return saved !== null ? JSON.parse(saved) : true;
});

const toggleGridlines = () => {
  setShowGridlines(prev => {
    const next = !prev;
    localStorage.setItem('gantt.showGridlines', JSON.stringify(next));
    return next;
  });
};
```

- Provide `showGridlines` & `toggleGridlines` via Context

### In ViewTab.jsx:

```jsx
const { showGridlines, toggleGridlines } = useContext(ViewContext);
const handleToggleGridlines = () => toggleGridlines();
// Render the checkbox as shown above
```

### In GanttChart.jsx:

```jsx
const { showGridlines } = useContext(ViewContext);
const gridClass = showGridlines
  ? 'divide-y divide-gray-300 border-r border-gray-300'
  : '';
return (
  <div ref={timelineRef} className={`overflow-auto relative ${gridClass}`}>
    {/* timeline contents */}
  </div>
);
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 080

- Added "Show Gridlines" toggle in View tab
- GanttChart now shows or hides gridlines based on user setting
- Preference persisted to localStorage for consistency
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned]
- Prompt 080: Implement Show Gridlines toggle in View tab
```

To:

```sql
[Completed]
- Prompt 080: "Show Gridlines" toggle wired to GanttChart rendering (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/modules/ProgrammeManager/components/RibbonTabs/tabs/ViewTab.jsx src/modules/ProgrammeManager/context/ViewContext.js src/modules/ProgrammeManager/components/GanttChart.jsx CHANGELOG.md Roadmap.md
git commit -m "Prompt 080 – Implemented Show Gridlines toggle for Gantt timeline"
git push origin main
```

## Status

Completed
