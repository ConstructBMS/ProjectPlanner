import React from 'react';
import Ribbon from '../components/Ribbon/Ribbon';
import Sidebar from '../components/Sidebar/Sidebar';
import GanttChart from '../components/GanttChart/GanttChart';

export default function Dashboard() {
  return (
    <div className='h-screen flex flex-col'>
      <Ribbon />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <GanttChart />
      </div>
    </div>
  );
}
