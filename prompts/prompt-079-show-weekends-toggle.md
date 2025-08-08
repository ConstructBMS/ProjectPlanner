# Prompt 079 – Implement "Show Weekends" Toggle in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Wire Up "Show Weekends" Toggle in View Ribbon Tab

## 🎯 Goal

Enable the "Show Weekends" toggle (checkbox) in the View tab of the Ribbon so that users can:

- Toggle the visibility of weekend columns in the Gantt timeline
- Persist the setting in user preferences (localStorage or Supabase)
- Update the GanttChart rendering immediately

## 📐 Functional Requirements

### Toggle Behavior

- When checked, weekend columns (Saturday & Sunday) are visible in the timeline
- When unchecked, weekend columns are hidden (dates skip from Friday to Monday)

### State Management

- Use a `showWeekends` boolean state in ViewContext
- Initialize from persisted user preference
- Update on toggle and persist

### UI

- In ViewTab.jsx, render a labeled checkbox:

```jsx
<label className='flex items-center space-x-2'>
  <input
    type='checkbox'
    checked={showWeekends}
    onChange={handleToggleWeekends}
  />
  <span>Show Weekends</span>
</label>
```

- Disable nothing; always enabled

### Gantt Rendering

- In GanttChart.jsx, filter date columns based on showWeekends:

```js
const visibleDates = dates.filter(date =>
  showWeekends ? true : date.getDay() !== 0 && date.getDay() !== 6
);
```

- Recalculate layout on change

### Persistence

- On toggle, save showWeekends to `localStorage.setItem('gantt.showWeekends', JSON.stringify(showWeekends))` (and optionally Supabase user settings)

## ⚙️ Technical Guidance

### In ViewContext.jsx:

```js
const [showWeekends, setShowWeekends] = useState(() => {
  const saved = localStorage.getItem('gantt.showWeekends');
  return saved !== null ? JSON.parse(saved) : true;
});

const toggleWeekends = () => {
  setShowWeekends(prev => {
    const next = !prev;
    localStorage.setItem('gantt.showWeekends', JSON.stringify(next));
    return next;
  });
};
```

- Provide `showWeekends` and `toggleWeekends` via Context to ViewTab and GanttChart

### In ViewTab.jsx:

```jsx
const { showWeekends, toggleWeekends } = useContext(ViewContext);
const handleToggleWeekends = () => toggleWeekends();
// render checkbox as above
```

### In GanttChart.jsx:

```jsx
const { showWeekends } = useContext(ViewContext);
const datesToRender = allDates.filter(
  d => showWeekends || (d.getDay() !== 0 && d.getDay() !== 6)
);
// render based on datesToRender
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 079

- Added "Show Weekends" toggle in View tab ribbon
- GanttChart now hides or shows weekend columns based on user setting
- Preference persisted to localStorage for session continuity
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned] - Prompt 079: Implement Show Weekends toggle in View tab
```

To:

```sql
[Completed] - Prompt 079: "Show Weekends" toggle wired to GanttChart with persistence (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/modules/ProgrammeManager/components/RibbonTabs/tabs/ViewTab.jsx src/modules/ProgrammeManager/context/ViewContext.js src/modules/ProgrammeManager/components/GanttChart.jsx CHANGELOG.md Roadmap.md
git commit -m "Prompt 079 – Implemented Show Weekends toggle for Gantt timeline"
git push origin main
```

## Status

Completed
