import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import { useTaskContext } from '../../context/TaskContext';
import { useGanttContext } from '../../context/GanttContext';
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
} from '@heroicons/react/24/outline';

const ProjectTab = () => {
  const { setBaseline1, clearBaseline1 } = useTaskContext();
  const { 
    schedulingState, 
    autoScheduleSettings, 
    manualSchedule, 
    updateAutoScheduleSettings,
    clearSchedulingErrors,
    getSchedulingStats 
  } = useGanttContext();

  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Project Settings Group */}
      <RibbonGroup title='Project Settings'>
        <RibbonButton
          icon={<FolderIcon className='w-4 h-4 text-gray-700' />}
          label='Project Info'
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

      {/* Baseline Management Group */}
      <RibbonGroup title='Baseline'>
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
      <RibbonGroup title='Auto-Scheduling'>
        <RibbonButton
          icon={autoScheduleSettings.enabled ? <PlayIcon className='w-4 h-4 text-green-600' /> : <PauseIcon className='w-4 h-4 text-gray-700' />}
          label={autoScheduleSettings.enabled ? 'Enabled' : 'Disabled'}
          onClick={() => updateAutoScheduleSettings({ enabled: !autoScheduleSettings.enabled })}
          tooltip={autoScheduleSettings.enabled ? 'Disable auto-scheduling' : 'Enable auto-scheduling'}
        />
        <RibbonButton
          icon={<ArrowPathIcon className='w-4 h-4 text-gray-700' />}
          label='Manual Schedule'
          onClick={manualSchedule}
          tooltip='Manually trigger scheduling calculation'
          disabled={schedulingState.isAutoScheduling}
        />
        {(schedulingState.schedulingErrors.length > 0 || schedulingState.validationErrors.length > 0) && (
          <RibbonButton
            icon={<ExclamationTriangleIcon className='w-4 h-4 text-red-600' />}
            label='Clear Errors'
            onClick={clearSchedulingErrors}
            tooltip={`${schedulingState.schedulingErrors.length + schedulingState.validationErrors.length} scheduling errors`}
          />
        )}
      </RibbonGroup>

      {/* Project Analysis Group */}
      <RibbonGroup title='Analysis'>
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4 text-gray-700' />}
          label='Project Reports'
        />
      </RibbonGroup>
    </div>
  );
};

export default ProjectTab;
