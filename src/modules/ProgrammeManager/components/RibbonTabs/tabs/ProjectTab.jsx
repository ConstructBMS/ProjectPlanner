import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../../../utils/persistentStorage.js';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import { useTaskContext } from '../../../context/TaskContext';
import { useGanttContext } from '../../../context/GanttContext';
import {
  FolderIcon,
  DocumentIcon,
  CogIcon,
  ChartBarIcon,
  FlagIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import BaselineManagerDialog from '../../BaselineManagerDialog';
import GroupDialogLauncher from '../GroupDialogLauncher';
import ProjectInfoDialog from '../../Project/ProjectInfoDialog';
import WorkingTimeDialog from '../../Project/WorkingTimeDialog';
import MiniModal from '../ui/MiniModal';

const ProjectTab = () => {
  const { setBaseline1, clearBaseline1, tasks } = useTaskContext();
  const {
    schedulingState,
    autoScheduleSettings,
    manualSchedule,
    updateAutoScheduleSettings,
    clearSchedulingErrors,
    getSchedulingStats,
  } = useGanttContext();

  // Baseline Manager state
  const [baselineManagerOpen, setBaselineManagerOpen] = useState(false);
  const [baselines, setBaselines] = useState([]);
  const [activeBaselineId, setActiveBaselineId] = useState(null);

  // Project Info Dialog state
  const [projectInfoDialogOpen, setProjectInfoDialogOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('default-project');

  // Working Time Dialog state
  const [workingTimeDialogOpen, setWorkingTimeDialogOpen] = useState(false);

  // Move Project Dialog state
  const [moveProjectDialogOpen, setMoveProjectDialogOpen] = useState(false);
  const [moveProjectDays, setMoveProjectDays] = useState(0);

  // Load baselines from persistent storage on mount
  useEffect(() => {
    const loadBaselines = async () => {
      const savedBaselines = await getStorage('project.baselines');
      if (savedBaselines) {
        setBaselines(savedBaselines);
      }
    };
    loadBaselines();
  }, []);

  // Listen for project info updates
  useEffect(() => {
    const handleProjectInfoUpdated = (event) => {
      const { projectId, info } = event.detail;
      console.log('Project info updated:', { projectId, info });
      // Here you could trigger Gantt/grid re-read of bounds
      // For now, just log the event
    };

    window.addEventListener('PROJECT_INFO_UPDATED', handleProjectInfoUpdated);
    return () => {
      window.removeEventListener('PROJECT_INFO_UPDATED', handleProjectInfoUpdated);
    };
  }, []);

  // Listen for calendar updates
  useEffect(() => {
    const handleProjectCalendarUpdated = (event) => {
      const { projectId, calendar } = event.detail;
      console.log('Project calendar updated:', { projectId, calendar });
      // This will trigger Gantt chart background shading updates
    };

    window.addEventListener('PROJECT_CALENDAR_UPDATED', handleProjectCalendarUpdated);
    return () => {
      window.removeEventListener('PROJECT_CALENDAR_UPDATED', handleProjectCalendarUpdated);
    };
  }, []);

  // Check if project has tasks
  const hasTasks = tasks && tasks.length > 0;

  // Baseline Manager handlers
  const handleSaveBaseline = async (baseline) => {
    setBaselines(prev => {
      const newBaselines = [...prev, baseline];
      setStorage('project.baselines', newBaselines);
      return newBaselines;
    });
  };

  const handleDeleteBaseline = async (baselineId) => {
    setBaselines(prev => {
      const newBaselines = prev.filter(b => b.id !== baselineId);
      setStorage('project.baselines', newBaselines);
      return newBaselines;
    });
    if (activeBaselineId === baselineId) {
      setActiveBaselineId(null);
    }
  };

  const handleSetActiveBaseline = baselineId => {
    setActiveBaselineId(baselineId);
  };

  const handleImportBaseline = async (baseline) => {
    setBaselines(prev => {
      const newBaselines = [...prev, baseline];
      setStorage('project.baselines', newBaselines);
      return newBaselines;
    });
  };

  // Project Info Dialog handlers
  const handleOpenProjectInfo = () => {
    setProjectInfoDialogOpen(true);
  };

  const handleCloseProjectInfo = () => {
    setProjectInfoDialogOpen(false);
  };

  // Working Time Dialog handlers
  const handleOpenWorkingTime = () => {
    setWorkingTimeDialogOpen(true);
  };

  const handleCloseWorkingTime = () => {
    setWorkingTimeDialogOpen(false);
  };

  // Project Dates handlers
  const handleSetStartToToday = () => {
    window.dispatchEvent(new window.CustomEvent('PROJECT_SET_START_TODAY', {
      detail: { projectId: currentProjectId }
    }));
    console.log('Project set start to today event emitted');
  };

  const handleOpenMoveProject = () => {
    setMoveProjectDialogOpen(true);
  };

  const handleCloseMoveProject = () => {
    setMoveProjectDialogOpen(false);
    setMoveProjectDays(0);
  };

  const handleMoveProject = () => {
    const days = parseInt(moveProjectDays, 10);
    if (isNaN(days)) {
      console.error('Invalid days value:', moveProjectDays);
      return;
    }
    
    window.dispatchEvent(new window.CustomEvent('PROJECT_MOVE_BY_DAYS', {
      detail: { projectId: currentProjectId, days }
    }));
    console.log('Project move by days event emitted:', days);
    setMoveProjectDialogOpen(false);
    setMoveProjectDays(0);
  };

  const handleRecalculate = () => {
    window.dispatchEvent(new window.CustomEvent('PROJECT_RECALCULATE', {
      detail: { projectId: currentProjectId }
    }));
    console.log('Project recalculate event emitted');
  };

  return (
    <>
      <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
        {/* Project Settings Group */}
        <RibbonGroup title='Project Settings'>
                            <RibbonButton
                    icon={<FolderIcon className='w-4 h-4 text-gray-700' />}
                    label='Project Info'
                    onClick={handleOpenProjectInfo}
                    tooltip='Edit project information (name, dates, calendar)'
                  />
                  <RibbonButton
                    icon={<CalendarIcon className='w-4 h-4 text-gray-700' />}
                    label='Working Time'
                    onClick={handleOpenWorkingTime}
                    tooltip='Edit working days, hours, and holidays'
                  />
          <RibbonButton
            icon={<DocumentIcon className='w-4 h-4 text-gray-700' />}
            label='Project Settings'
          />
          <RibbonButton
            icon={<CogIcon className='w-4 h-4 text-gray-700' />}
            label='Preferences'
          />
        </RibbonGroup>

        {/* Project Dates Group */}
        <RibbonGroup title='Dates'>
          <RibbonButton
            icon={<ClockIcon className='w-4 h-4 text-gray-700' />}
            label='Set Start to Today'
            onClick={handleSetStartToToday}
            tooltip='Set project start date to today'
            disabled={!hasTasks}
          />
          <RibbonButton
            icon={<ArrowRightIcon className='w-4 h-4 text-gray-700' />}
            label='Move Project'
            onClick={handleOpenMoveProject}
            tooltip='Move entire project by specified number of days'
            disabled={!hasTasks}
          />
          <RibbonButton
            icon={<CalculatorIcon className='w-4 h-4 text-gray-700' />}
            label='Recalculate'
            onClick={handleRecalculate}
            tooltip='Recalculate project schedule'
            disabled={!hasTasks}
          />
        </RibbonGroup>

        {/* Baseline Management Group */}
        <RibbonGroup title='Baseline'>
          <RibbonButton
            icon={<ArchiveBoxIcon className='w-4 h-4 text-gray-700' />}
            label='Baseline Manager'
            onClick={() => setBaselineManagerOpen(true)}
            tooltip='Manage multiple baselines and comparisons'
          />
          <RibbonButton
            icon={<FlagIcon className='w-4 h-4 text-gray-700' />}
            label='Set Baseline'
            onClick={setBaseline1}
            tooltip='Capture current task dates as Baseline 1'
          />
          <RibbonButton
            icon={<TrashIcon className='w-4 h-4 text-gray-700' />}
            label='Clear Baseline'
            onClick={clearBaseline1}
            tooltip='Remove Baseline 1 from all tasks'
          />
        </RibbonGroup>

        {/* Auto-Scheduling Group */}
        <RibbonGroup title='Auto-Scheduling' className="ribbon-group">
          <RibbonButton
            icon={
              autoScheduleSettings.enabled ? (
                <PlayIcon className='w-4 h-4 text-green-600' />
              ) : (
                <PauseIcon className='w-4 h-4 text-gray-700' />
              )
            }
            label={autoScheduleSettings.enabled ? 'Enabled' : 'Disabled'}
            onClick={() =>
              updateAutoScheduleSettings({
                enabled: !autoScheduleSettings.enabled,
              })
            }
            tooltip={
              autoScheduleSettings.enabled
                ? 'Disable auto-scheduling'
                : 'Enable auto-scheduling'
            }
          />
          <RibbonButton
            icon={<ArrowPathIcon className='w-4 h-4 text-gray-700' />}
            label='Manual Schedule'
            onClick={manualSchedule}
            tooltip='Manually trigger scheduling calculation'
            disabled={schedulingState.isAutoScheduling}
          />
          {(schedulingState.schedulingErrors.length > 0 ||
            schedulingState.validationErrors.length > 0) && (
            <RibbonButton
              icon={
                <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
              }
              label='Clear Errors'
              onClick={clearSchedulingErrors}
              tooltip={`${schedulingState.schedulingErrors.length + schedulingState.validationErrors.length} scheduling errors`}
            />
          )}
          <GroupDialogLauncher
            groupName="Auto-Scheduling"
            onClick={() => {
              console.info('Open Auto-Scheduling options dialog');
            }}
          />
        </RibbonGroup>

        {/* Project Analysis Group */}
        <RibbonGroup title='Analysis'>
          <RibbonButton
            icon={<ChartBarIcon className='w-4 h-4 text-gray-700' />}
            label='Project Reports'
          />
        </RibbonGroup>
      </div>

      {/* Baseline Manager Dialog */}
      <BaselineManagerDialog
        isOpen={baselineManagerOpen}
        onClose={() => setBaselineManagerOpen(false)}
        tasks={tasks}
        baselines={baselines}
        activeBaselineId={activeBaselineId}
        onSaveBaseline={handleSaveBaseline}
        onDeleteBaseline={handleDeleteBaseline}
        onSetActiveBaseline={handleSetActiveBaseline}
        onImportBaseline={handleImportBaseline}
      />

              {/* Project Info Dialog */}
        <ProjectInfoDialog
          isOpen={projectInfoDialogOpen}
          onClose={handleCloseProjectInfo}
          projectId={currentProjectId}
        />

        {/* Working Time Dialog */}
        <WorkingTimeDialog
          isOpen={workingTimeDialogOpen}
          onClose={handleCloseWorkingTime}
          projectId={currentProjectId}
        />

        {/* Move Project Dialog */}
        <MiniModal
          isOpen={moveProjectDialogOpen}
          onClose={handleCloseMoveProject}
          onSave={handleMoveProject}
          title="Move Project"
          saveLabel="Move Project"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the number of days to move the entire project. Use positive numbers to move forward, negative to move backward.
            </p>
            <div>
              <label htmlFor="moveDays" className="block text-sm font-medium text-gray-700 mb-1">
                Days to Move
              </label>
              <input
                type="number"
                id="moveDays"
                value={moveProjectDays}
                onChange={(e) => setMoveProjectDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="-365"
                max="365"
                step="1"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Range: -365 to +365 days
              </p>
            </div>
          </div>
        </MiniModal>
    </>
  );
};

export default ProjectTab;
