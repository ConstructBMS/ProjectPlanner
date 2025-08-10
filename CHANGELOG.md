# Changelog

All notable changes to the ProjectPlanner module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2025-08-08] – Prompt 096

### Added

- **Critical Path Task Highlighting in Red**
  - Critical path tasks now display as red bars on the Gantt timeline for visual distinction
  - Tasks with isCritical: true or those identified as critical path automatically use red styling
  - Red bars use bg-red-600 class with red borders and white text for maximum visibility
  - Progress indicators for critical tasks also use red coloring (bg-red-400) for consistency
  - Critical path styling remains consistent even during hover, selection, and linking states
  - Milestone diamonds for critical tasks maintain red coloring (text-red-600)
  - Enhanced visual hierarchy making critical path tasks immediately identifiable
  - Integrated with existing critical path calculation and display logic

## [2025-08-08] – Prompt 097

### Added

- **Weekend Background Shading in Gantt Chart**
  - Added light grey background shading for weekends (Saturdays and Sundays) on Gantt timeline
  - Weekend blocks use bg-gray-100 class for subtle visual distinction
  - Blocks stretch full height behind tasks with proper z-index layering (z-0)
  - Weekend highlighting respects the showWeekends toggle setting
  - Blocks render dynamically based on timeline zoom scale and date range
  - Enhanced visual clarity making weekend days easily identifiable
  - Integrated with existing grid lines and background rendering system

## [2025-08-08] – Prompt 098

### Added

- **Task Dependency Arrows in Gantt Chart**
  - Task dependency arrows now render between tasks with predecessors
  - Implements Finish-to-Start logic with arrows from predecessor end to successor start
  - Uses SVG lines positioned between task bar midpoints for clear visual connections
  - Arrowhead markers provide directional indication for dependency flow
  - Supports both taskLinks and predecessor-based dependencies
  - Interactive tooltips show dependency relationships and link types
  - Proper z-index layering ensures arrows appear behind task bars
  - Integrated with existing task positioning and timeline scaling

## [2025-08-08] – Prompt 099

### Added

- **Task Selection and Highlighting in Gantt Chart**
  - Tasks are now clickable and highlight when selected
  - Selected tasks display with yellow border (border-2 border-yellow-400) and glow effect (shadow-md shadow-yellow-300)
  - Task selection state is managed via React state and TaskContext
  - Clicking on empty space clears task selection
  - Selected task names are highlighted with yellow text and bold font
  - Selection works for both regular task bars and milestone diamonds
  - Integrated with existing linking mode and drag functionality
  - Visual feedback provides clear indication of currently selected task

## [2025-08-08] – Prompt 100

### Added

- **Horizontal Grid Lines per Task Row in Gantt Chart**
  - Added horizontal row lines to Gantt for each task
  - Each task row displays a light grey horizontal line beneath it using border-b border-gray-200
  - Lines stretch full width of the Gantt area for consistent row alignment
  - Grid lines respect the showGridlines toggle setting
  - Lines render dynamically based on task count and row height (32px spacing)
  - Proper z-index layering ensures lines appear behind task bars
  - Enhanced visual clarity for task row separation and alignment
  - Integrated with existing grid lines system for unified grid control

## [2025-08-08] – Prompt 101

### Added

- **Vertical "Today" Marker Line in Gantt Chart**
  - Added vertical "Today" marker line to Gantt chart
  - Red vertical line (w-1 bg-red-500) marks today's date on the timeline
  - Line only renders when today's date is within the visible timeline range
  - Position calculated based on offset from timeline start using new Date()
  - High z-index (z-50) ensures line appears above all other elements
  - Respects weekend visibility toggle for accurate positioning
  - Dynamic positioning updates with timeline zoom scale changes
  - Integrated with existing grid lines system for unified display control

## [2025-08-08] – Prompt 102

### Added

- **Task Name Labels Inside Gantt Bars**
  - Task bars now include labels with task names, styled like Asta
  - Task names displayed centered inside each Gantt bar for clear identification
  - White text styling (text-white text-xs font-medium) for optimal readability
  - Text truncation (truncate) prevents overflow on narrow bars
  - Conditional visibility - labels only show when bars are wide enough (>60px)
  - Proper padding (px-1) ensures text doesn't touch bar edges
  - Non-interactive labels (pointer-events-none) prevent interference with bar interactions
  - Integrated with existing task bar styling and hover/selection states

## [2025-08-08] – Prompt 103

### Added

- **Task Bar Resize Handles for Start/End Date Adjustment**
  - Added left/right drag handles to Gantt task bars
  - Resize handles (w-2 bg-white cursor-ew-resize) appear on left and right edges of task bars
  - Handles only visible when task is hovered or selected for clean interface
  - Left handle adjusts task start date, right handle adjusts task end date
  - Visual feedback with white background, borders, and rounded corners
  - Helpful tooltips guide users on drag functionality
  - Proper cursor indication (cursor-ew-resize) for resize operations
  - Integrated with existing task selection and hover states

## [2025-08-08] – Prompt 104

### Added

- **Grid Snapping for Task Bar Resizing**
  - Gantt task bar resize now snaps to day-based grid columns
  - Resize handles snap to exact day units using grid snapping logic
  - Each column represents 1 day with precise day-based positioning
  - Helper functions getDateFromX() and getXFromDate() for accurate date conversion
  - Snap logic rounds to nearest date index for consistent day alignment
  - Weekend handling respects showWeekends toggle for accurate positioning
  - Real-time visual feedback during resize operations with grid snapping
  - Integrated with existing task dragging and date management system

## [2025-08-08] – Prompt 105

### Added

- **Enhanced Task Tooltip on Gantt Bar Hover**
  - Gantt bars now show tooltip with task details on hover
  - Tooltip displays task name, start date, end date, and duration in days
  - Sophisticated dark theme styling with proper spacing and borders
  - Tooltip positioned near mouse cursor for optimal user experience
  - Special indicators for milestones and critical tasks
  - Smooth transitions and animations for professional appearance
  - High z-index ensures tooltip appears above all other elements
  - Integrated with existing hover state management and task interactions

## [2025-08-08] – Prompt 106

### Added

- **Critical Path Toggle and Red Task Bar Highlighting**
  - Added critical path toggle button and styling for critical tasks in Gantt chart
  - "Show Critical Path" toggle button in Home ribbon Status group
  - Critical tasks display with red bars (bg-red-600) instead of blue when toggle is active
  - Toggle button shows visual feedback with blue background when enabled
  - Critical path calculation integrates with task dependencies and links
  - Tooltip includes "Critical Task" indicator for critical path tasks
  - Toggle state persists across view changes and component updates
  - Integrated with existing task styling and selection system

## [2025-08-08] – Prompt 107

### Added

- **Expand Milestones Button in Home Ribbon**
  - Added 'Expand Milestones' ribbon button and milestone expansion logic
  - "Expand Milestones" button in Home ribbon View group with flag icon
  - Single-click expands all milestone tasks in the programme tree
  - Loops through all tasks and sets isExpanded = true for milestone tasks
  - Supports both task.type === 'milestone' and task.isMilestone flags
  - Integrated with existing task state management and hierarchy system
  - Helpful tooltip explains the milestone expansion functionality
  - Works seamlessly with existing expand/collapse all functionality

## [2025-08-08] – Prompt 108

### Added

- **Milestone Diamond Icons in Gantt and Programme Tree**
  - Added milestone diamond icons in Gantt and Programme Tree
  - Diamond-shaped SVG icons visually distinguish milestones from regular tasks
  - Gantt chart renders diamond icons instead of bars for milestone tasks
  - SidebarTree displays diamond icons next to milestone task names
  - Purple color scheme (text-purple-600/text-purple-500) for consistent styling
  - Proper sizing (w-4 h-4) for optimal visibility and alignment
  - Supports both task.type === 'milestone' and task.isMilestone flags
  - Dynamic color changes based on selection, hover, and critical path states
  - Integrated with existing task styling and interaction systems

## [2025-08-08] – Prompt 109

### Added

- **Calendar Week Headers in Gantt Timeline**
  - Gantt chart now includes calendar week headers (e.g. W32)
  - Week headers display above daily columns in Day view mode
  - Uses ISO week numbering system for accurate calendar weeks
  - Styled with text-xs text-gray-600 bg-gray-100 py-1 border-b
  - Week headers span the full width of their respective weeks
  - Only visible in Day view mode for optimal user experience
  - Proper positioning and alignment with existing timeline headers
  - Integrated with weekend visibility settings
  - Enhanced timeline navigation and week identification

## [2025-08-08] – Prompt 110

### Added

- **Non-Working Days Shading in Gantt Timeline**
  - Added grey background shading for non-working weekend days in Gantt
  - Weekend days (Saturday/Sunday) display with subtle grey background
  - Styled with bg-gray-200 opacity-60 for optimal visibility
  - Background layers positioned absolutely behind task bars (z-0)
  - Width automatically adjusts to timeline zoom scale
  - Integrated with existing weekend visibility toggle
  - Enhances task planning visibility and timeline readability
  - Professional appearance matching Asta PowerProject style

## [2025-08-08] – Prompt 111

### Added

- **Today Line Marker in Gantt Chart**
  - Added vertical "Today" marker in Gantt chart
  - Red vertical line (w-[2px] bg-red-600) indicates current date
  - Positioned absolutely with z-50 for high visibility
  - Automatically calculates position based on timeline date range
  - Always visible regardless of gridlines setting
  - Handles weekend visibility settings correctly
  - Enhances timeline navigation and current date awareness
  - Professional styling matching Asta PowerProject appearance

## [2025-08-08] – Prompt 112

### Added

- **Project Start/End Date Ribbon Display**
  - Added dynamic project start/end display to ribbon
  - Project Status group shows current project dates in Home tab
  - Displays format: "📅 Start: 12 Aug 2025 | End: 17 Oct 2025"
  - Automatically calculates dates from first task's startDate and last task's endDate
  - Real-time updates as project tasks are modified
  - Professional styling with calendar emoji and proper date formatting
  - Integrated seamlessly into existing ribbon interface
  - Enhances project overview and timeline awareness

## [2025-08-08] – Prompt 113

### Added

- **"Go to Today" Gantt Scroll Button**
  - Added "Go to Today" Gantt scroll button to ribbon
  - Clock icon button in Home tab Zoom group
  - Smooth scrolls Gantt chart to today's date when clicked
  - Centers today's date in the viewport for optimal visibility
  - Uses ref.scrollLeft technique with smooth scrolling behavior
  - Handles weekend visibility settings correctly
  - Integrated with existing view state management
  - Enhances timeline navigation and current date awareness

## [2025-08-08] – Prompt 114

### Added

- **Gantt Zoom In/Out Controls**
  - Added Gantt zoom in/out buttons with adjustable scale
  - Zoom In/Out buttons in Home tab Zoom group with magnifying glass icons
  - Adjustable timeline scale from 10px to 100px per day
  - Default zoom level of 20px per day for optimal visibility
  - Zoom increments of 10px per click for precise control
  - State persistence with localStorage for user preferences
  - Real-time scaling of timeline headers, task bars, and grid elements
  - Integrated with existing view state management system
  - Professional zoom controls matching Asta PowerProject interface

## [2025-08-08] – Prompt 115

### Added

- **Task Row Numbering in Programme Tree**
  - Added 1-based row numbering in the Programme Tree
  - Row numbers displayed as 1, 2, 3... matching Asta style
  - Numbers positioned before task indentation for clear alignment
  - Styled with text-sm text-gray-400 pr-2 for subtle appearance
  - Dynamic numbering that updates when tree is expanded/collapsed
  - Only visible nodes are numbered (respects tree expansion state)
  - Integrated seamlessly with existing tree structure and styling
  - Enhances task identification and navigation in Programme Tree

## [2025-08-08] – Prompt 116

### Added

- **Expand/Collapse All Button in Sidebar Tree**
  - Added ribbon toggle to expand/collapse all task groups in Sidebar Tree
  - "Expand/Collapse All" button in Home tab Hierarchy group with double arrow icon
  - Toggle button with dynamic icon (ChevronDoubleDownIcon/ChevronRightIcon)
  - Visual feedback with blue background when all items are expanded
  - Proper tooltips: "Expand all groups and tasks in the tree" / "Collapse all groups and tasks in the tree"
  - Integrated with SidebarTree ref system for direct control
  - Recursively expands/collapses all hierarchical task groups
  - Maintains programme root node expanded state when collapsing
  - Professional toggle functionality matching Asta PowerProject interface

## [2025-08-08] – Prompt 117

### Added

- **Task Duration Column in Task Grid**
  - Added calculated Duration column to Task Grid
  - Duration column displays working days between start and end dates
  - Shows format: "12d" (number + "d" suffix) for clear readability
  - Uses calculateWorkingDays function to skip weekends in calculations
  - Column width optimized at 64px (w-16) with center alignment
  - Supports inline editing with double-click functionality
  - Proper validation for duration input (positive numbers only)
  - Integrated seamlessly with existing Task Grid structure
  - Professional appearance matching Asta PowerProject interface

## [2025-08-08] – Prompt 118

### Added

- **Task Bar Hover Tooltip with Dates**
  - Added comprehensive tooltip system for Gantt task bars
  - Tooltip displays on hover with task name and complete date range
  - Content includes: Task name, Start date, End date, Duration in days
  - Additional indicators for Milestones and Critical Tasks
  - Professional dark theme styling with fade-in transition
  - Positioned dynamically near mouse cursor with proper z-index
  - Format: "Task: Pour Concrete", "Start: 12 Aug 2025", "End: 19 Aug 2025"
  - Smooth transition effects with duration-200 class
  - Non-intrusive design with pointer-events-none
  - Integrated with existing hover state management system

## [2025-08-08] – Prompt 119

### Added

- **Critical Path Highlighting Toggle**
  - Added ribbon toggle for critical path highlighting in Gantt chart
  - "Show Critical Path" button in Home tab Status group with ExclamationTriangleIcon
  - Toggle button with visual feedback (blue background when active)
  - Professional tooltip: "Toggle visibility of the project's critical path"
  - Critical path calculation using dependency data and CPM algorithm
  - Critical tasks highlighted with red styling: bg-red-600 opacity-70
  - Tasks with zero slack (any delay impacts project end date) are identified
  - Forward/backward pass algorithm for accurate critical path computation
  - Persistent state management with localStorage integration
  - Integrated with existing task bar styling system
  - Professional appearance matching Asta PowerProject interface

## [2025-08-08] – Prompt 120

### Added

- **Milestone Icon in Task Rows**
  - Added milestone diamond icon to task rows in both Task Grid and Sidebar Tree
  - Visual indicator for tasks flagged as milestone: true or type: 'milestone'
  - Purple diamond icon (text-purple-500) positioned before task name
  - Consistent implementation across TaskGrid.jsx and SidebarTree.jsx
  - SVG diamond icon with proper sizing (w-4 h-4) and styling
  - Integrated with existing task type detection system
  - Professional appearance matching Asta PowerProject interface
  - Clear visual distinction between milestones, groups, and regular tasks
  - Maintains existing icon hierarchy (milestone > group > regular task)

## [2025-08-08] – Prompt 121

### Added

- **Right-Click Context Menu on Task Rows**
  - Added comprehensive right-click context menu to Task Grid rows
  - Context menu opens on right-click with task-specific options
  - Menu positioned absolutely near cursor with z-50 layering
  - Required options: Edit Task (📝), Delete Task (❌), Add Subtask (➕)
  - Additional options: Link To, Mark as Milestone, Expand/Collapse All
  - Professional styling with hover effects and proper spacing
  - Auto-close on outside click or Escape key press
  - Screen boundary detection prevents menu from going off-screen
  - Integrated with existing task management functions
  - Professional appearance matching Asta PowerProject interface

## [2025-08-08] – Prompt 122

### Added

- **Inline Editing for Task Names in Grid**
  - Enabled double-click inline editing for task names in Task Grid
  - Double-click on task name switches to editable input field
  - Save changes on Enter key or blur event with validation
  - Revert changes on Escape key press
  - Input field with blue border and focus ring styling
  - Validation prevents empty task names
  - Auto-focus on input field when editing starts
  - Seamless integration with existing task state management
  - Professional appearance matching Asta PowerProject interface

## [2025-08-08] – Prompt 123

### Added

- **Auto-Snap Gantt Bars to Workdays**
  - Gantt bars now snap to working weekdays and skip weekends
  - Enhanced drag logic prevents weekend misalignment
  - snapToWeekday function moves Saturday to Friday, Sunday to Monday
  - Visual weekend highlighting with grey background (bg-gray-200 opacity-60)
  - Date conversion functions respect workday-only calculations
  - Resize handles also snap to weekdays for consistent behavior
  - Professional workday-only scheduling logic
  - Integrated with existing showWeekends toggle functionality

## [2025-08-08] – Prompt 124

### Added

- **Vertical Daily Grid Lines in Gantt Chart**
  - Added vertical daily grid lines to Gantt chart for improved timeline readability
  - 1px border lines rendered for each day column in the timeline
  - Alternating light grey lines with different opacity levels for visual hierarchy
  - Grid lines respect showWeekends toggle and view scale settings
  - Daily lines (grid-day), weekly lines (grid-week), and monthly lines (grid-month)
  - Professional styling with rgba(0, 0, 0, 0.08) to rgba(0, 0, 0, 0.25) opacity
  - Integrated with existing showGridlines toggle functionality
  - Background rendering with pointer-events-none for non-intrusive interaction

## [2025-08-08] – Prompt 125

### Added

- **View Scale Dropdown in Ribbon**
  - Added ribbon dropdown to change Gantt view scale (Day/Week/Month)
  - ViewScaleDropdown component in ViewTab with Day, Week, Month options
  - Dropdown positioned in Timeline Zoom group with professional styling
  - Gantt rendering adapts to selected granularity:
    - Day: 1 column per day with daily headers
    - Week: 1 column per week with week numbers (W32, W33)
    - Month: 1 column per month with month names (Aug 2025)
  - Integrated with ViewContext for persistent state management
  - Professional dropdown styling with hover effects and click-outside-to-close
  - Seamless integration with existing timeline zoom and grid line systems

## [2025-08-08] – Prompt 126

### Added

- **Critical Path Highlight Toggle in Gantt**
  - Added "Highlight Critical Path" toggle in ViewTab ribbon
  - ShowCriticalPathToggle component with checkbox interface
  - Highlights the longest dependency chain in red on Gantt chart
  - Critical path tasks display with red styling: bg-red-600 opacity-70
  - Advanced CPM algorithm with forward/backward pass for accurate calculation
  - Identifies tasks with zero float (any delay impacts project duration)
  - Toggle off removes critical path highlighting
  - Integrated with existing task bar styling and selection systems
  - Professional appearance matching Asta PowerProject interface

## [2025-08-08] – Prompt 127

### Added

- **Milestone Task Type and Diamond Gantt Icons**
  - Added support for Milestone task type and diamond Gantt icons
  - task.type = 'milestone' support with legacy isMilestone compatibility
  - DiamondIcon component with SVG diamond shape (rotated square)
  - Milestones render as diamond icons at task start date in Gantt chart
  - Tooltip displays task title on milestone hover
  - Milestone dropdown in Task Properties Panel (Task/Milestone selection)
  - Professional diamond styling with color variations for different states
  - Integrated with existing task selection, critical path, and hover systems
  - Seamless compatibility with existing task management workflows

## [2025-08-08] – Prompt 128

### Added

- **Dependencies Sidebar Panel in Task Properties**
  - Added comprehensive Dependencies section to Task Properties Pane
  - Shows predecessors and successors with task names and lag values
  - Editable lag input fields for +/- days (range: -365 to +365)
  - "Add Dependency" button with modal for creating new task links
  - Remove dependency functionality with trash icon buttons
  - Real-time auto-update of Gantt chart links
  - Professional styling with hover effects and validation
  - Link type display (FS, SS, FF, SF) with lag/lead indicators
  - Empty state messages for no predecessors/successors
  - Integrated with existing task linking and unlinkTasks systems

## [2025-08-08] – Prompt 129

### Added

- **Drag-to-Link Dependency Mode in Gantt Chart**
  - Enabled intuitive drag-to-link feature for creating task dependencies
  - Click and drag from right 20% of task bar to start linking
  - Real-time visual connector line with dashed stroke and arrowhead
  - Drop on target task to create Finish-to-Start (FS) dependency
  - Automatic dependency creation with lag: 0 via linkTasks() function
  - Prevents self-linking and validates target task existence
  - Professional blue styling (#3B82F6) with high z-index visibility
  - Status indicator in timeline header during drag operations
  - Seamless integration with existing dependency management system
  - Auto-refresh of dependencies panel and Gantt arrow connectors

## [2025-08-08] – Prompt 130

### Added

- **Delete Task with Optional Cascade Dependency Removal**
  - Added comprehensive Delete Task functionality with cascade options
  - Delete button available in TaskPropertiesPane, context menus, TaskGrid, and HomeTab ribbon
  - Professional DeleteTaskModal with confirmation and impact analysis
  - "Also delete dependent tasks?" checkbox for cascade deletion
  - Recursive dependency detection and removal with visited tracking
  - Automatic descendant task removal (child tasks)
  - Impact analysis showing dependent and descendant task counts
  - Total tasks to delete counter with dynamic button text
  - Comprehensive cleanup of tasks, links, and selections
  - Professional modal design with color-coded information sections
  - Seamless integration with existing task management and undo systems

## [2025-08-09] – Prompt 131

### Added

- **Dual-Row Sticky Gantt Header (Months over Days)**
  - Implemented dual-row timeline header with months over days layout
  - Top row shows month and year blocks spanning total days per month
  - Bottom row shows individual day cells (01-31) with weekend styling
  - Sticky positioning with position: sticky, top: 0, z-50 above grid content
  - Horizontal scroll synchronization with Gantt body via shared scrollLeft
  - Respects current zoomScale and showWeekends settings
  - Professional styling with proper borders, shadows, and typography
  - Weekend days styled with gray text and background when showWeekends enabled
  - Seamless integration with existing Gantt chart scrolling and zoom functionality
  - Optimized performance with useMemo for header generation

## [2025-08-09] – Prompt 132

### Added

- **Baseline 1 Capture/Clear and Ghost Bars**
  - Added Set Baseline and Clear Baseline buttons in ProjectTab ribbon
  - Implemented setBaseline1() and clearBaseline1() functions in TaskContext
  - Baseline bars render as thin gray ghost bars beneath live task bars
  - Show Baseline toggle in ViewTab for visibility control
  - Baseline bars positioned slightly below actual bars with opacity-50 styling
  - Enhanced tooltips show baseline vs actual dates when baseline exists
  - Baseline data persists in task objects (baselineStart, baselineEnd)
  - Professional styling with proper contrast and visual hierarchy
  - Seamless integration with existing task management and undo systems

## [2025-08-09] – Prompt 133

### Added

- **Drag/Resize Constraints with Visual Feedback**
  - Enforced minimum 1-day duration for regular tasks (milestones can have 0 days)
  - Respect FS (Finish-to-Start) dependencies with lag consideration
  - Prevent negative durations and invalid date ranges
  - Workday clamping respects showWeekends setting
  - Visual constraint warnings with red pulsing border for 2 seconds
  - Automatic snapping to nearest valid date when constraints are violated
  - Enhanced scheduleUtils.js with constraint validation functions
  - Real-time constraint checking during drag and resize operations
  - Professional error handling with graceful fallbacks

## [2025-08-09] – Prompt 134

### Added

- **Working Calendar System with Global and Per-Task Calendars**
  - Global working calendar with configurable working days (Mon-Sun)
  - Holiday management with add/remove functionality
  - Per-task calendar override with checkbox toggle
  - Task-specific working days and holiday configuration
  - Calendar-aware date calculations (addWorkdays, diffWorkdays, snapToWorkday)
  - Non-working day highlighting in Gantt chart based on calendar
  - Calendar persistence in localStorage
  - Professional calendar management UI in Task Properties
  - Seamless integration with existing drag/resize constraints
  - Calendar validation and error handling

## [2025-08-09] – Prompt 135

### Added

- **Unified Multi-Select System Across Grid and Gantt Views**
  - Ctrl/Cmd+Click: toggle individual task selection
  - Shift+Click: select range from last anchor to clicked item
  - Centralized selection state management with SelectionContext
  - Synchronized selection between TaskGrid and GanttChart views
  - Visual feedback with blue highlighting (bg-blue-50 ring-1 ring-blue-300)
  - Gantt bar selection styling with ring-2 ring-blue-400 border-blue-500
  - Keyboard support: Escape key clears all selection
  - Selection anchor tracking for range selection
  - Professional multi-select behavior matching industry standards
  - Seamless integration with existing linking and editing modes

## [2025-08-09] – Prompt 136

### Added

- **Quick Filters Dropdown in View Tab**
  - Status filter: All, Not Started, In Progress, Completed, Delayed, On Hold, Cancelled
  - Resource filter: dynamic list of assigned resources from tasks
  - Date range filter: show only tasks overlapping selected range
  - Collapsible sections for each filter type
  - Active filter count indicator with badge
  - Clear All Filters button for quick reset
  - Filter persistence in localStorage
  - Instant application to both Grid and Gantt views
  - Professional dropdown UI with expandable sections
  - Filter status display in dropdown footer

## [2025-08-09] – Prompt 137

### Added

- **Layout Presets System for UI Configuration**
  - Save current layout as named presets (column widths, pane sizes, visible columns)
  - Load saved presets with instant application
  - Delete individual presets with confirmation
  - Reset to default layout functionality
  - Layout persistence in localStorage
  - Dynamic column width management with minimum constraints
  - Pane size configuration for sidebar, properties, and Gantt areas
  - Column visibility toggling for all available columns
  - Professional preset management UI with save/load dropdowns
  - Preset metadata including creation dates and names
  - Comprehensive layout state management with LayoutContext

## [2025-08-09] – Prompt 138

### Added

- **Print & PDF Export System with Advanced Options**
  - PDF export using jsPDF and html2canvas for high-quality output
  - Print functionality with custom print styles and headers
  - Date range filtering for export content
  - Scale options: fit to page width/height or custom percentage (25-200%)
  - Page orientation selection (Portrait/Landscape)
  - Content selection: include/exclude Grid, Gantt, and Properties panes
  - Customizable margins (0-50mm) for all sides
  - Professional export dialog with comprehensive options
  - Automatic header generation with project name and date
  - Multi-page PDF support for large content
  - Print window with proper styling and color preservation
  - Export progress indicators and error handling

## [2025-08-09] – Prompt 139

### Added

- **Resource Data Columns in TaskGrid**
  - Work column: displays total assigned hours with "h" suffix
  - Cost column: shows calculated cost in £ with proper currency formatting
  - Units column: displays average allocation percentage with "%" suffix
  - Live calculation updates when resource assignments change
  - Right-aligned formatting for numerical values
  - Integration with existing column visibility and width management
  - Support for sorting by resource columns
  - Graceful handling of missing resource assignment data
  - Professional formatting with decimal precision (1 decimal place)
  - Currency formatting using locale-specific number formatting

## [2025-08-09] – Prompt 140

### Added

- **Marquee Selection in Gantt Chart**
  - Click-drag selection box (marquee) for multi-select tasks visually
  - Semi-transparent blue selection rectangle during drag operation
  - Collision detection: selects all task bars intersecting with marquee bounds
  - Modifier key support: Shift/Ctrl/Cmd for additive selection
  - Automatic selection clearing when not using modifier keys
  - Real-time visual feedback during drag operation
  - Integration with existing multi-selection system
  - Proper event handling to prevent conflicts with task dragging
  - High z-index overlay to ensure visibility above other elements
  - Responsive selection box that adapts to drag direction

## [2025-08-09] – Prompt 141

### Added

- **Global Undo/Redo System for Task & Resource Modifications**
  - Comprehensive undo/redo stack for all task and resource changes
  - Support for task add/edit/delete operations with full state restoration
  - Resource assignment changes with proper undo/redo functionality
  - Dependency link creation and removal with state management
  - Baseline operations (set/clear baseline) with undo support
  - Task grouping and ungrouping with hierarchical state preservation
  - Stack size limit of 50 actions to prevent memory issues
  - Keyboard shortcuts: Ctrl+Z for undo, Ctrl+Y or Ctrl+Shift+Z for redo
  - Visual feedback in Home tab with disabled state for unavailable actions
  - Integration with existing task management system
  - Proper state isolation to prevent undo/redo loops
  - Action-based undo system with before/after state snapshots
  - Automatic redo stack clearing when new actions are performed

## [2025-08-09] – Prompt 142

### Added

- **Task History Panel with Timestamped Change Logs**
  - New "History" tab in Task Properties Pane for tracking all changes
  - Comprehensive change logging with timestamps and user attribution
  - Automatic history entry creation for task property modifications
  - Dependency link creation and removal tracking with task relationships
  - Formatted display of before/after values for all field changes
  - Reverse chronological order display (newest changes first)
  - Integration with Undo/Redo system to prevent duplicate entries
  - Professional UI with scrollable history list and empty state
  - Date/time formatting using locale-specific display
  - Field-specific value formatting (dates, booleans, text)
  - User attribution for all changes (placeholder for future user system)
  - History persistence in task.history[] array

## [2025-08-09] – Prompt 143

### Added

- **Resource Histogram View with Stacked Allocation Chart**
  - Interactive histogram chart showing resource allocation over time
  - Chart.js integration with stacked bar chart visualization
  - X-axis timeline with day/week/month scale options
  - Y-axis percentage allocation (0-100%)
  - Stacked bars by resource with unique color coding
  - Hover tooltips showing resource name and allocation percentage
  - Automatic data updates on schedule and resource changes
  - Modal view accessible from View tab Resource group
  - Responsive design with professional styling
  - Summary statistics (peak and average allocation)
  - Empty state with helpful messaging
  - Click interaction for future navigation integration
  - Integration with existing view scale system

## [2025-08-09] – Prompt 144

### Added

- **Gantt Time Units Toggle (Days, Weeks, Months)**
  - Time unit toggle buttons in View tab for switching between days, weeks, and months
  - Dynamic X-axis scaling based on selected time unit
  - Automatic recalculation of gridlines and date labels
  - Persistent time unit setting stored in localStorage
  - Integration with existing view context and state management
  - Proper scaling calculations for different time units (day=1x, week=7x, month=30x)
  - Updated timeline headers with appropriate date formatting
  - Responsive grid line generation based on time unit
  - Maintained compatibility with existing zoom and weekend settings
  - Professional UI with active state indication
  - Automatic updates to task positioning and sizing

## [2025-08-09] – Prompt 145

### Added

- **Custom Bar Colors by Task Type**
  - Color picker in Task Properties Pane for setting custom bar colors
  - Default colors per task type (blue for tasks, green for groups, purple for milestones)
  - React-color SketchPicker integration with preset color palette
  - Custom colors stored in task object as color property
  - Gantt chart renders tasks with stored custom colors
  - Automatic fallback to default colors when no custom color is set
  - Reset button to restore default color for task type
  - Color preview in properties pane with visual indicator
  - Professional color picker UI with click-outside-to-close functionality
  - Integration with existing task editing and history tracking
  - Proper opacity and border styling for visual hierarchy

## [2025-08-09] – Prompt 149

### Added

- **Baseline Comparison View (Variance Columns & Bars)**
  - Grid columns for Start Variance, Finish Variance, and Duration Variance
  - Color-coded variance indicators (green for ahead, red for behind, blue for on-track)
  - Baseline bars in Gantt chart with slim gray overlay
  - Variance connector lines showing drift between baseline and actual end dates
  - Enhanced tooltips with baseline vs actual comparison data
  - Automatic variance calculations with proper date handling
  - Integration with existing baseline functionality from Prompt 132
  - Professional variance formatting (+5d, -2d, 0d)
  - Visual indicators for tasks with and without baseline data
  - Comprehensive baseline performance analysis utilities

## [2025-08-09] – Prompt 147

### Added

- **Auto-Scheduling Engine (Forward/Backward Pass)**
  - Complete scheduling engine with forward and backward pass algorithms
  - Support for all link types: FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), SF (Start-to-Finish)
  - Positive and negative lag support for all link types
  - Automatic date recalculation when dependencies or durations change
  - Calendar-aware scheduling respecting non-working days
  - Critical path calculation with total and free float analysis
  - Circular dependency detection and validation
  - Real-time auto-scheduling with configurable triggers
  - Manual scheduling controls in Project tab
  - Comprehensive error handling and validation
  - Integration with existing task and calendar systems
  - Debounced scheduling to prevent excessive recalculations
  - Professional scheduling statistics and reporting

## [2025-08-09] – Prompt 148

### Added

- **Resource Leveling (Simple Heuristic)**
  - Basic resource leveling engine that detects over-allocations by day
  - Shifts non-critical tasks within their float to resolve resource conflicts
  - Preserves critical path by only shifting tasks with available float
  - Calendar-aware leveling respecting working days and dependencies
  - Preview functionality showing proposed task shifts before applying
  - Integration with auto-scheduling to recalculate dates after leveling
  - Resource conflict detection with capacity vs allocation comparison
  - Professional leveling statistics and conflict reporting
  - Allocation tab in ribbon with leveling controls and preview panel
  - Comprehensive error handling and validation
  - Support for multiple resource types with different capacities
  - Automatic conflict resolution prioritization (highest over-allocation first)

## [2025-08-09] – Prompt 150

### Added

- **Progress Line (Status Date)**
  - Status date picker in View tab with default to today
  - Vertical progress line at status date across Gantt chart
  - Task progress indicators showing ahead/behind schedule status
  - Schedule Status column in grid with color-coded status badges
  - Ahead schedule indicators (green ticks/segments)
  - Behind schedule indicators (red segments to planned location)
  - On-track indicators (blue dots at expected position)
  - Progress line utilities for status calculation and positioning
  - Integration with existing calendar and task systems
  - Professional status styling with icons and tooltips
  - Real-time status updates based on task progress vs expected progress

## [2025-08-09] – Prompt 151

### Added

- **Advanced Constraint Handling**
  - Complete constraint engine supporting all Asta-style constraints
  - Constraint types: ASAP, ALAP, Must Start On, Must Finish On, Start No Earlier Than, Finish No Later Than
  - Constraint configuration in Task Properties pane with date picker
  - Real-time constraint validation with error and warning display
  - Visual constraint indicators in Gantt chart with colored borders
  - Constraint information in task tooltips with detailed descriptions
  - Constraint conflict detection for dependencies and calendars
  - Professional constraint styling with icons and color coding
  - Integration with existing scheduling and calendar systems
  - Comprehensive constraint utilities for validation and formatting

## [2025-08-09] – Prompt 152

### Added

- **Per-Task Calendar Overrides**
  - Task calendar dropdown in Task Properties pane with project calendar list
  - Support for assigning unique calendars to individual tasks
  - Automatic duration recalculation based on selected calendar
  - Enhanced scheduling engine with task-specific calendar support
  - Visual calendar information display with working days and holidays
  - Integration with existing constraint and scheduling systems
  - Professional calendar management with predefined calendar types
  - Real-time calendar validation and conflict detection
  - Comprehensive calendar utilities for task-specific scheduling

## [2025-08-09] – Prompt 153

### Added

- **Task Deadline Tracking**
  - Deadline date picker in Task Properties pane with status display
  - Visual deadline markers in Gantt chart with color-coded status
  - Deadline warning icons in task grid and Gantt chart
  - Comprehensive deadline status calculation (overdue, approaching, on-track)
  - Deadline information in task tooltips with detailed status
  - Deadline column in task grid with status badges and icons
  - Professional deadline utilities for status calculation and formatting
  - Real-time deadline validation and warning system
  - Integration with existing task management and scheduling systems

## [2025-08-09] – Prompt 154

### Added

- **Critical Path Highlighting**
  - Critical path calculation using CPM (Critical Path Method) algorithm
  - Toggle in View tab to highlight critical path tasks
  - Red bar styling for critical path tasks in Gantt chart
  - Automatic critical path recalculation after schedule changes
  - Critical path column in task grid with status indicators
  - Critical path information in task tooltips with float details
  - Professional critical path utilities for calculation and styling
  - Integration with existing scheduling engine and task management
  - Real-time critical path updates and visual feedback

## [2025-08-09] – Prompt 155

### Added

- **Slack/Float Calculation**
  - Total float and free float columns in Task Grid with color-coded status
  - Float values displayed in days with professional formatting
  - Optional float display in Gantt bars as small labels for low float tasks
  - Float information in task tooltips with detailed explanations
  - Professional float utilities for calculation, formatting, and styling
  - Real-time float updates during schedule calculations
  - Integration with existing critical path and scheduling systems
  - Comprehensive float status indicators and visual feedback

## [2025-08-09] – Prompt 156

### Added

- **Task Splitting**
  - Context menu option to split tasks into multiple segments with gaps
  - Professional task segment management with validation and error handling
  - Split task segments displayed as separate bars in Gantt chart with gaps
  - Task splitting modal with segment editing, validation, and summary
  - Segment progress tracking and individual segment tooltips
  - Automatic duration calculation and segment gap detection
  - Integration with existing task management and scheduling systems
  - Professional segment utilities for creation, validation, and styling

## [2025-08-09] – Prompt 157

### Added

- **Recurring Tasks**
  - Task Properties option to set recurrence patterns (daily, weekly, monthly)
  - Automatic generation of multiple task instances based on recurrence rules
  - Linked series editing - changes apply to all instances unless detached
  - Recurring task indicators in Task Grid with pattern descriptions
  - Context menu option to detach individual instances from series
  - Professional recurrence configuration with validation and preview
  - Support for complex recurrence patterns (specific weekdays, day of month)
  - Integration with existing task management and scheduling systems
  - Comprehensive recurrence utilities for rule creation and management

## [2025-08-09] – Prompt 158

### Added

- **Resource Cost Rate Management**
  - Resource Properties pane with cost rate configuration (hourly/daily/weekly/monthly)
  - Automatic task cost calculation based on duration × rate × resource units
  - Project cost summary with comprehensive breakdowns and analytics
  - Cost variance tracking between baseline and actual costs
  - Cost efficiency metrics and trend analysis with recommendations
  - Professional cost formatting and validation throughout the application
  - Integration with existing task management and resource allocation systems
  - Comprehensive cost utilities for calculations, formatting, and analysis

## [2025-08-09] – Prompt 159

### Added

- **Custom Gantt Bar Styling**
  - Format Tab with comprehensive bar style configuration interface
  - Style customization by task type, status, priority, and resource assignment
  - Professional color picker integration with real-time preview
  - Style validation with error handling and warnings
  - Import/export functionality for style configurations
  - Auto-generation of resource color palettes
  - Integration with existing Gantt chart rendering system
  - Comprehensive bar style utilities for management and validation

## [2025-08-09] – Prompt 160

### Added

- **Multi-Baseline Support**
  - Baseline Manager dialog with comprehensive baseline management interface
  - Multiple baseline storage with custom names and descriptions
  - Active baseline selection for comparison mode
  - Professional baseline comparison with detailed change tracking
  - Performance metrics calculation (schedule, cost, scope, overall)
  - Import/export functionality for baseline configurations
  - Integration with existing Gantt chart baseline visualization
  - Comprehensive baseline utilities for management and comparison

## [2025-08-09] – Prompt 161

### Added

- **Custom Gantt Bar Labels**
  - Format Tab with comprehensive bar label configuration interface
  - Label customization by type (task name, start date, finish date, duration, progress, resource, priority, status, cost)
  - Flexible label positioning (left, center, right, top, bottom)
  - Professional color picker integration with real-time preview
  - Label validation with error handling and warnings
  - Import/export functionality for label configurations
  - Global settings for label management (max labels, min bar width, truncation)
  - Integration with existing Gantt chart rendering system
  - Comprehensive bar label utilities for management and validation

## [2025-08-09] – Prompt 162

### Added

- **Resource Histogram Zoom and Pan**
  - D3-based zoom and pan controls for resource histograms
  - Professional zoom in/out buttons with smooth transitions
  - Horizontal drag-to-pan functionality with visual feedback
  - Fit-to-data and reset zoom controls
  - Zoom level display and tooltip integration
  - Synchronization with Gantt time scale
  - Comprehensive zoom state management and validation
  - Professional histogram rendering with resource allocation visualization
  - Integration with View Tab zoom controls

## [2025-08-09] – Prompt 163

### Added

- **Earned Value Analysis (EVA) Dashboard**
  - Comprehensive EVA metrics calculation (PV, EV, AC, SV, CV, SPI, CPI)
  - Professional EVA dashboard with overview, charts, and trends tabs
  - Chart.js integration for EVA visualization and trend analysis
  - Performance status indicators with color-coded status display
  - Forecast calculations (EAC, ETC, VAC, TCPI) with multiple methods
  - Import/export functionality for EVA metrics and historical data
  - Integration with Project Summary component as dedicated EVA tab
  - Professional metric cards with currency formatting and trend indicators
  - Historical data tracking and trend visualization
  - Comprehensive EVA utilities for calculations and validation

## [2025-08-09] – Prompt 164

### Added

- **Per-Resource Calendar Assignment**
  - Individual working calendar assignment for resources
  - Resource Properties Pane with "Working Calendar" section
  - Calendar selection from project calendar list with default indicators
  - Real-time calendar validation with error and warning display
  - Resource availability calculation and preview (30-day forecast)
  - Working days and hours summary display
  - Integration with scheduling algorithm to respect resource availability
  - Comprehensive resource calendar utilities for management and validation
  - Conflict detection for resource allocation and overtime violations
  - Weekly allocation calculation and limits enforcement

## [2025-08-09] – Prompt 165

### Added

- **Task Notes Editor**
  - Dedicated Notes tab in Task Properties Pane with rich text editor
  - Quill.js integration for rich text support (bold, italic, lists, links, headers)
  - Auto-save functionality with 2-second delay and real-time status indicators
  - Comprehensive notes management with validation and sanitization
  - Import/export functionality for notes data in JSON format
  - Real-time statistics display (word count, character count, lines, paragraphs)
  - Character limit progress bar with color-coded warnings
  - Notes preview functionality with toggle display
  - Professional toolbar with save, preview, import, export, and clear actions
  - Comprehensive notes utilities for management, validation, and auto-save handling

## [2025-08-09] – Prompt 166

### Added

- **Task Attachments Support**
  - Dedicated Attachments tab in Task Properties Pane with comprehensive file management
  - Drag and drop file upload with visual feedback and progress indicators
  - Support for multiple file types (images, documents, spreadsheets, archives)
  - Supabase storage integration for secure file storage and retrieval
  - Image preview functionality with inline display for supported formats
  - File download functionality with automatic browser download handling
  - Comprehensive file validation with size and type restrictions
  - Search and filter capabilities with category and date range filtering
  - Sort functionality by name, size, upload date, and other criteria
  - Import/export functionality for attachment metadata in JSON format
  - Professional file management interface with statistics and validation
  - Comprehensive attachments utilities for upload, storage, and preview handling

## [2025-08-09] – Prompt 168

### Added

- **Automatic Resource Leveling**
  - Comprehensive resource leveling utilities for detecting and resolving overallocations
  - Advanced leveling algorithm with configurable strategies (forward, backward, balanced)
  - Professional Resource Leveling Dialog with real-time conflict analysis
  - Automatic detection of resource conflicts based on daily allocations and capacity limits
  - Intelligent task prioritization based on critical path, float, duration, and progress
  - Dependency and constraint-aware leveling that respects project relationships
  - Undo functionality with step-by-step reversal of leveling changes
  - Real-time progress tracking and conflict resolution statistics
  - Configuration options for max iterations, shift days, thresholds, and strategies
  - Integration with Allocation Tab providing "Level Resources" and "Advanced Leveling" buttons
  - Comprehensive leveling reports with recommendations and performance metrics
  - Professional UI with validation, warnings, and detailed results display

## [2025-08-09] – Prompt 169

### Added

- **Calendar Exception Support**
  - Comprehensive calendar exception utilities for managing one-off non-working days
  - Professional Calendar Exception Manager with single and date range exception creation
  - Support for multiple exception types: holidays, site shutdowns, maintenance, weather, and custom
  - Advanced validation system with conflict detection and business rule enforcement
  - Integration with Calendar Editor providing "Add Exception" and "Manage Exceptions" buttons
  - Exception-aware scheduling algorithms that respect calendar exceptions
  - Import/export functionality for exceptions in JSON, CSV, and ICS formats
  - Bulk operations for managing multiple exceptions with search and filter capabilities
  - Real-time exception statistics and calendar impact analysis
  - Professional UI with validation, warnings, and detailed exception management
  - Enhanced calendar utilities supporting working hours and exception handling

## [2025-08-09] – Prompt 170

### Added

- **Custom Grid Columns**
  - Full customization of task grid columns with add/remove/reorder functionality
  - Professional Column Chooser Dialog with drag-to-reorder and search/filter capabilities
  - Comprehensive grid column utilities for managing configurations, validation, and persistence
  - Organized column categories: Basic, Schedule, Resource, Progress, Cost, and Baseline
  - Rich metadata system for columns including types, validation, and display options
  - Visual drag-and-drop interface for reordering columns with real-time feedback
  - Easy show/hide functionality for individual columns with toggle controls
  - Advanced search and filter for available columns by name, description, or category
  - Auto-fit column widths based on content analysis and optimal sizing
  - Column usage statistics and data completeness analysis
  - Export and import grid configurations as JSON files for sharing and backup
  - Save and load different column configurations as presets
  - Comprehensive default grid configuration with all available columns
  - Automatic saving and loading of grid configurations to localStorage
  - Robust validation system for column configurations and grid layouts
  - Integration with ViewTab ribbon providing "Customize Columns" button

## [2025-08-09] – Prompt 171

### Added

- **Gantt Baseline Overlay**
  - Visual baseline comparison overlay on Gantt chart for planned vs actual schedule analysis
  - Professional baseline dropdown selector in ViewTab with multiple baseline support
  - Enhanced baseline bar rendering with improved visual styling and opacity
  - Real-time variance indicators showing schedule deviations with color-coded feedback
  - Integration with existing baseline management system from ProjectTab
  - Automatic baseline synchronization between ProjectTab and ViewTab via localStorage
  - Enhanced baseline bar styling with blue background and border for clear distinction
  - Variance indicators showing red (delayed) or green (ahead) schedule deviations
  - Support for multiple stored baselines with easy selection and switching
  - Baseline overlay automatically shows when a baseline is selected
  - Improved tooltips showing baseline name, dates, and variance information
  - Seamless integration with existing baseline toggle functionality

## [2025-08-09] – Prompt 172

### Added

- **Custom Milestone Shapes**
  - Multiple milestone shape options: Diamond, Triangle, Circle, and Star
  - Professional milestone shape dropdown in FormatTab with visual previews
  - Global milestone shape setting that applies to all milestones in the project
  - Per-task milestone shape overrides for individual customization
  - Dynamic milestone rendering across Gantt chart, task grid, and sidebar tree
  - Color-coded milestone shapes with automatic state-based coloring (critical, selected, hovered)
  - Comprehensive milestone shape utilities for validation, statistics, and configuration
  - Milestone shape statistics showing distribution across the project
  - Enhanced milestone shape previews with descriptions and default colors
  - Seamless integration with existing milestone functionality
  - Automatic saving and loading of global milestone shape preference
  - Professional SVG-based milestone shapes with consistent styling

## [2025-08-09] – Prompt 173

### Added

- **Project Portfolio Dashboard**
  - Comprehensive portfolio dashboard with high-level KPIs for all active projects
  - Key metrics display: total projects, active projects, total budget, overdue projects
  - Visual charts showing project status distribution and progress distribution
  - Interactive project table with search, filtering, and sorting capabilities
  - Professional project cards with progress bars, status badges, and timeline information
  - Navigation system between portfolio view and individual project views
  - Supabase integration for project data storage and retrieval
  - Mock project data for demonstration with realistic construction projects
  - Advanced filtering by project status, manager, and location
  - Sortable project list by name, progress, budget, dates, and manager
  - Responsive design with mobile-friendly layout
  - Real-time metrics calculation and caching for performance
  - Project selection and navigation to detailed project views

## [2025-08-09] – Prompt 174

### Added

- **Global Search Tool**
  - Comprehensive global search functionality across all modules
  - Search bar integrated in application header with professional styling
  - Real-time search across tasks, resources, and projects with instant results
  - Advanced search capabilities: task names/descriptions, resource names, project titles
  - Debounced search input with 300ms delay for optimal performance
  - Interactive search results dropdown with click-to-navigate functionality
  - Keyboard navigation support (arrow keys, Enter, Escape)
  - Global keyboard shortcut (Ctrl/Cmd + K) for quick search access
  - Professional search result display with type badges, progress bars, and metadata
  - Search result categorization by type (project, task, resource) with color coding
  - Priority badges for tasks and progress indicators for projects
  - Comprehensive search context with centralized state management
  - Supabase integration for full-text search capabilities
  - Responsive design with mobile-friendly search interface
  - Search result highlighting and selection with visual feedback

## [2025-08-09] – Prompt 175

### Added

- **User Role-Based Ribbon Customisation**
  - Comprehensive role-based permission system for ribbon buttons and tabs
  - Five user roles: Admin, Manager, Planner, Viewer, and Guest with hierarchical permissions
  - Centralized permissions configuration with granular control over features
  - Role-based tab visibility with automatic filtering of inaccessible tabs
  - Button-level permission checking with visual feedback for restricted features
  - Enhanced RibbonButton component with permission-aware rendering and tooltips
  - RibbonGroup component with role-based visibility and restriction indicators
  - User context integration with Supabase authentication and role management
  - Real-time permission checking with fallback to mock user for development
  - Professional role indicators in application header with color-coded badges
  - Permission groups for easier management of related features
  - Comprehensive permission validation and role hierarchy management
  - Configurable permission system with easy extension for new features
  - Visual feedback for restricted features with helpful tooltips
  - Automatic tab switching when saved tab becomes inaccessible

## [2025-08-09] – Prompt 176

### Added

- **Persistent Ribbon State**
  - Comprehensive ribbon collapse/expand state persistence system
  - User-specific ribbon state storage in Supabase user_settings table
  - Automatic state restoration on application load without flashing
  - Smooth transition animations for expand/collapse operations
  - Professional toggle button with visual feedback and keyboard shortcuts
  - Global keyboard shortcut (Ctrl/Cmd + F1) for quick ribbon toggle
  - Loading state management to prevent UI flashing during state restoration
  - Error handling with fallback to default expanded state
  - Real-time state synchronization with Supabase backend
  - User preference persistence across browser sessions and devices
  - Professional UI with toggle button, keyboard shortcut indicator, and error display
  - Seamless integration with existing ribbon functionality and user context
  - Optimized performance with efficient state loading and saving
  - Responsive design that works across different screen sizes

## [2025-08-09] – Prompt 177

### Added

- **Inline Lag/Lead Editing**
  - Comprehensive dependency lag/lead editing system with inline popup modal
  - Click-to-edit functionality on dependency arrows in Gantt chart
  - Support for positive (lag) and negative (lead) time values
  - Real-time link type selection with visual feedback and descriptions
  - Professional modal interface with task information display
  - Keyboard shortcuts (Enter to save, Escape to cancel) for efficient editing
  - Input validation with error handling and user feedback
  - Reset functionality to restore default values
  - Click-outside-to-close behavior for intuitive user experience
  - Automatic focus and text selection for immediate editing
  - Visual indicators showing lag/lead status in input field
  - Comprehensive link type descriptions for user education
  - Seamless integration with existing task linking system
  - Immediate scheduling updates after dependency modifications
  - Professional error handling with clear user feedback

## [2025-08-09] – Prompt 178

### Added

- **Advanced Print/Export Tools**
  - Comprehensive print and export dialog with advanced settings
  - Professional print layout renderer with custom HTML generation
  - Multiple export formats: PDF, PNG, and Excel (XLSX)
  - Advanced print settings: page range, date range, scaling, orientation
  - Page size options: A4, A3, Letter, Legal with proper dimensions
  - Content options: include grid, Gantt chart, headers, footers
  - Quality settings for PNG export with multiple resolution options
  - Date range filtering for both print and export operations
  - Professional Excel export with multiple worksheets (Tasks, Dependencies, Summary)
  - Print layout with proper CSS styling and page break support
  - Real-time validation of print and export settings
  - Error handling with user-friendly error messages
  - Integration with existing task and view contexts
  - Professional UI with tabbed interface for print and export options
  - Keyboard shortcuts and accessibility features

## [2025-08-08] – Prompt 094

### Added

- **Snap Tasks to Grid (1 Day)**
  - Implemented enhanced snapping logic so task bars move in full day increments during drag
  - Task bars now snap to 1-day grid intervals based on zoom scale, preventing partial-pixel placement
  - Only updates visual preview when day offset actually changes, improving performance
  - Real-time visual feedback during dragging with precise day-based positioning
  - Enhanced drag state tracking to prevent unnecessary re-renders
  - Integrated with existing weekend handling and weekday snapping logic
  - Console logging for debugging drag operations and grid snapping behavior

## [2025-08-08] – Prompt 093

### Added

- **Gantt Chart Zoom Controls**
  - Added Zoom In and Zoom Out buttons to Home ribbon tab for dynamic timeline scaling
  - Zoom scale now ranges from 10px/day to 100px/day for precise timeline control
  - Each zoom button click adjusts scale by 10 pixels for smooth zooming experience
  - Gantt chart dynamically re-renders task positions, grid lines, and timeline headers on zoom changes
  - Integrated with existing zoom-to-fit and go-to-today functionality
  - Performance optimized zoom calculations using direct pixel-per-day values
  - Maintains weekend visibility and grid line settings across zoom levels

## [2025-08-08] – Prompt 092

### Added

- **Task Bar Drag-to-Move Functionality**
  - Enabled horizontal drag-to-move for Gantt task bars to adjust start and end dates
  - Click and drag on task bar left side (80%) initiates date adjustment mode
  - Movement snaps to nearest day based on timeline zoom scale for precise positioning
  - Automatic weekend handling - dates snap to weekdays when weekends are hidden
  - Real-time visual feedback during dragging with temporary date updates
  - Changes committed to database via Supabase on mouse release
  - Integrated with existing drag-to-link functionality (right side 20% of task bar)
  - Performance optimized with proper event listener management and cleanup

## [2025-08-08] – Prompt 089

### Added

- **Weekend Highlighting in Gantt Chart Background**
  - Added shaded background blocks for weekends (Saturday and Sunday) in Gantt timeline
  - Weekend blocks calculated dynamically based on project date range and zoom scale
  - Light blue translucent background (rgba(33, 150, 243, 0.08)) for visual distinction
  - Blocks render behind task bars with proper z-index layering (z-1)
  - Respects weekend visibility toggle (shows/hides based on showWeekends setting)
  - Performance optimized with useMemo for smooth scrolling and zooming
  - Integrated with existing grid lines system for unified background rendering

## [2025-08-08] – Prompt 091

### Added

- **Today Line Indicator in Gantt Timeline**
  - Added red vertical line indicator for today's date in Gantt timeline
  - Thin red line (1px width) spans from top to bottom of the chart
  - Line positioned correctly based on today's date and zoom scale
  - Respects weekend visibility toggle (shows/hides based on showWeekends setting)
  - Renders above weekend backgrounds with proper z-index layering (z-20)
  - Only displays when today's date falls within the visible timeline range
  - Performance optimized with useMemo for smooth scrolling and zooming

## [2025-08-08] – Prompt 090

### Added

- **Gantt Task Bar Hover Tooltip with Dates and Duration**
  - Added comprehensive tooltip on hover over Gantt task bars showing complete task information
  - Tooltip displays task name, start date, end date, and duration in days
  - Enhanced tooltip content with clear labeling (Start:, End:, Duration:)
  - Smooth fade-in/out animation with backdrop blur effect for professional appearance
  - High z-index (9999) ensures tooltip appears above all other elements
  - Responsive positioning that follows mouse cursor with proper offset
  - Integrated with existing milestone and critical path indicators
  - Performance optimized tooltip state management with proper cleanup

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
