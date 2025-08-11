import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase/client';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const TemplateManager = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projectplanner_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateStats = template => {
    try {
      const templateData = template.template_data;
      const phases = templateData?.phases || [];
      let totalTasks = 0;
      let totalDuration = 0;

      phases.forEach(phase => {
        const tasks = phase.tasks || [];
        totalTasks += tasks.length;
        tasks.forEach(task => {
          totalDuration += task.duration || 0;
        });
      });

      return {
        phases: phases.length,
        tasks: totalTasks,
        duration: totalDuration,
      };
    } catch (err) {
      return { phases: 0, tasks: 0, duration: 0 };
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/4 mb-4' />
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-20 bg-gray-200 rounded' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='text-center'>
          <div className='text-red-500 mb-2'>Error loading templates</div>
          <div className='text-sm text-gray-600'>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>
          Project Templates
        </h2>
        <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
          <PlusIcon className='w-4 h-4 mr-2' />
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className='text-center py-8'>
          <DocumentDuplicateIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No templates available
          </h3>
          <p className='text-gray-500 mb-4'>
            Create your first project template to get started.
          </p>
          <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
            <PlusIcon className='w-4 h-4 mr-2' />
            Create Template
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {templates.map(template => {
            const stats = getTemplateStats(template);
            return (
              <div
                key={template.id}
                className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => onTemplateSelect && onTemplateSelect(template)}
              >
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {template.name}
                  </h3>
                  <DocumentDuplicateIcon className='w-5 h-5 text-gray-400' />
                </div>

                <p className='text-gray-600 text-sm mb-4'>
                  {template.description || 'No description available'}
                </p>

                <div className='space-y-2 mb-4'>
                  <div className='flex items-center text-sm text-gray-600'>
                    <UserGroupIcon className='w-4 h-4 mr-2' />
                    <span>{stats.phases} phases</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-600'>
                    <CheckCircleIcon className='w-4 h-4 mr-2' />
                    <span>{stats.tasks} tasks</span>
                  </div>
                  <div className='flex items-center text-sm text-gray-600'>
                    <ClockIcon className='w-4 h-4 mr-2' />
                    <span>{stats.duration} days</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    {template.category || 'General'}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onTemplateSelect && onTemplateSelect(template);
                    }}
                    className='text-blue-600 hover:text-blue-900 text-sm font-medium'
                  >
                    Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
