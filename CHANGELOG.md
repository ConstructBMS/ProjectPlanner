# Changelog

All notable changes to the ProjectPlanner module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Server Rebuild and Restart**
  - Rebuilt production build with optimized chunks and improved performance
  - Restarted development server with Hot Module Replacement (HMR) enabled
  - Updated build configuration for better code splitting and optimization
  - Generated optimized bundles: AppShell (94.17 kB), Vendor (139.84 kB), DnD (46.54 kB), Panels (26.93 kB)
  - All build operations completed successfully in 1.90s

- **Prompt 065: Add Inline Task Editing in Grid**
  - Enhanced existing inline editing functionality in TaskGrid component
  - Implemented proper date formatting for display (YYYY-MM-DD) and editing
  - Added comprehensive validation for task names (non-empty), dates (valid format), and durations (positive numbers)
  - Added date relationship validation to ensure end date is not before start date
  - Improved error handling with console warnings for invalid inputs
  - Integrated with existing undo/redo system from Prompt 063
  - Added visual feedback with hover states and pencil icons for editable fields
  - Fixed linting issues including unescaped entities and unused variables
  - All inline editing operations logged to console for debugging

- **Prompt 064: Add Colour Code Task Rows by Status**
  - Added status highlighting toggle button in ViewTab with PaintBrush icon
  - Implemented status-based row background coloring in TaskGrid component
  - Added status highlighting state to ViewContext for persistent toggle state
  - Updated sample tasks with different statuses: Planned, In Progress, Complete, Delayed
  - Implemented color coding: Planned (white), In Progress (blue-50), Complete (green-50), Delayed (red-50)
  - Added visual feedback for status highlighting toggle button state
  - Updated getStatusColor function to handle new status values
  - All status highlighting operations logged to console for debugging

- **Prompt 063: Add Undo / Redo Toolbar Group**
  - Added "History" ribbon group to HomeTab with Undo (↺) and Redo (↻) buttons
  - Implemented undo/redo stack functionality in TaskContext with saveToUndoStack helper
  - Added state tracking for all task operations (add, delete, update, link, group, reorder)
  - Integrated undo/redo functions with all task modification operations
  - Added visual feedback with disabled state when stacks are empty
  - Implemented proper state restoration including tasks, taskLinks, and nextId
  - Added console logging for all undo/redo operations
  - Exposed undo/redo functionality through useTaskManager hook

- **Prompt 062: Add Milestone Marker Tool**
  - Added "Add Milestone" button to HomeTab ribbon with 📌 icon and tooltip
  - Implemented addMilestone function in TaskContext with prompt for name and date
  - Created milestone tasks with duration = 0 and isMilestone = true
  - Updated GanttChart to render milestones with diamond icon (◆) at specific date position
  - Added Type column to TaskGrid showing "Milestone" for milestone tasks
  - Implemented milestone-specific styling with purple color scheme
  - Added hover tooltip showing milestone name and date
  - All milestone operations logged to console for debugging

- **Prompt 060: Drag & Drop Reordering in SidebarTree**
  - Implemented drag and drop reordering using @dnd-kit library
  - Added SortableTaskNode component with drag handles
  - Integrated with TaskContext reorderTasksById function
  - Added visual feedback during dragging with DragOverlay
  - Maintained hierarchical structure and parent/child relationships
  - Added drag handle icons and hover states for better UX
  - All drag operations logged to console for debugging

- **Prompt 059: Zoom In/Out & Fit to View Toolbar Group**
  - Added zoom functionality to ViewTab with Zoom In/Out buttons and Fit to View
  - Integrated timeline zoom scaling in GanttChart component
  - Added zoom level indicator showing current percentage
  - Implemented persistent zoom state management
  - All zoom actions logged to console for debugging

- Initial project setup with React 18.2.0 and Vite 5.2.0
- Tailwind CSS 3.4.1 for styling
- ESLint 9.32.0 with React and TypeScript support
- Prettier 3.6.2 for code formatting
- Husky 9.1.7 for Git hooks
- lint-staged 16.1.2 for pre-commit linting
- VS Code configuration with recommended extensions
- Comprehensive development environment setup

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

---

## [1.0.0] - 2025-01-27

### Added

- **Core Application Structure**
  - React Router DOM 6.22.3 for navigation
  - Supabase client integration for database connectivity
  - Main application shell with modular architecture

- **ProgrammeManager Module**
  - `AppShell.jsx` - Main application layout component
  - `RibbonTabs.jsx` - Tab navigation system with state management
  - `HomeTab.jsx` - Home ribbon tab with multiple tool sections
  - `ViewTab.jsx` - View ribbon tab with disabled clipboard and font tools
  - Component stubs for remaining tabs (View, Project, Allocation, 4D, Format)
  - Sidebar, TaskGrid, GanttChart, and TaskPropertiesPane components
  - Context, utils, and styles directories for future development

- **Development Tools & Configuration**
  - ESLint configuration with React, React Hooks, and React Refresh plugins
  - Prettier configuration for consistent code formatting
  - Husky pre-commit hooks for automated code quality checks
  - VS Code settings for optimal development experience
  - Comprehensive .gitignore for Node.js projects
  - PostCSS and Tailwind CSS configuration
  - Vite configuration with React plugin and development server settings

- **Documentation**
  - README.md with project overview, installation instructions, and development guidelines
  - Package.json with all necessary dependencies and scripts
  - TypeScript configuration for future type safety

### Technical Details

- **42 files created** in initial commit
- **7,731 lines of code** added
- **Dependencies**: React 18.2.0, Vite 5.2.0, Tailwind CSS 3.4.1, ESLint 9.32.0, Prettier 3.6.2
- **Development Server**: Running on http://localhost:5173/
- **Code Quality**: ESLint and Prettier configured with pre-commit hooks

### File Structure

```
projectplanner/
├── .husky/pre-commit
├── .vscode/extensions.json
├── .vscode/settings.json
├── public/index.html
├── src/
│   ├── modules/ProgrammeManager/
│   │   ├── AppShell.jsx
│   │   ├── components/
│   │   │   ├── RibbonTabs/
│   │   │   │   ├── RibbonTabs.jsx
│   │   │   │   └── tabs/
│   │   │   │       ├── HomeTab.jsx
│   │   │   │       ├── ViewTab.jsx
│   │   │   │       ├── ProjectTab.jsx
│   │   │   │       ├── AllocationTab.jsx
│   │   │   │       ├── FourDTab.jsx
│   │   │   │       └── FormatTab.jsx
│   │   │   ├── SidebarTree.jsx
│   │   │   ├── TaskGrid.jsx
│   │   │   ├── GanttChart.jsx
│   │   │   └── TaskPropertiesPane.jsx
│   │   ├── context/TaskContext.jsx
│   │   ├── utils/dateUtils.js
│   │   └── styles/gantt.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
├── .prettierignore
├── .gitignore
└── README.md
```

### Commit History

- **Initial Commit**: `0775bf9` - ProjectPlanner module setup with React, Vite, Tailwind CSS, and development tools

---

## Commit Log

### 2025-01-27

- **35d55c0** - Prompt 059: Implement Zoom In/Out & Fit to View Toolbar Group
  - Added zoom functionality to ViewTab with Zoom In/Out buttons and Fit to View
  - Integrated timeline zoom scaling in GanttChart component
  - Added zoom level indicator showing current percentage
  - Implemented persistent zoom state management
  - All zoom actions logged to console for debugging
  - Files changed: 18 files, 2375 insertions(+), 866 deletions(-)
  - Created: src/modules/ProgrammeManager/components/DateMarkersOverlay.jsx, src/modules/ProgrammeManager/context/ViewContext.jsx

- **0775bf9** - Initial commit: ProjectPlanner module setup with React, Vite, Tailwind CSS, and development tools
  - Added 42 files with 7,731 insertions
  - Created complete development environment
  - Set up ProgrammeManager module structure
  - Configured all development tools and linting

- **37cdcde** - feat: Add GitHub integration with automated commits and comprehensive changelog system
  - Files changed: 5
  - Changed files: CHANGELOG.md, DEVELOPMENT_WORKFLOW.md, package.json, scripts/auto-commit.js, scripts/auto-commit.ps1
  - Status: A CHANGELOG.md, A DEVELOPMENT_WORKFLOW.md, M package.json, A scripts/auto-commit.js, A scripts/auto-commit.ps1

- **585c69e** - feat: Add Programme Tree Sidebar Panel with expand/collapse functionality
  - Files changed: 18
  - Changed files: CHANGELOG.md, DEVELOPMENT_WORKFLOW.md, eslint.config.js, scripts/auto-commit.js, src/modules/ProgrammeManager/AppShell.jsx, src/modules/ProgrammeManager/components/RibbonTabs/RibbonTabs.jsx, src/modules/ProgrammeManager/components/RibbonTabs/tabs/HomeTab.jsx, src/modules/ProgrammeManager/components/RibbonTabs/tabs/ViewTab.jsx, src/modules/ProgrammeManager/components/SidebarTree.jsx, src/modules/ProgrammeManager/components/TaskGrid.jsx, src/modules/ProgrammeManager/components/TaskGrid.jsx, src/modules/ProgrammeManager/components/TaskPropertiesPane.jsx, src/modules/ProgrammeManager/context/TaskContext.jsx, src/modules/ProgrammeManager/styles/gantt.css, src/modules/ProgrammeManager/utils/dateUtils.js
  - Status: M CHANGELOG.md, M DEVELOPMENT_WORKFLOW.md, M eslint.config.js, M scripts/auto-commit.js, M src/modules/ProgrammeManager/AppShell.jsx, M src/modules/ProgrammeManager/components/RibbonTabs/RibbonTabs.jsx, M src/modules/ProgrammeManager/components/RibbonTabs/tabs/HomeTab.jsx, M src/modules/ProgrammeManager/components/RibbonTabs/tabs/ViewTab.jsx, A src/modules/ProgrammeManager/components/SidebarTree.jsx, M src/modules/ProgrammeManager/components/TaskGrid.jsx, M src/modules/ProgrammeManager/components/TaskPropertiesPane.jsx, M src/modules/ProgrammeManager/context/TaskContext.jsx, src/modules/ProgrammeManager/styles/gantt.css, src/modules/ProgrammeManager/utils/dateUtils.js

- **ac6c6d5** - feat: Build complete HomeTab ribbon with 7 functional groups matching PowerProject layout
  - Files changed: 1
  - Changed files: src/modules/ProgrammeManager/components/RibbonTabs/tabs/HomeTab.jsx
  - Status: M src/modules/ProgrammeManager/components/RibbonTabs/tabs/HomeTab.jsx

---

## Development Notes

### Current Status

- ✅ Development server running on port 5173
- ✅ All development tools configured and working
- ✅ ESLint and Prettier passing with no errors
- ✅ Git repository initialized and connected to GitHub
- ✅ Initial commit completed successfully

### Next Steps

- Continue development of remaining ribbon tabs
- Implement core functionality for task management
- Add database integration with Supabase
- Develop Gantt chart visualization
- Add user authentication and authorization

### Environment

- **OS**: Windows 10.0.26100
- **Node.js**: Latest LTS version
- **Package Manager**: npm
- **Build Tool**: Vite 5.4.19
- **Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.1
- **Code Quality**: ESLint 9.32.0, Prettier 3.6.2
- **Git Hooks**: Husky 9.1.7, lint-staged 16.1.2

### 2025-08-07 19:36:29

- feat: Created buildQueue.js utility for tracking development progress

### 2025-08-07 19:43:21

- test: Testing updated pre-commit hook with auto-update scripts
