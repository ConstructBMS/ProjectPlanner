# Prompt 085 – Implement "Today" Button in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Add "Today" Button to View Ribbon Tab

## 🎯 Goal

Add a "Today" button in the View tab of the ribbon. When clicked, it scrolls the Gantt chart timeline horizontally to centre the current day in the viewport.

## 📐 Functional Requirements

### Button Placement

- In ViewTab.jsx, add a button labeled Today (⏱️ or 📅 icon optional)

### Scroll Behaviour

- Scroll the GanttChart horizontally so that the current date column is centered in the timeline container

### Date Matching Logic

- Use new Date() to determine today's date
- Convert that to a timeline pixel position using the current zoomScale

### Ref Handling

- Ensure timelineRef.current.scrollLeft is updated
- Calculate pixel offset from the start of the Gantt chart to today's date

## ⚙️ Technical Guidance

### ViewTab.jsx

```jsx
const { scrollToToday } = useContext(GanttContext);

return (
  <button onClick={scrollToToday} className='btn-ribbon'>
    Today
  </button>
);
```

### GanttContext.js

```js
const scrollToToday = () => {
  if (!timelineRef.current) return;

  const today = new Date();
  const startOfTimeline = new Date(projectStart); // or first task start
  const daysFromStart = (today - startOfTimeline) / (1000 * 60 * 60 * 24);
  const pxOffset = daysFromStart * zoomScale;

  const container = timelineRef.current;
  container.scrollLeft = pxOffset - container.offsetWidth / 2;
};

return (
  <GanttContext.Provider value={{
    scrollToToday,
    timelineRef,
    zoomScale,
    ...
  }}>
    {children}
  </GanttContext.Provider>
);
```

### GanttChart.jsx

Ensure timelineRef is applied to the scrollable container:

```jsx
<div ref={timelineRef} className='overflow-x-auto'>
  {/* Gantt content */}
</div>
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 085

- Added "Today" button to View ribbon tab
- Clicking it scrolls Gantt chart to center current date in viewport
- Timeline uses zoomScale to calculate pixel offset
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned]
- Prompt 085: Add Today button to View tab
```

To:

```sql
[Completed]
- Prompt 085: Today button scrolls Gantt timeline to current date (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/components/ViewTab.jsx src/context/GanttContext.js src/components/GanttChart.jsx CHANGELOG.md Roadmap.md
git commit -m "Prompt 085 – Added Today button to View tab for timeline centering"
git push origin main
```

## Status

Completed
