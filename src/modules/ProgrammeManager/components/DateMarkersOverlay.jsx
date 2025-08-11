import { useViewContext } from '../context/ViewContext';

const DateMarkersOverlay = () => {
  const { viewState } = useViewContext();
  const { dateMarkers, timelineZoom } = viewState;

  if (!dateMarkers || dateMarkers.length === 0) {
    return null;
  }

  return (
    <div className='absolute inset-0 pointer-events-none z-20'>
      {dateMarkers.map(marker => (
        <div
          key={marker.id}
          className='absolute top-0 bottom-0 w-[2px] bg-red-500 border-l border-red-600'
          style={{
            left: `${calculateMarkerPosition(marker.date, timelineZoom)}px`,
          }}
          title={`Marker: ${marker.date}`}
        />
      ))}
    </div>
  );
};

// Helper function to calculate marker position based on date
// This is a simplified calculation - in a real app, you'd need to map dates to pixel positions
const calculateMarkerPosition = (dateString, zoomLevel = 1.0) => {
  const markerDate = new Date(dateString);
  const baseDate = new Date('2024-01-01'); // Same base date as GanttChart
  const daysDiff = Math.floor((markerDate - baseDate) / (1000 * 60 * 60 * 24));

  // Use same scaling as GanttChart
  const baseDayWidth = 2; // Base width per day
  const scaledDayWidth = baseDayWidth * zoomLevel;
  const basePosition = 264; // Account for task name column width (w-64 = 256px) + padding

  return basePosition + daysDiff * scaledDayWidth;
};

export default DateMarkersOverlay;
