import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import { useTaskContext } from '../../context/TaskContext';
import {
  FolderIcon,
  DocumentIcon,
  CogIcon,
  ChartBarIcon,
  FlagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const ProjectTab = () => {
  const { setBaseline1, clearBaseline1 } = useTaskContext();

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
