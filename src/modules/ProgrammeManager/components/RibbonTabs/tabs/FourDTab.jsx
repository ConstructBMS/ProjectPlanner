import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import {
  CubeIcon,
  BuildingOfficeIcon,
  MapIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const FourDTab = () => {
  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* 4D Modeling Group */}
      <RibbonGroup title='4D Modeling'>
        <RibbonButton
          icon={<CubeIcon className='w-4 h-4 text-gray-700' />}
          label='3D Model'
        />
        <RibbonButton
          icon={<BuildingOfficeIcon className='w-4 h-4 text-gray-700' />}
          label='Building Model'
        />
        <RibbonButton
          icon={<MapIcon className='w-4 h-4 text-gray-700' />}
          label='Site Model'
        />
      </RibbonGroup>

      {/* 4D Simulation Group */}
      <RibbonGroup title='4D Simulation'>
        <RibbonButton
          icon={<ClockIcon className='w-4 h-4 text-gray-700' />}
          label='Time Simulation'
        />
      </RibbonGroup>
    </div>
  );
};

export default FourDTab;
