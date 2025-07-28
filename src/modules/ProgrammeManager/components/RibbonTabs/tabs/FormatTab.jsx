import React, { useState, useRef, useEffect } from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import { useViewContext } from '../../../context/ViewContext';
import {
  PaintBrushIcon,
  SwatchIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const ToggleButton = ({ label, active, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-[32px] h-[32px] border rounded text-xs flex items-center justify-center transition-colors duration-150 ${
      active
        ? 'bg-blue-500 text-white border-blue-500'
        : 'bg-gray-100 hover:bg-blue-100 border-gray-300'
    }`}
  >
    {label}
  </button>
);

const Dropdown = ({ options, value, onChange, title }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    title={title}
    className='h-[32px] text-xs px-2 border border-gray-300 rounded bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors duration-150'
  >
    {options.map(opt => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const FontControlsGroup = () => {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Arial');

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex gap-1'>
        <ToggleButton
          label='B'
          active={bold}
          onClick={() => {
            setBold(!bold);
            console.log(`Bold: ${!bold}`);
          }}
          title='Toggle Bold'
        />
        <ToggleButton
          label='I'
          active={italic}
          onClick={() => {
            setItalic(!italic);
            console.log(`Italic: ${!italic}`);
          }}
          title='Toggle Italic'
        />
        <ToggleButton
          label='U'
          active={underline}
          onClick={() => {
            setUnderline(!underline);
            console.log(`Underline: ${!underline}`);
          }}
          title='Toggle Underline'
        />
      </div>

      <div className='flex gap-1'>
        <Dropdown
          options={['8', '10', '12', '14', '16', '18', '20']}
          value={fontSize}
          onChange={val => {
            setFontSize(val);
            console.log(`Font Size: ${val}`);
          }}
          title='Font Size'
        />
        <Dropdown
          options={['Arial', 'Roboto', 'Times New Roman', 'Verdana', 'Courier']}
          value={fontFamily}
          onChange={val => {
            setFontFamily(val);
            console.log(`Font Family: ${val}`);
          }}
          title='Font Family'
        />
      </div>
    </div>
  );
};

const LabelOrientationGroup = () => {
  const handleClick = label => {
    console.log(`Label Orientation Action: ${label}`);
  };

  return (
    <div className='flex flex-col gap-1'>
      {/* Justification Row */}
      <div className='flex gap-1'>
        <button
          title='Align Left'
          className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
          onClick={() => handleClick('Align Left')}
        >
          <span className='text-md'>⬅️</span>
        </button>
        <button
          title='Center Align'
          className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
          onClick={() => handleClick('Center')}
        >
          <span className='text-md'>↔️</span>
        </button>
        <button
          title='Align Right'
          className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
          onClick={() => handleClick('Align Right')}
        >
          <span className='text-md'>➡️</span>
        </button>
      </div>
      {/* Rotation Row */}
      <div className='flex gap-1'>
        <button
          title='Rotate Up'
          className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
          onClick={() => handleClick('Rotate Up')}
        >
          <span className='text-md'>🔼</span>
        </button>
        <button
          title='Rotate Down'
          className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
          onClick={() => handleClick('Rotate Down')}
        >
          <span className='text-md'>🔽</span>
        </button>
      </div>
    </div>
  );
};

const BarFillGroup = () => {
  const handleClick = label => {
    console.log(`Bar Fill Action: ${label}`);
  };

  return (
    <div className='flex gap-1'>
      <button
        title='Solid Fill'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Solid Fill')}
      >
        <span className='text-md'>█</span>
      </button>
      <button
        title='Diagonal Hatch'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Diagonal Hatch')}
      >
        <span className='text-md'>▒</span>
      </button>
      <button
        title='Vertical Hatch'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Vertical Hatch')}
      >
        <span className='text-md'>░</span>
      </button>
      <button
        title='Pattern Preview'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Pattern Preview')}
      >
        <span className='text-md'>▓</span>
      </button>
    </div>
  );
};

const BarCornerStyleGroup = () => {
  const handleClick = style => {
    console.log(`Corner Style Selected: ${style}`);
  };

  return (
    <div className='flex gap-1'>
      <button
        title='Square Corners'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Square')}
      >
        <span className='text-md'>◼️</span>
      </button>
      <button
        title='Rounded Corners'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Rounded')}
      >
        <span className='text-md'>◒</span>
      </button>
      <button
        title='Fully Rounded Corners'
        className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center transition-colors duration-150'
        onClick={() => handleClick('Full Round')}
      >
        <span className='text-md'>◯</span>
      </button>
    </div>
  );
};

const BarHeightGroup = () => {
  const setBarHeight = size => {
    console.log(`Set Gantt Bar Height: ${size}`);
  };

  const Button = ({ label, size }) => (
    <button
      title={`${label} Bar Height`}
      className='px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded text-xs transition-colors duration-150'
      onClick={() => setBarHeight(size)}
    >
      {label}
    </button>
  );

  return (
    <div className='flex gap-1'>
      <Button label='S' size='small' />
      <Button label='M' size='medium' />
      <Button label='L' size='large' />
    </div>
  );
};

const RowHeightGroup = () => {
  const setRowHeight = value => {
    console.log(`Set Row Height: ${value}`);
  };

  const Button = ({ icon, label, height }) => (
    <button
      title={label}
      className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center text-md transition-colors duration-150'
      onClick={() => setRowHeight(height)}
    >
      {icon}
    </button>
  );

  return (
    <div className='flex gap-1'>
      <Button icon='🔽' label='Decrease Row Height' height='smaller' />
      <Button icon='🔼' label='Increase Row Height' height='larger' />
    </div>
  );
};

const FontSizeGroup = () => {
  const setFontSize = size => {
    console.log(`Set Font Size: ${size}`);
  };

  const Button = ({ size }) => (
    <button
      title={`${size} Font`}
      className='px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded text-xs transition-colors duration-150'
      onClick={() => setFontSize(size)}
    >
      {size.charAt(0).toUpperCase()}
    </button>
  );

  return (
    <div className='flex gap-1'>
      <Button size='small' />
      <Button size='medium' />
      <Button size='large' />
    </div>
  );
};

const BarLabelDisplayGroup = () => {
  const setLabel = label => {
    console.log(`Set Gantt Bar Label: ${label}`);
  };

  return (
    <div className='flex gap-1'>
      <button
        title='Task Name'
        className='text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150'
        onClick={() => setLabel('Task Name')}
      >
        📝
      </button>
      <button
        title='Duration'
        className='text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150'
        onClick={() => setLabel('Duration')}
      >
        ⏱️
      </button>
      <button
        title='None'
        className='text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded transition-colors duration-150'
        onClick={() => setLabel('None')}
      >
        🚫
      </button>
    </div>
  );
};

const MilestoneStyleGroup = () => {
  const setStyle = style => {
    console.log(`Set Milestone Style: ${style}`);
  };

  const Button = ({ icon, style }) => (
    <button
      title={style}
      className='w-[32px] h-[32px] bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded flex items-center justify-center text-md transition-colors duration-150'
      onClick={() => setStyle(style)}
    >
      {icon}
    </button>
  );

  return (
    <div className='flex gap-1'>
      <Button icon='♦️' style='Diamond' />
      <Button icon='•' style='Dot' />
      <Button icon='⭐' style='Star' />
    </div>
  );
};

const BarStyleDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className='w-[48px] h-[36px] bg-transparent border border-transparent rounded flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all duration-200'
        title='Bar Style Options'
      >
        <div className='text-[12px] text-gray-700 flex items-center justify-center w-full h-[14px] pt-0.5'>
          🎨
        </div>
        <div className='text-[7px] uppercase tracking-wide text-gray-600 font-medium mt-1.5 leading-tight text-center'>
          Bar Style
        </div>
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[160px] bg-white shadow-lg rounded-md border border-gray-300 text-sm'>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => {
              console.log('Change Bar Height');
              setOpen(false);
            }}
          >
            Bar Height
          </div>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => {
              console.log('Change Bar Color');
              setOpen(false);
            }}
          >
            Bar Color
          </div>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => {
              console.log('Change Bar Pattern');
              setOpen(false);
            }}
          >
            Bar Pattern
          </div>
        </div>
      )}
    </div>
  );
};

const BarColorSetDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = theme => {
    console.log(`Bar Color Set: ${theme}`);
    setOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className='w-[48px] h-[36px] bg-transparent border border-transparent rounded flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all duration-200'
        title='Apply bar color theme'
      >
        <div className='text-[12px] text-gray-700 flex items-center justify-center w-full h-[14px] pt-0.5'>
          🎨
        </div>
        <div className='text-[7px] uppercase tracking-wide text-gray-600 font-medium mt-1.5 leading-tight text-center'>
          Color Set
        </div>
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1 z-10 w-[180px] bg-white shadow-lg rounded-md border border-gray-300 text-sm'>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => handleSelect('Default Theme')}
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gray-500 rounded' />
              Default Theme
            </div>
          </div>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => handleSelect('Critical Path Red')}
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-red-600 rounded' />
              Critical Path Red
            </div>
          </div>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => handleSelect('Progress Gradient')}
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded' />
              Progress Gradient
            </div>
          </div>
          <div
            className='px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150'
            onClick={() => handleSelect('Custom Palette')}
          >
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-yellow-400 rounded' />
              Custom Palette
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BaselineToggle = () => {
  const { viewState, updateViewState } = useViewContext();

  const handleToggleBaseline = () => {
    const newShowBaseline = !viewState.showBaseline;
    updateViewState({ showBaseline: newShowBaseline });
    console.log('Baseline overlay:', newShowBaseline ? 'ON' : 'OFF');
  };

  return (
    <RibbonButton
      icon={<span className='text-lg'>📏</span>}
      label='Show Baseline'
      onClick={handleToggleBaseline}
      tooltip='Toggle display of baseline bars'
      active={viewState.showBaseline}
    />
  );
};

const DateMarkersGroup = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const { viewState, updateViewState } = useViewContext();
  const datePickerRef = useRef();

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMarker = () => {
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (selectedDate) {
      const newMarker = {
        id: Date.now(),
        date: selectedDate,
        label: `Marker: ${selectedDate}`,
      };

      const currentMarkers = viewState.dateMarkers || [];
      const updatedMarkers = [...currentMarkers, newMarker];

      updateViewState({ dateMarkers: updatedMarkers });

      // Save to localStorage
      localStorage.setItem('dateMarkers', JSON.stringify(updatedMarkers));

      console.log('Marker added:', selectedDate);
      setSelectedDate('');
      setShowDatePicker(false);
    }
  };

  const handleDateChange = e => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className='relative' ref={datePickerRef}>
      <RibbonButton
        icon={<span className='text-lg'>📍</span>}
        label='Add Marker'
        onClick={handleAddMarker}
        tooltip='Place a vertical marker on the timeline'
      />

      {showDatePicker && (
        <div className='absolute top-full left-0 mt-1 z-10 bg-white shadow-md rounded border border-gray-200 p-3'>
          <div className='flex flex-col gap-2'>
            <label className='text-xs font-medium text-gray-700'>
              Select Date:
            </label>
            <input
              type='date'
              value={selectedDate}
              onChange={handleDateChange}
              className='text-xs px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none'
            />
            <div className='flex gap-1 mt-2'>
              <button
                onClick={handleDateConfirm}
                disabled={!selectedDate}
                className='px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                Add
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className='px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormatTab = () => {
  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Bar Style Group */}
      <RibbonGroup title='Bar Style'>
        <RibbonButton
          icon={<span className='text-lg'>🎨</span>}
          label='Bar Style Manager'
          onClick={() =>
            console.log('FormatTab Action: Open Bar Style Manager')
          }
          tooltip='Open Bar Style Manager'
        />
        <RibbonButton
          icon={<span className='text-lg'>🟦</span>}
          label='Bar Color'
          onClick={() => console.log('FormatTab Action: Change Bar Color')}
          tooltip='Change Bar Color'
        />
        <RibbonButton
          icon={<span className='text-lg'>📈</span>}
          label='Bar Pattern'
          onClick={() => console.log('FormatTab Action: Edit Bar Pattern')}
          tooltip='Edit Bar Pattern'
        />
      </RibbonGroup>

      {/* Date Markers Group */}
      <RibbonGroup title='Date Markers'>
        <DateMarkersGroup />
      </RibbonGroup>

      {/* Baseline Overlay Group */}
      <RibbonGroup title='Baseline'>
        <BaselineToggle />
      </RibbonGroup>

      {/* Font Style Group */}
      <RibbonGroup title='Font Style'>
        <RibbonButton
          icon={<span className='text-lg font-bold'>B</span>}
          label='Bold'
          onClick={() => console.log('FormatTab Action: Make font bold')}
          tooltip='Make font bold'
        />
        <RibbonButton
          icon={<span className='text-lg italic'>I</span>}
          label='Italic'
          onClick={() => console.log('FormatTab Action: Make font italic')}
          tooltip='Make font italic'
        />
        <RibbonButton
          icon={<span className='text-lg underline'>U</span>}
          label='Underline'
          onClick={() => console.log('FormatTab Action: Make font underline')}
          tooltip='Make font underline'
        />
        <RibbonButton
          icon={<span className='text-lg'>🖍️</span>}
          label='Font Color'
          onClick={() => console.log('FormatTab Action: Change font color')}
          tooltip='Change font color'
        />
        <RibbonButton
          icon={<span className='text-lg'>🔡</span>}
          label='Font Size'
          onClick={() => console.log('FormatTab Action: Change font size')}
          tooltip='Change font size'
        />
      </RibbonGroup>

      {/* Text Align Group */}
      <RibbonGroup title='Text Align'>
        <RibbonButton
          icon={<span className='text-lg'>L</span>}
          label='Left Align'
          onClick={() => console.log('FormatTab Action: Align Left')}
          tooltip='Align Left'
        />
        <RibbonButton
          icon={<span className='text-lg'>C</span>}
          label='Center Align'
          onClick={() => console.log('FormatTab Action: Align Center')}
          tooltip='Align Center'
        />
        <RibbonButton
          icon={<span className='text-lg'>R</span>}
          label='Right Align'
          onClick={() => console.log('FormatTab Action: Align Right')}
          tooltip='Align Right'
        />
      </RibbonGroup>

      {/* Task Shape Group */}
      <RibbonGroup title='Task Shape'>
        <RibbonButton
          icon={<span className='text-lg'>◻️</span>}
          label='Rectangle'
          onClick={() =>
            console.log('FormatTab Action: Set shape to rectangle')
          }
          tooltip='Set task shape to rectangle'
        />
        <RibbonButton
          icon={<span className='text-lg'>🔷</span>}
          label='Diamond'
          onClick={() => console.log('FormatTab Action: Set shape to diamond')}
          tooltip='Set task shape to diamond'
        />
        <RibbonButton
          icon={<span className='text-lg'>🚩</span>}
          label='Milestone'
          onClick={() =>
            console.log('FormatTab Action: Set shape to milestone')
          }
          tooltip='Set task shape to milestone'
        />
      </RibbonGroup>

      {/* Row Height Group */}
      <RibbonGroup title='Row Height'>
        <RibbonButton
          icon={<span className='text-lg'>⬆️</span>}
          label='Increase Height'
          onClick={() => console.log('FormatTab Action: Increase Row Height')}
          tooltip='Increase Row Height'
        />
        <RibbonButton
          icon={<span className='text-lg'>⬇️</span>}
          label='Decrease Height'
          onClick={() => console.log('FormatTab Action: Decrease Row Height')}
          tooltip='Decrease Row Height'
        />
        <RibbonButton
          icon={<span className='text-lg'>🔄</span>}
          label='Reset Height'
          onClick={() => console.log('FormatTab Action: Reset Row Height')}
          tooltip='Reset Row Height'
        />
      </RibbonGroup>

      {/* Formatting Group */}
      <RibbonGroup title='Formatting'>
        <RibbonButton
          icon={<PaintBrushIcon className='w-4 h-4 text-gray-700' />}
          label='Format Painter'
        />
        <RibbonButton
          icon={<SwatchIcon className='w-4 h-4 text-gray-700' />}
          label='Color Schemes'
        />
        <RibbonButton
          icon={<ViewColumnsIcon className='w-4 h-4 text-gray-700' />}
          label='Column Format'
        />
      </RibbonGroup>

      {/* Bar Style Group */}
      <RibbonGroup title='Bar Style'>
        <BarStyleDropdown />
      </RibbonGroup>

      {/* Bar Color Set Group */}
      <RibbonGroup title='Bar Color Set'>
        <BarColorSetDropdown />
      </RibbonGroup>

      {/* Fonts & Labels Group */}
      <RibbonGroup title='Fonts & Labels'>
        <FontControlsGroup />
      </RibbonGroup>

      {/* Label Orientation Group */}
      <RibbonGroup title='Label Orientation'>
        <LabelOrientationGroup />
      </RibbonGroup>

      {/* Bar Fill Group */}
      <RibbonGroup title='Bar Fill'>
        <BarFillGroup />
      </RibbonGroup>

      {/* Bar Corner Style Group */}
      <RibbonGroup title='Corners'>
        <BarCornerStyleGroup />
      </RibbonGroup>

      {/* Bar Height Group */}
      <RibbonGroup title='Bar Height'>
        <BarHeightGroup />
      </RibbonGroup>

      {/* Row Height Group */}
      <RibbonGroup title='Row Height'>
        <RowHeightGroup />
      </RibbonGroup>

      {/* Font Size Group */}
      <RibbonGroup title='Font Size'>
        <FontSizeGroup />
      </RibbonGroup>

      {/* Bar Label Display Group */}
      <RibbonGroup title='Bar Labels'>
        <BarLabelDisplayGroup />
      </RibbonGroup>

      {/* Milestone Style Group */}
      <RibbonGroup title='Milestones'>
        <MilestoneStyleGroup />
      </RibbonGroup>

      {/* Display Options Group */}
      <RibbonGroup title='Display Options'>
        <RibbonButton
          icon={<AdjustmentsHorizontalIcon className='w-4 h-4 text-gray-700' />}
          label='Display Settings'
        />
      </RibbonGroup>
    </div>
  );
};

export default FormatTab;
