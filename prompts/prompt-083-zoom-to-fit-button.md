# Prompt 083 – Add "Zoom to Fit" Button in View Ribbon Tab

## 🧠 DEFAULT HEADER

This prompt is part of the ConstructBMS ProgrammeManager module. You are enhancing an Asta PowerProject-style scheduling system using React, Tailwind CSS, and Supabase. DO NOT rename existing components. DO NOT introduce new structure unless specified. Assume all imports and files exist. Style must follow the Asta layout exactly. Continue building the app without breaking current functionality.

## 🧠 Prompt Title

Implement "Zoom to Fit" Button in View Ribbon Tab

## 🎯 Goal

Add a "Zoom to Fit" button in the View ribbon that automatically zooms the Gantt timeline so all tasks are visible within the current viewport horizontally.

## 📐 Functional Requirements

### Button Location

- Add a button labeled Zoom to Fit in the ViewTab.jsx ribbon panel

### Zoom Logic

- When clicked, calculate the earliest task start and latest task finish dates
- Adjust the Gantt timeline's zoom scale so that the full date range fits within the visible width of the Gantt container

### Responsive Rendering

- Use the current container width (from ref) to determine scale
- Re-render Gantt chart with adjusted zoom level

### Optional Enhancements

- Animate the transition smoothly if possible
- Disable the button if no tasks exist

## ⚙️ Technical Guidance

### ViewTab.jsx

```jsx
<button onClick={handleZoomToFit} className='btn-ribbon'>
  Zoom to Fit
</button>
```

### GanttContext.js

```js
const zoomToFit = () => {
  if (tasks.length === 0) return;
  const minDate = new Date(Math.min(...tasks.map(t => new Date(t.start))));
  const maxDate = new Date(Math.max(...tasks.map(t => new Date(t.end))));

  const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const containerWidth = timelineRef.current.offsetWidth;

  const pxPerDay = containerWidth / totalDays;
  setZoomScale(pxPerDay); // used by GanttChart
};
```

### GanttChart.jsx

Ensure bar positioning and column widths use zoomScale from context:

```jsx
const columnWidth = zoomScale || DEFAULT_WIDTH;
```

### GanttContext.js

Add to context:

```js
const [zoomScale, setZoomScale] = useState(DEFAULT_WIDTH);
const timelineRef = useRef();
```

## ✅ CHANGELOG.md

```md
## [2025-08-08] – Prompt 083

- Added "Zoom to Fit" button in View tab ribbon
- Automatically adjusts Gantt chart zoom scale to fit all tasks in view
- Button disabled when no tasks exist
```

## ✅ Roadmap.md

Move this card:

```sql
[Planned]
- Prompt 083: Add Zoom to Fit button in View tab
```

To:

```sql
[Completed]
- Prompt 083: Zoom to Fit adjusts Gantt scale to display all tasks in view (2025-08-08)
```

## ✅ Git Commit Instructions

```bash
git add src/components/ViewTab.jsx src/context/GanttContext.js src/components/GanttChart.jsx CHANGELOG.md Roadmap.md
git commit -m "Prompt 083 – Implemented Zoom to Fit button in View ribbon tab"
git push origin main
```

## Status

Completed
