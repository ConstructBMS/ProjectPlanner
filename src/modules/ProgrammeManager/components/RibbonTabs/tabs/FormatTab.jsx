import React, { useState } from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import RibbonDropdown from '../shared/RibbonDropdown';
import {
  PaintBrushIcon,
  CalendarIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  TableCellsIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  PhotoIcon,
  SwatchIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  UserIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  TableCellsIcon as TableIcon,
  QuestionMarkCircleIcon,
  DocumentIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function FormatTab() {
  const [selectedBaseline, setSelectedBaseline] = useState('(None)');
  const [selectedCodeLibrary, setSelectedCodeLibrary] =
    useState('Code library');

  return (
    <div className='flex flex-nowrap gap-0 p-0.5 w-full min-w-0'>
      {/* Format Group */}
      <RibbonGroup title='Format'>
        <RibbonButton
          icon={<PaintBrushIcon className='w-4 h-4' />}
          label='Format Bar Chart'
          onClick={() => console.log('Format Bar Chart')}
          tooltip='Format the bar chart appearance'
        />
        <RibbonButton
          icon={<CalendarIcon className='w-4 h-4' />}
          label='Date Zone'
          onClick={() => console.log('Date Zone')}
          tooltip='Configure date zones'
        />
        <RibbonButton
          icon={<ViewColumnsIcon className='w-4 h-4' />}
          label='Grids'
          onClick={() => console.log('Grids')}
          tooltip='Configure grid settings'
        />
        <RibbonButton
          icon={<AdjustmentsHorizontalIcon className='w-4 h-4' />}
          label='Ruling Lines'
          onClick={() => console.log('Ruling Lines')}
          tooltip='Configure ruling lines'
        />
        <RibbonButton
          icon={<TableCellsIcon className='w-4 h-4' />}
          label='Shading'
          onClick={() => console.log('Shading')}
          tooltip='Configure shading options'
        />
        <RibbonButton
          icon={<Square3Stack3DIcon className='w-4 h-4' />}
          label='Hierarchy Appearance'
          onClick={() => console.log('Hierarchy Appearance')}
          tooltip='Configure hierarchy appearance'
        />
      </RibbonGroup>

      {/* Dropdowns Group */}
      <RibbonGroup title=''>
        <div className='flex flex-col gap-1'>
          <RibbonDropdown
            icon={<ChevronDownIcon className='w-4 h-4' />}
            label={selectedBaseline}
            options={[
              { value: '(None)', label: '(None)' },
              { value: 'baseline1', label: 'Baseline 1' },
              { value: 'baseline2', label: 'Baseline 2' },
            ]}
            onSelect={option => {
              setSelectedBaseline(option.label);
              console.log('Baseline:', option.value);
            }}
            tooltip='Select baseline'
          />
          <RibbonDropdown
            icon={<DocumentIcon className='w-4 h-4' />}
            label={selectedCodeLibrary}
            options={[
              { value: 'codelib1', label: 'Code Library 1' },
              { value: 'codelib2', label: 'Code Library 2' },
            ]}
            onSelect={option => {
              setSelectedCodeLibrary(option.label);
              console.log('Code Library:', option.value);
            }}
            tooltip='Select code library'
          />
          <RibbonDropdown
            icon={<ChartBarIcon className='w-4 h-4' />}
            label='Baselines'
            options={[
              { value: 'baseline1', label: 'Baseline 1' },
              { value: 'baseline2', label: 'Baseline 2' },
            ]}
            onSelect={option => console.log('Baselines:', option.value)}
            tooltip='Select baselines'
          />
        </div>
      </RibbonGroup>

      {/* Show/Hide Group */}
      <RibbonGroup title='Show/Hide'>
        <RibbonButton
          icon={<EyeIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 1')}
          tooltip='Show/Hide option 1'
        />
        <RibbonButton
          icon={<EyeSlashIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 2')}
          tooltip='Show/Hide option 2'
        />
        <RibbonButton
          icon={<FlagIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 3')}
          tooltip='Show/Hide option 3'
        />
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 4')}
          tooltip='Show/Hide option 4'
        />
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 5')}
          tooltip='Show/Hide option 5'
        />
        <RibbonButton
          icon={<ChartBarSquareIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 6')}
          tooltip='Show/Hide option 6'
        />
        <RibbonButton
          icon={<TableIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 7')}
          tooltip='Show/Hide option 7'
        />
        <RibbonButton
          icon={<CalendarDaysIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 8')}
          tooltip='Show/Hide option 8'
        />
        <RibbonButton
          icon={<UserIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 9')}
          tooltip='Show/Hide option 9'
        />
        <RibbonButton
          icon={<UserPlusIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 10')}
          tooltip='Show/Hide option 10'
        />
        <RibbonButton
          icon={<QuestionMarkCircleIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 11')}
          tooltip='Show/Hide option 11'
        />
        <RibbonButton
          icon={<DocumentIcon className='w-4 h-4' />}
          label=''
          onClick={() => console.log('Show/Hide 12')}
          tooltip='Show/Hide option 12'
        />
      </RibbonGroup>

      {/* Spreadsheet Group */}
      <RibbonGroup title='Spreadsheet'>
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label='Default Table Fonts'
          onClick={() => console.log('Default Table Fonts')}
          tooltip='Set default table fonts'
        />
        <RibbonButton
          icon={<SwatchIcon className='w-4 h-4' />}
          label='Remove All Cell Formatting'
          onClick={() => console.log('Remove All Cell Formatting')}
          tooltip='Remove all cell formatting'
        />
        <div className='flex flex-col gap-1 mt-1'>
          <button
            className='px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled
            title='Left Justify'
          >
            Left Justify
          </button>
          <button
            className='px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled
            title='Centre Justify'
          >
            Centre Justify
          </button>
          <button
            className='px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled
            title='Right Justify'
          >
            Right Justify
          </button>
        </div>
      </RibbonGroup>

      {/* Annotations Group */}
      <RibbonGroup title='Annotations'>
        <RibbonButton
          icon={<DocumentTextIcon className='w-4 h-4' />}
          label='Text Annotation'
          onClick={() => console.log('Text Annotation')}
          tooltip='Add text annotation'
        />
        <RibbonButton
          icon={<Square3Stack3DIcon className='w-4 h-4' />}
          label='Object'
          onClick={() => console.log('Object')}
          tooltip='Add object annotation'
        />
        <RibbonButton
          icon={<PhotoIcon className='w-4 h-4' />}
          label='Picture'
          onClick={() => console.log('Picture')}
          tooltip='Add picture annotation'
        />
      </RibbonGroup>
    </div>
  );
}
