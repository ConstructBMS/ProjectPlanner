import { Task } from '../../data/types';

export interface Column {
  id: string;
  label: string;
  minWidth: number;
  sortable: boolean;
  render: (task: Task) => React.ReactNode;
  sortValue?: (task: Task) => string | number | Date;
}

export const columns: Column[] = [
  {
    id: 'name',
    label: 'Task Name',
    minWidth: 200,
    sortable: true,
    render: (task: Task) => task.name,
    sortValue: (task: Task) => task.name.toLowerCase()
  },
  {
    id: 'start_date',
    label: 'Start Date',
    minWidth: 120,
    sortable: true,
    render: (task: Task) => {
      if (!task.start_date) return '-';
      return new Date(task.start_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    sortValue: (task: Task) => task.start_date ? new Date(task.start_date) : new Date(0)
  },
  {
    id: 'end_date',
    label: 'End Date',
    minWidth: 120,
    sortable: true,
    render: (task: Task) => {
      if (!task.end_date) return '-';
      return new Date(task.end_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    sortValue: (task: Task) => task.end_date ? new Date(task.end_date) : new Date(0)
  },
  {
    id: 'duration_days',
    label: 'Duration (days)',
    minWidth: 100,
    sortable: true,
    render: (task: Task) => {
      if (!task.duration_days) return '-';
      return task.duration_days.toString();
    },
    sortValue: (task: Task) => task.duration_days || 0
  },
  {
    id: 'resource_id',
    label: 'Resource',
    minWidth: 120,
    sortable: false,
    render: (task: Task) => {
      if (!task.resource_id) return '-';
      // For now, just show the resource ID. In a real app, you'd look up the resource name
      return task.resource_id.substring(0, 8) + '...';
    }
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    sortable: true,
    render: (task: Task) => {
      const status = task.status || 'not-started';
      const statusColors = {
        'not-started': 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'on-hold': 'bg-yellow-100 text-yellow-800'
      };
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors['not-started']}`}>
          {status.replace('-', ' ')}
        </span>
      );
    },
    sortValue: (task: Task) => task.status || 'not-started'
  },
  {
    id: 'progress',
    label: 'Progress (%)',
    minWidth: 100,
    sortable: true,
    render: (task: Task) => {
      const progress = task.progress || 0;
      return (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-[2rem]">{progress}%</span>
        </div>
      );
    },
    sortValue: (task: Task) => task.progress || 0
  }
];

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  columnId: string;
  direction: SortDirection;
}

export const defaultSort: SortConfig = {
  columnId: 'start_date',
  direction: 'asc'
};
