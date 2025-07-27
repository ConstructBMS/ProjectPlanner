import React, { useState } from "react";
import useTaskManager from "../../../hooks/useTaskManager";
import RibbonButton from "../shared/RibbonButton";
import RibbonGroup from "../shared/RibbonGroup";
import RibbonDropdown from "../shared/RibbonDropdown";
import RibbonToggle from "../shared/RibbonToggle";
import {
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ChevronDownIcon,
  FlagIcon,
  LinkIcon,
  ArrowPathIcon,
  FolderIcon,
  ChevronDoubleDownIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ScissorsIcon as SplitIcon,
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  CodeBracketIcon,
  IndentIcon,
  OutdentIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  ChartBarSquareIcon
} from "@heroicons/react/24/outline";

export default function HomeTab() {
  const {
    addTask,
    deleteTask,
    linkTasks,
    ungroup,
    createGroup,
    selectAll,
    openTaskDetails,
    openTaskNotes,
    addCode
  } = useTaskManager();

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isCriticalPathActive, setIsCriticalPathActive] = useState(false);
  const [isShowBaselinesActive, setIsShowBaselinesActive] = useState(false);

  const handleTaskDetailsClick = () => {
    setIsTaskDetailModalOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {/* Clipboard Group */}
      <RibbonGroup title="Clipboard">
        <RibbonButton
          icon={<ClipboardDocumentIcon className="w-4 h-4" />}
          label="Paste"
          onClick={() => console.log("Paste")}
          tooltip="Paste (Ctrl+V)"
        />
        <RibbonButton
          icon={<ScissorsIcon className="w-4 h-4" />}
          label="Cut"
          onClick={() => console.log("Cut")}
          tooltip="Cut (Ctrl+X)"
        />
        <RibbonButton
          icon={<DocumentDuplicateIcon className="w-4 h-4" />}
          label="Copy"
          onClick={() => console.log("Copy")}
          tooltip="Copy (Ctrl+C)"
        />
      </RibbonGroup>

      {/* Font Group */}
      <RibbonGroup title="Font">
        <RibbonButton
          icon={<BoldIcon className="w-4 h-4" />}
          label="Bold"
          onClick={() => console.log("Bold")}
          tooltip="Bold (Ctrl+B)"
        />
        <RibbonButton
          icon={<ItalicIcon className="w-4 h-4" />}
          label="Italic"
          onClick={() => console.log("Italic")}
          tooltip="Italic (Ctrl+I)"
        />
        <RibbonButton
          icon={<UnderlineIcon className="w-4 h-4" />}
          label="Underline"
          onClick={() => console.log("Underline")}
          tooltip="Underline (Ctrl+U)"
        />
      </RibbonGroup>

      {/* Tasks Group */}
      <RibbonGroup title="Tasks">
        <RibbonButton
          icon={<PlusIcon className="w-4 h-4" />}
          label="Insert Task"
          onClick={addTask}
          tooltip="Insert new task"
        />
        <RibbonButton
          icon={<ChartBarIcon className="w-4 h-4" />}
          label="Insert Summary"
          onClick={() => console.log("Insert Summary Task")}
          tooltip="Insert summary task"
        />
        <RibbonButton
          icon={<IndentIcon className="w-4 h-4" />}
          label="Indent"
          onClick={() => console.log("Indent Task")}
          tooltip="Indent task"
        />
        <RibbonButton
          icon={<OutdentIcon className="w-4 h-4" />}
          label="Outdent"
          onClick={() => console.log("Outdent Task")}
          tooltip="Outdent task"
        />
      </RibbonGroup>

      {/* Properties Group */}
      <RibbonGroup title="Properties">
        <RibbonButton
          icon={<WrenchScrewdriverIcon className="w-4 h-4" />}
          label="Task Details"
          onClick={handleTaskDetailsClick}
          tooltip="Open task details"
        />
        <RibbonButton
          icon={<DocumentTextIcon className="w-4 h-4" />}
          label="Task Notes"
          onClick={openTaskNotes}
          tooltip="Open task notes"
        />
        <RibbonButton
          icon={<CodeBracketIcon className="w-4 h-4" />}
          label="Code Library"
          onClick={addCode}
          tooltip="Open code library"
        />
      </RibbonGroup>

      {/* Grouping Dropdown */}
      <RibbonDropdown
        icon={<FolderIcon className="w-4 h-4" />}
        label="Grouping"
        items={[
          { label: "Create Group", icon: <FolderIcon className="w-4 h-4" />, tooltip: "Group selected tasks" },
          { label: "Ungroup", icon: <ScissorsIcon className="w-4 h-4" />, tooltip: "Ungroup tasks" },
          { label: "Expand All", icon: <ChevronDoubleDownIcon className="w-4 h-4" />, tooltip: "Expand all groups" },
          { label: "Collapse All", icon: <ChevronDownIcon className="w-4 h-4" />, tooltip: "Collapse all groups" }
        ]}
        onItemClick={(item) => {
          if (item.label === "Create Group") createGroup();
          else if (item.label === "Ungroup") ungroup();
          else console.log(item.label);
        }}
      />

      {/* Selection Dropdown */}
      <RibbonDropdown
        icon={<EyeIcon className="w-4 h-4" />}
        label="Selection"
        items={[
          { label: "Select All", icon: <EyeIcon className="w-4 h-4" />, tooltip: "Select all tasks" },
          { label: "Clear Selection", icon: <EyeSlashIcon className="w-4 h-4" />, tooltip: "Clear selection" },
          { label: "Invert Selection", icon: <ArrowPathIcon className="w-4 h-4" />, tooltip: "Invert selection" }
        ]}
        onItemClick={(item) => {
          if (item.label === "Select All") selectAll();
          else console.log(item.label);
        }}
      />

      {/* Navigation Group */}
      <RibbonGroup title="Navigation">
        <RibbonButton
          icon={<LinkIcon className="w-4 h-4" />}
          label="Link Tasks"
          onClick={linkTasks}
          tooltip="Link selected tasks"
        />
        <RibbonButton
          icon={<FlagIcon className="w-4 h-4" />}
          label="Constraint Flag"
          onClick={() => console.log("Constraint Flag")}
          tooltip="Add constraint flag"
        />
        <RibbonButton
          icon={<ArrowPathIcon className="w-4 h-4" />}
          label="Auto Reschedule"
          onClick={() => console.log("Auto Reschedule")}
          tooltip="Auto reschedule tasks"
        />
      </RibbonGroup>

      {/* Toggle Buttons */}
      <RibbonToggle
        icon={<ExclamationTriangleIcon className="w-4 h-4" />}
        label="Critical Path"
        isActive={isCriticalPathActive}
        onClick={() => setIsCriticalPathActive(!isCriticalPathActive)}
        tooltip="Show critical path"
      />
      
      <RibbonToggle
        icon={<ChartBarSquareIcon className="w-4 h-4" />}
        label="Show Baselines"
        isActive={isShowBaselinesActive}
        onClick={() => setIsShowBaselinesActive(!isShowBaselinesActive)}
        tooltip="Show baselines"
      />
    </div>
  );
}
