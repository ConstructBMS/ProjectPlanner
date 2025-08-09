# Changelog

All notable changes to the ProjectPlanner module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-08-08] – Prompt 088

### Added

- **Horizontal Row Grid Lines in Gantt Chart**
  - Added horizontal grid lines to separate rows in Gantt chart for improved visual clarity
  - Row lines render dynamically based on task count and row height (32px spacing)
  - Light grey lines spanning full width of timeline with consistent height and spacing
  - Lines automatically re-render when tasks are added, removed, or reordered
  - Horizontal lines scroll horizontally with Gantt content and respect zoom levels
  - Proper z-index layering ensures lines appear behind task bars but above background
  - Integrated with existing grid lines toggle for unified grid system control
  - Performance optimized with useMemo for smooth scrolling and task updates

## [2025-08-08] – Prompt 087

### Added

- **Today's Date Marker in Gantt Chart**
  - Added red vertical line (2px wide) to indicate today's date in Gantt timeline
  - Marker dynamically positions based on today's date, project start date, and zoom scale
  - Automatically scrolls horizontally with Gantt chart and repositions on zoom level changes
  - Respects weekend visibility toggle (shows/hides based on showWeekends setting)
  - Styled with .today-marker CSS class using red color (#ef4444) and subtle shadow
  - High z-index (30) ensures marker appears above grid lines but below task bars
  - Performance optimized with useMemo for smooth scrolling and zooming
  - Only displays when today's date falls within the visible timeline range

## [2025-08-08] – Prompt 086

### Added

- **Vertical Grid Lines in Gantt Timeline for Days, Weeks, and Months**
  - Rendered vertical grid lines for days, weeks, and months in Gantt timeline
  - Styled using .grid-day, .grid-week, .grid-month classes with proper opacity
  - Dynamically generated based on date range and zoom level
  - Grid lines appear behind task bars with proper z-index layering
  - Different visual weights for day (light), week (medium), and month (strong) boundaries
  - Performance optimized with useMemo for smooth scrolling and zooming
  - Integrated with existing grid lines toggle and weekend visibility controls

## [2025-08-08] – Prompt 128

### Added

- **Dependencies Section in Task Properties Panel**
  - Added comprehensive dependencies management section to Task Properties Panel
  - Users can view, edit, and create new task dependencies with lag information
  - Predecessors and successors display with editable lag values (+/- days)
  - Add button to link new tasks with configurable link types (FS, SS, FF, SF)
  - Remove dependency functionality with confirmation
  - Real-time lag updates that auto-update Gantt links
  - Professional modal interface for adding new dependencies
  - Integrated with existing task linking system for seamless workflow

## [2025-08-08] – Prompt 127

### Added

- **Milestone Task Type and Diamond Gantt Rendering**
  - Added support for `task.type = 'milestone'` alongside existing `isMilestone` property
  - Enhanced GanttChart to render milestones as diamond-shaped icons instead of bars
  - Improved DiamondIcon component with proper diamond shape (rotated square)
  - Milestone tasks display as centered diamond icons at task start date
  - Tooltip shows task title when hovering over milestone diamonds
  - Milestone checkbox in Task Properties Panel with dual support for type and isMilestone
  - Backward compatibility maintained for existing milestone tasks
  - Professional milestone visualization matching industry standards

## [2025-08-08] – Prompt 125

### Added

- **View Scale Dropdown for Gantt Timeline**
  - Added ribbon dropdown to change Gantt view scale between Day, Week, and Month
  - Dynamic timeline headers that adapt to selected view scale
  - Day view: Shows individual day columns with date labels
  - Week view: Shows week columns with week numbers (W1, W2, etc.)
  - Month view: Shows month columns with month names and years
  - Grid lines automatically adjust to match selected view scale
  - Integrated with existing zoom and weekend visibility controls
  - Professional dropdown UI with proper state management and persistence

## [2025-08-08] – Prompt 124

### Added

- **Vertical Daily Grid Lines in Gantt Chart**
  - Enhanced existing grid lines system for improved timeline readability
  - Daily grid lines with alternating light grey styling for better visibility
  - Improved CSS styling with proper opacity and border-right properties
  - Grid lines respect weekend visibility toggle (show/hide weekends)
  - Enhanced horizontal row grid lines for better task separation
  - Proper z-index layering to ensure grid lines appear behind task bars
  - Professional visual hierarchy with day, week, and month grid line variations

## [2025-08-08] – Prompt 123

### Added

- **Auto-Snap Gantt Bars to Workdays**
  - Enhanced Gantt drag logic to snap bars only to Monday-Friday working days
  - Added utility functions for weekday snapping: `snapToWeekday`, `addWorkingDays`, `getWorkingDaysBetween`
  - Gantt bars automatically skip weekends during drag operations
  - Visual weekend highlighting with grey background blocks already implemented
  - Ensures end dates are never before start dates after snapping
  - Professional project management workflow respecting business days
  - Maintains existing weekend visibility toggle functionality

## [2025-08-08] – Prompt 122

### Added

- **Inline Editing for Task Names in Grid**
  - Enhanced existing inline editing functionality for task names in Task Grid
  - Double-click on task name to switch to editable input field
  - Save changes on Enter key or blur event with validation
  - Revert changes on Escape key for user control
  - Professional styling with blue border and focus ring
  - Auto-focus on input field for immediate editing
  - Validation ensures task names cannot be empty
  - Seamless integration with existing task management system

## [2025-08-08] – Prompt 121

### Added

- **Right-Click Context Menu on Task Grid Rows**
  - Added comprehensive right-click context menu to Task Grid rows
  - Context menu includes: Edit Task, Delete Task, Add Subtask options
  - Menu positioned near cursor with proper z-index (z-50) and absolute positioning
  - Automatic menu closure on outside click or Escape key press
  - Enhanced ContextMenu component with new "Add Subtask" option using PlusIcon
  - Professional styling with hover effects and proper visual hierarchy
  - Integrated with existing task management functions (edit, delete)

## [2025-08-08] – Prompt 120

### Added

- **Milestone Diamond Icon in Task Grid and Tree**
  - Added milestone diamond icon to task rows in both Task Grid and Sidebar Tree
  - Replaced yellow circle with purple diamond icon for milestone tasks in TaskGrid
  - Consistent diamond icon styling across both components using `text-purple-500`
  - Diamond icon positioned before task name for clear visual identification
  - Enhanced visual consistency between grid and tree views
  - Professional milestone indicator matching industry standards

## [2025-08-08] – Prompt 119

### Added

- **Critical Path Highlighting Toggle**
  - Enhanced existing ribbon toggle for critical path highlighting in Gantt chart
  - Updated critical path task styling to use `bg-red-500 opacity-70` for better visibility
  - Critical path calculation uses dependency data to identify tasks with zero total float
  - Tasks on critical path are highlighted with red background and border
  - Toggle state persists across sessions using localStorage
  - Critical tasks show in tooltip when critical path highlighting is enabled
  - Professional styling with opacity effect for clear visual distinction

## [2025-08-08] – Prompt 118

### Added

- **Gantt Bar Hover Tooltip with Dates**
  - Enhanced tooltip on Gantt bars to show task name and date range on hover
  - Improved tooltip styling with better visual hierarchy and spacing
  - Tooltip displays: "Task: [Name]", "Start: [Date]", "End: [Date]"
  - Added fade-in transition effect with smooth opacity animation
  - Enhanced visual design with dark theme, borders, and better typography
  - Maintains critical task indicator in tooltip when applicable
  - Responsive positioning with maximum width constraint for readability

## [2025-08-08] – Prompt 117

### Added

- **Task Duration (Working Days) Column**
  - Enhanced Duration column in Task Grid to calculate working days between start and end dates
  - Added `calculateWorkingDays` utility function that excludes weekends (Saturday/Sunday)
  - Duration displayed as compact format (e.g., "12d") for better space utilization
  - Automatic calculation based on task start and end dates
  - Maintains existing inline editing functionality for duration field
  - Working days calculation provides more accurate project planning metrics

## [2025-08-08] – Prompt 116

### Added

- **Expand/Collapse All Toggle Button**
  - Added ribbon toggle button to expand/collapse all task groups in Sidebar Tree
  - Single button replaces separate "Expand All" and "Collapse All" buttons
  - Uses double arrow icon (ChevronDoubleDownIcon) for expand, single arrow (ChevronRightIcon) for collapse
  - Button shows active state (blue background) when all items are expanded
  - Toggle functionality switches between expand and collapse states
  - Dynamic tooltip changes based on current state
  - Integrated with existing SidebarTree expand/collapse functionality

## [2025-08-08] – Prompt 115

### Added

- **Task Row Numbering in Sidebar Tree**
  - Added 1-based row numbering in the Programme Tree sidebar
  - Row numbers display as 1, 2, 3... matching Asta PowerProject style
  - Numbers positioned before expand/collapse buttons for clear hierarchy
  - Styled with `text-sm text-gray-400 pr-2` for subtle visual integration
  - Row counter increments sequentially across all visible tasks
  - Numbers align vertically with task names for consistent layout
  - Maintains existing tree structure and functionality

## [2025-08-08] – Prompt 114

### Enhanced

- **Gantt Zoom In/Out Controls**
  - Enhanced existing zoom functionality with improved scale control
  - Zoom buttons adjust timeline scale from 30% to 300% (0.3x to 3.0x)
  - Base day width: 2px, scaled width: `baseDayWidth * timelineZoom`
  - Zoom increments: ±0.2 per click for smooth scaling
  - Affects bar width, grid lines, weekend blocks, and all timeline elements
  - Zoom state stored in ViewContext for persistence across sessions
  - Integrated with existing "Fit to View" and "Go to Today" functionality

## [2025-08-08] – Prompt 113

### Added

- **Go to Today Ribbon Button**
  - Added "Go to Today" button in Home tab ribbon for Gantt navigation
  - Button scrolls Gantt chart horizontally to today's date using pixel offset calculation
  - Uses `ref.scrollLeft` technique with smooth scrolling behavior
  - Automatically centers today's date in the viewport for optimal visibility
  - Integrates with existing weekend visibility and zoom level settings
  - Provides immediate visual feedback with smooth scroll animation
  - Enhanced existing scroll functionality with proper button labeling

## [2025-08-08] – Prompt 112

### Added

- **Project Start/End Date Ribbon Display**
  - Added dynamic project start and end date display in Home tab ribbon
  - Shows project dates in format: "📅 Start: 12 Aug 2025 | End: 17 Oct 2025"
  - Pulls data from first task's startDate and last task's endDate
  - Displays in dedicated "Project Status" group with calendar emoji
  - Automatically updates when tasks are added, modified, or removed
  - Uses British date format (DD MMM YYYY) for consistency
  - Handles empty project state gracefully with "N/A" fallback

## [2025-08-08] – Prompt 111

### Added

- **Today Line Marker**
  - Added vertical red line marker to represent today's date in Gantt chart
  - Line positioned based on pixel offset calculation from timeline start date
  - Styling: `absolute w-[2px] bg-red-600 top-0 bottom-0 z-50`
  - Automatically calculates today's position considering weekend visibility settings
  - High z-index ensures line appears above all other timeline elements
  - Includes tooltip showing today's date on hover
  - Provides clear visual reference for current date in project timeline

## [2025-08-08] – Prompt 110

### Added

- **Non-Working Days Shading**
  - Added grey background shading for weekend days in Gantt timeline
  - Weekend blocks use `bg-gray-200 opacity-60` styling for subtle visual distinction
  - Shading positioned behind task bars with `z-index: 0` for proper layering
  - Weekend highlighting works regardless of weekend visibility toggle setting
  - Proper date index calculation handles both weekend-visible and weekend-hidden modes
  - Enhances task planning visibility by clearly marking non-working periods

## [2025-08-08] – Prompt 109

### Added

- **Calendar Week Headers**
  - Added calendar week headers (e.g. W32, W33) above Gantt timeline day columns
  - Week headers display in top section of Gantt header with proper styling
  - Uses `getWeek()` function to calculate ISO week numbers for each 7-day block
  - Header row styling: `text-xs text-gray-600 bg-gray-100 py-1 border-b`
  - Week headers span full width of 7-day periods and respect weekend visibility settings
  - Day headers show formatted dates below week headers for complete timeline reference

## [2025-08-08] – Prompt 108

### Added

- **Milestone Diamond Icons**
  - Added diamond-shaped SVG icons for milestone tasks in both Gantt chart and sidebar tree
  - Replaced FlagIcon with custom DiamondIcon component in SidebarTree
  - Updated Gantt chart milestone rendering to use proper diamond shape instead of rotated square
  - Diamond icons use purple color (`text-purple-600`) by default
  - Critical milestones show red diamond, selected/hovered milestones show blue diamond
  - Icons sized at `w-3 h-3` in sidebar and `w-4 h-4` in Gantt chart
  - Consistent visual representation across both components

## [2025-08-08] – Prompt 107

### Added

- **Expand Milestones Button**
  - Added "Expand Milestones" ribbon button in Home tab Hierarchy group
  - Button expands all milestone tasks in the programme tree with single click
  - Uses FlagIcon to represent milestone functionality
  - Loops through all tasks and sets `isExpanded: true` for tasks with `isMilestone: true`
  - Integrated with existing task expansion system in TaskContext
  - Provides tooltip explaining the functionality

## [2025-08-08] – Prompt 106

### Added

- **Critical Path Toggle Button**
  - Added "Show Critical Path" toggle button in Home ribbon tab
  - Button shows active state (blue background) when critical path highlighting is enabled
  - Toggle controls visibility of critical path highlighting in Gantt chart
  - Critical tasks display with red background (`bg-red-600`) instead of blue
  - Tooltip now includes "Critical Task" label for critical path tasks
  - Toggle state persists across sessions via localStorage
  - Integrated with existing critical path calculation and styling system

## [2025-08-08] – Prompt 089

### Added

- **Weekend Highlighting**
  - Highlighted Saturdays and Sundays with shaded background in Gantt timeline
  - Weekend blocks calculated dynamically based on project date range and zoomScale
  - Light blue translucent background (rgba(33, 150, 243, 0.08)) for subtle visual distinction
  - Blocks positioned behind task bars and grid lines with proper z-index layering
  - Only renders when "Show Weekends" toggle is enabled for consistency
  - Performance optimized with useMemo for efficient re-rendering
  - Spans full timeline height and matches day width for accurate visual representation

## [2025-08-08] – Prompt 088

### Added

- **Horizontal Row Grid Lines**
  - Added horizontal grid lines to separate rows in Gantt chart
  - Row lines render dynamically based on task count and row height (32px)
  - Light grey lines spanning full width of the timeline for visual clarity
  - Lines positioned behind task bars with proper z-index layering
  - Re-renders automatically when tasks are added, removed, or reordered
  - Scrolls horizontally with Gantt content for consistent visual experience
  - Performance optimized with useMemo for efficient updates

## [2025-08-08] – Prompt 086

### Added

- **Vertical Grid Lines**
  - Rendered vertical grid lines for days, weeks, and months in Gantt timeline
  - Styled using .grid-day, .grid-week, .grid-month classes with different opacity levels
  - Dynamically generated based on date range and zoom level
  - Respects weekend visibility settings when generating grid lines
  - Grid lines scroll horizontally with the chart and update on zoom changes
  - Performance optimized with useMemo for efficient re-rendering
  - Layered behind task bars with proper z-index positioning

## [2025-08-08] – Prompt 090

### Added

- **Task Bar Hover Tooltip**
  - Added tooltip on hover over Gantt task bars
  - Tooltip displays task name, start date, end date, and duration
  - Smooth fade-in animation with backdrop blur effect
  - Follows mouse cursor with proper positioning
  - High z-index (9999) to appear above all other elements
  - Works for both regular tasks and milestones
  - Integrated with existing task hover functionality

## [2025-08-08] – Prompt 092

### Added

- **Task Bar Drag-to-Move**
  - Enabled drag-to-move functionality for Gantt task bars
  - Users can click and drag task bars horizontally to adjust start and end dates
  - Movement snaps to nearest day based on zoom scale for precise positioning
  - Visual feedback with orange highlighting during drag operations
  - Cursor changes to move indicator to show draggable state
  - Real-time visual updates during drag with proper date calculations
  - Integration with TaskContext for persistent storage of date changes
  - Error handling with automatic reversion on failed updates

## [2025-08-08] – Prompt 091

### Added

- **Today Line Indicator**
  - Added red vertical "Today" line in Gantt chart
  - Line renders vertically from top to bottom of timeline
  - Positioned correctly based on today's date in the timeline
  - Respects weekend visibility settings when calculating position
  - Enhanced with subtle red shadow for better visibility
  - Proper z-index layering to appear above weekend backgrounds
  - Includes tooltip showing today's date on hover

## [2025-08-08] – Prompt 090

### Added

- **Task Bar Hover Tooltip**
  - Added tooltip on hover over Gantt task bars
  - Tooltip displays task name, start date, end date, and duration
  - Tooltip follows mouse cursor with smooth positioning
  - Proper z-index layering ensures tooltip appears above other elements
  - Responsive design with max-width and proper text formatting
  - Works for both regular tasks and milestone tasks

## [2025-08-08] – Prompt 086

### Added

- **Vertical Grid Lines**
  - Rendered vertical grid lines for days, weeks, and months in Gantt timeline
  - Styled using .grid-day, .grid-week, .grid-month classes with different opacity levels
  - Dynamically generated based on date range and zoom level
  - Grid lines scroll horizontally with the chart and respect weekend visibility settings
  - Performance optimized with useMemo for smooth rendering
  - Integrated with existing showGridlines toggle in View tab

## [2025-08-08] – Prompt 085

### Added

- **Today Button**
  - Added "Today" button in View tab ribbon Zoom group
  - Clicking it scrolls Gantt chart to center current date in viewport
  - Timeline uses zoomScale to calculate pixel offset accurately
  - Smooth scrolling animation with proper centering calculation
  - Respects weekend visibility settings when calculating position
  - Auto-resets highlight state after scrolling for clean UX
  - Works seamlessly with existing zoom controls and timeline features

## [Unreleased]

### Added

- **Prompt 083: Zoom to Fit Button**
  - Added "Zoom to Fit" button in View tab ribbon Zoom group
  - Automatically calculates optimal zoom level to fit all tasks in viewport
  - Calculates date range from earliest task start to latest task finish
  - Adds 10% padding on each side for better visual presentation
  - Button disabled when no tasks exist for better UX
  - Smooth zoom adjustment with proper bounds checking (0.3x to 3.0x)
  - Works seamlessly with existing zoom controls and timeline features

- **Prompt 082: Show Slack Toggle**
  - Added "Show Slack" toggle checkbox in View tab ribbon View group
  - Toggle state managed through ViewContext with localStorage persistence
  - Ready for integration with critical path calculation for float visualization
  - Immediate visual feedback when toggling slack visibility
  - Works seamlessly with existing timeline features and view toggles

- **Prompt 081: Show Critical Path Toggle**
  - Added "Show Critical Path" toggle checkbox in View tab ribbon View group
  - Implemented comprehensive critical path calculation utility with forward/backward pass
  - GanttChart highlights critical tasks with red styling when toggle is enabled
  - Critical path calculation considers task dependencies, durations, and lag times
  - Toggle state persisted to localStorage for session continuity
  - Immediate visual feedback when toggling critical path highlighting
  - Works seamlessly with existing timeline features and task management

- **Prompt 080: Show Gridlines Toggle**
  - Added "Show Gridlines" toggle checkbox in View tab ribbon View group
  - GanttChart now shows or hides gridlines based on user setting
  - Timeline container applies conditional Tailwind classes for grid visibility
  - Background grid pattern and task row borders controlled by toggle
  - Preference persisted to localStorage for consistency across sessions
  - Immediate visual feedback when toggling gridline visibility
  - Works seamlessly with existing timeline features and zoom levels

- **Prompt 079: Show Weekends Toggle**
  - Added "Show Weekends" toggle checkbox in View tab ribbon View group
  - GanttChart now filters weekend columns (Saturday & Sunday) based on user preference
  - Timeline positioning recalculates to skip weekend dates when toggle is off
  - Preference persisted to localStorage for session continuity
  - All timeline elements (tasks, baselines, today highlight) respect weekend filtering
  - Toggle state managed through ViewContext with proper initialization from saved preferences
  - Immediate visual feedback when toggling between weekend visibility modes
  - Works seamlessly with existing zoom levels and timeline navigation

- **Prompt 077: Advanced Filtering & Search**
  - Added comprehensive AdvancedSearch component with expandable filter interface
  - Implemented text search across task names, descriptions, and notes
  - Added filters for status, priority, assignee, date ranges, and progress
  - Support for dependency filtering (predecessors/successors) and milestone filtering
  - Real-time filtering with immediate results and active filter count display
  - Filter combination capabilities with clear all functionality
  - Results summary showing filtered vs total tasks

- **Prompt 076: Custom Fields & Metadata**
  - Created CustomFieldsManager component for defining custom fields
  - Support for multiple field types: text, number, date, select list, boolean
  - Field creation, editing, deletion with required/optional configuration
  - Select list options with dynamic add/remove capabilities
  - Integration with task editing and custom field value management
  - Table display of custom fields for all tasks with inline editing
  - Field validation and requirements enforcement

- **Prompt 075: Resource Calendar & Availability**
  - Added ResourceCalendar component with monthly calendar grid view
  - Resource workload visualization with color-coded availability levels
  - Individual resource filtering and "all resources" view
  - Task assignment display for each calendar day
  - Month navigation with previous/next controls
  - Workload legend (Available, Light, Moderate, Heavy) and statistics
  - Integration with ViewTab ribbon for easy access

- **Prompt 003: Task Linking**
  - Enhanced TaskContext with support for different link types (FS, SS, FF, SF)
  - Created comprehensive TaskLinkModal with task selection and link configuration
  - Added lag/lead time support for all link types
  - Enhanced GanttChart visualization with color-coded link types
  - Advanced link validation preventing circular dependencies
  - Link editing capabilities with update/delete functionality
  - Visual feedback with tooltips showing link type and lag information

- **Prompt 002: Task Properties Drawer**
  - Implemented comprehensive TaskPropertiesPane with real-time editing
  - All required fields: name, description, notes, dates, duration, progress
  - Status, priority, type selection with dropdown interfaces
  - Resource assignment and dependencies display
  - Save/Cancel functionality with change tracking and validation
  - Visual feedback for unsaved changes with warning indicators
  - Full integration with TaskContext for state management

- **Prompt 001: Home Ribbon Layout (Exact Asta Replica)**
  - Converted Editing group to Asta-style 3x3 grid layout without labels
  - Added compact mode to RibbonButton component
  - Proper icon sizing at 16px (w-4 h-4) as specified
  - Maintained labels for Clipboard group as per Asta design
  - Enhanced visual layout matching Asta Powerproject structure

- **Prompt 078: Implement "Go to Today" Button in Ribbon**
  - Added "Go to Today" button in View tab ribbon Zoom group with HomeIcon
  - GanttChart now scrolls and centers on current date with smooth animation
  - Today marker appears as yellow highlight column with pulsing animation
  - Automatically calculates today's position based on timeline zoom level
  - Works across all zoom levels (0.3x to 3x) with proper scaling
  - Includes accessibility features with aria-label and descriptive tooltip
  - Today highlight automatically disappears after 1 second animation
  - All operations logged to console for debugging and verification

- **Prompt 071: Implement "Delete Task" Functionality in the Ribbon**
  - Added "Delete Task" button in Home tab ribbon Task group with TrashIcon
  - Supports deletion of selected task and its children using existing deleteTask function
  - Button is automatically disabled when no task is selected for better UX
  - Integrates with existing undo/redo system from TaskContext
  - Properly removes tasks from both TaskGrid and SidebarTree with immediate UI updates
  - Includes safety checks and console logging for debugging
  - Maintains proper tree structure after deletion operations
  - All deletion operations logged to console for verification

- **Prompt 070: Implement "Insert Task Below" and "Insert Summary Task" Buttons in Ribbon**
  - Added "Insert Task Below" button in Home tab ribbon Insert group
  - Added "Insert Summary Task" functionality to existing Summary Bar button
  - New tasks inserted directly below selected row with default values (today's date, 1 day duration)
  - Summary task wraps selected tasks and groups them under a new parent task
  - Logic integrated into TaskContext state and re-renders TaskGrid correctly
  - Both functions support proper undo/redo functionality and state management
  - Insert Task Below automatically selects the newly created task for immediate editing
  - Summary Task creates hierarchical relationships and maintains proper task structure
  - All operations logged to console for debugging and verification

- **Prompt 069: Implement "Expand All" and "Collapse All" Buttons in Ribbon**
  - Added "Expand All" and "Collapse All" buttons to Home tab ribbon in Hierarchy group
  - Buttons now correctly trigger SidebarTree methods using useRef and useImperativeHandle
  - SidebarTree exposes expandAll() and collapseAll() functions for external control
  - Implemented proper prop passing through AppShell → RibbonTabs → HomeTab
  - Added ChevronDoubleDownIcon for Expand All and ChevronRightIcon for Collapse All
  - Buttons provide instant tree navigation for complex hierarchical structures
  - Improves workflow for navigating nested task groups and project hierarchies
  - All expand/collapse operations work with existing DnD and selection functionality

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

### 2025-08-07 19:44:45

- auto: Pre-commit hook update

### 2025-08-07 19:46:34

- auto: Pre-commit hook update

### 2025-08-07 19:55:27

- auto: Pre-commit hook update

### 2025-08-07 22:49:33

- auto: Pre-commit hook update

### 2025-08-07 22:55:50

- auto: Pre-commit hook update

### 2025-08-07 23:03:49

- auto: Pre-commit hook update

### 2025-08-07 23:17:03

- auto: Pre-commit hook update

### 2025-08-07 23:43:07

- auto: Pre-commit hook update

### 2025-08-07 23:49:41

- auto: Pre-commit hook update

### 2025-08-08 00:04:28

- auto: Pre-commit hook update

### 2025-08-08 02:55:16

- auto: Pre-commit hook update

### 2025-08-08 03:00:28

- auto: Pre-commit hook update

### 2025-08-08 03:03:54

- auto: Pre-commit hook update

### 2025-08-08 03:06:10

- auto: Pre-commit hook update

### 2025-08-08 03:07:17

- auto: Pre-commit hook update

### 2025-08-08 03:08:50

- auto: Pre-commit hook update

### 2025-08-08 03:11:34

- auto: Pre-commit hook update

### 2025-08-08 03:15:09

- auto: Pre-commit hook update

### 2025-08-08 03:32:26

- auto: Pre-commit hook update

### 2025-08-08 03:34:45

- auto: Pre-commit hook update

### 2025-08-08 11:07:47

- auto: Pre-commit hook update

### 2025-08-08 11:12:17

- auto: Pre-commit hook update

### 2025-08-08 11:15:30

- **Prompt 095**: Added diamond milestone rendering to Gantt chart for zero-day tasks
  - Milestones are now displayed as green diamond shapes instead of rectangular bars
  - Supports both `isMilestone: true` flag and zero duration tasks
  - Diamond markers are properly centered at the milestone date position
  - Includes hover and selection state styling (blue for selected/hovered)
  - Maintains all existing functionality (drag, tooltip, click events)

### 2025-08-08 11:46:29

- auto: Pre-commit hook update

### 2025-08-08 11:50:15

- **Prompt 096**: Critical path tasks now display as red bars on the Gantt timeline
  - Tasks with `isCritical: true` property are highlighted in red (`bg-red-600`)
  - Critical path tasks remain red even when hovered or selected
  - Critical path milestones display as red diamonds
  - Maintains existing critical path calculation logic as fallback

### 2025-08-08 11:52:45

- auto: Pre-commit hook update

### 2025-08-08 11:55:30

- **Prompt 097**: Added light grey background shading for weekends on Gantt chart
  - Saturday and Sunday columns now display with light grey background (`bg-gray-100`)
  - Weekend shading stretches full height behind tasks for clear visual distinction
  - Maintains existing weekend visibility toggle functionality

### 2025-08-08 12:05:45

- **Prompt 100**: Added horizontal row lines to Gantt for each task
  - Each task row now displays a light grey horizontal line beneath it
  - Lines use `border-gray-200` styling for subtle visual separation
  - Horizontal lines stretch full width of the Gantt area
  - Maintains existing grid line visibility toggle functionality

### 2025-08-08 12:00:19

- auto: Pre-commit hook update

### 2025-08-08 14:10:35

- auto: Pre-commit hook update

### 2025-08-08 14:15:30

- **Prompt 101**: Added vertical "Today" marker line to Gantt chart
  - Today's date is marked with a permanent red vertical line (`w-1 bg-red-500 z-50`)
  - Line position is calculated based on offset from timeline start using `new Date()`
  - Line renders full height of the Gantt chart for clear visibility
  - Includes tooltip showing today's date when hovered

### 2025-08-08 14:13:14

- auto: Pre-commit hook update

### 2025-08-08 14:20:45

- **Prompt 102**: Task bars now include labels with task names, styled like Asta
  - Task names are displayed inside Gantt bars with white text (`text-white text-xs font-medium`)
  - Text is truncated if too long to fit within the bar width
  - Labels only appear when bars are wide enough (>60px) for readability
  - Labels are centered within each task bar for clear identification

### 2025-08-08 14:17:49

- auto: Pre-commit hook update

### 2025-08-08 14:25:30

- **Prompt 104**: Gantt task bar resize now snaps to day-based grid columns
  - Added `snapToGrid()` function to ensure task bars snap to exact day boundaries
  - Task dragging now uses snapped values instead of raw pixel positions
  - Added helper functions `getDateFromX()` and `getXFromDate()` for future resize functionality
  - Each grid column represents exactly 1 day for precise date alignment

### 2025-08-08 14:20:50

- auto: Pre-commit hook update

### 2025-08-08 14:30:15

- **Prompt 105**: Enhanced Gantt task bar tooltip styling and content
  - Updated tooltip to use dark theme (`bg-gray-800 text-white`) for better visibility
  - Simplified tooltip content to show task name, date range, and duration in compact format
  - Improved tooltip positioning and styling with `text-xs px-2 py-1 rounded shadow-lg`
  - Tooltip now displays dates in "start – end" format for cleaner presentation

### 2025-08-08 14:27:03

- auto: Pre-commit hook update
