// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  LinkIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  loadTemplates,
  saveProjectAsTemplate,
  applyTemplate,
  deleteTemplate,
  updateTemplate,
  searchTemplates,
  getTemplatesByCategory,
  getTemplateStats,
  exportTemplate,
  importTemplate,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABELS,
  validateTemplate,
} from '../lib/templates';

const ProjectTemplates = ({ onTemplateSelect, onBackToPortfolio }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Create template form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: TEMPLATE_CATEGORIES.CUSTOM,
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplatesData();
  }, []);

  const loadTemplatesData = async () => {
    try {
      setLoading(true);
      setError('');
      const templatesData = await loadTemplates();
      setTemplates(templatesData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTemplates([template], searchTerm).length > 0;
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle template selection
  const handleTemplateSelect = template => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  // Handle template application
  const handleApplyTemplate = async (template, startDate) => {
    try {
      setProcessing(true);
      setError('');

      const newProject = applyTemplate(template, startDate);

      if (onTemplateSelect) {
        await onTemplateSelect(newProject);
      }

      setShowTemplateModal(false);
      setSelectedTemplate(null);
    } catch (err) {
      setError(err.message);
      console.error('Error applying template:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle template creation
  const handleCreateTemplate = async () => {
    try {
      setProcessing(true);
      setError('');

      // Validate form
      const errors = validateTemplate(createForm);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      // Get current project data (this would come from the current project context)
      const currentProjectData = {
        tasks: [], // This would be populated from the current project
        taskLinks: [],
        resources: [],
        settings: {},
        viewState: {},
      };

      const templateData = {
        ...createForm,
        ...currentProjectData,
      };

      await saveProjectAsTemplate(templateData);

      // Reload templates
      await loadTemplatesData();

      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        category: TEMPLATE_CATEGORIES.CUSTOM,
      });
    } catch (err) {
      setError(err.message);
      console.error('Error creating template:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setProcessing(true);
      setError('');

      await deleteTemplate(selectedTemplate.id);

      // Reload templates
      await loadTemplatesData();

      setShowDeleteModal(false);
      setSelectedTemplate(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting template:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle template export
  const handleExportTemplate = template => {
    try {
      exportTemplate(template);
    } catch (err) {
      setError(err.message);
      console.error('Error exporting template:', err);
    }
  };

  // Handle template import
  const handleImportTemplate = async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setProcessing(true);
      setError('');

      await importTemplate(file);

      // Reload templates
      await loadTemplatesData();

      setShowImportModal(false);
    } catch (err) {
      setError(err.message);
      console.error('Error importing template:', err);
    } finally {
      setProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get category badge color
  const getCategoryBadgeColor = category => {
    const colors = {
      [TEMPLATE_CATEGORIES.CONSTRUCTION]: 'bg-orange-100 text-orange-800',
      [TEMPLATE_CATEGORIES.SOFTWARE]: 'bg-blue-100 text-blue-800',
      [TEMPLATE_CATEGORIES.EVENT]: 'bg-purple-100 text-purple-800',
      [TEMPLATE_CATEGORIES.MANUFACTURING]: 'bg-green-100 text-green-800',
      [TEMPLATE_CATEGORIES.RESEARCH]: 'bg-indigo-100 text-indigo-800',
      [TEMPLATE_CATEGORIES.MARKETING]: 'bg-pink-100 text-pink-800',
      [TEMPLATE_CATEGORIES.CUSTOM]: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors[TEMPLATE_CATEGORIES.CUSTOM];
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading project templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <button
                onClick={onBackToPortfolio}
                className='mr-4 text-gray-400 hover:text-gray-600'
              >
                <XMarkIcon className='w-6 h-6' />
              </button>
              <DocumentDuplicateIcon className='w-8 h-8 text-blue-600 mr-3' />
              <h1 className='text-2xl font-bold text-gray-900'>
                Project Templates
              </h1>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setShowImportModal(true)}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <ArrowUpTrayIcon className='w-4 h-4 mr-2' />
                Import
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <PlusIcon className='w-4 h-4 mr-2' />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search templates...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className='sm:w-64'>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>All Categories</option>
                {Object.entries(TEMPLATE_CATEGORY_LABELS).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex'>
              <InformationCircleIcon className='w-5 h-5 text-red-400 mr-2' />
              <div className='text-sm text-red-600'>{error}</div>
            </div>
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <div className='text-center py-12'>
            <DocumentDuplicateIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No templates found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new template.'}
            </p>
            <div className='mt-6'>
              <button
                onClick={() => setShowCreateModal(true)}
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <PlusIcon className='w-4 h-4 mr-2' />
                Create Template
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredTemplates.map(template => {
              const stats = getTemplateStats(template);
              return (
                <div
                  key={template.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200'
                >
                  <div className='p-6'>
                    {/* Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                          {template.name}
                        </h3>
                        <p className='text-sm text-gray-600 mb-3'>
                          {template.description}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                            template.category
                          )}`}
                        >
                          {TEMPLATE_CATEGORY_LABELS[template.category]}
                        </span>
                        {template.isDefault && (
                          <span className='ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {stats.totalTasks}
                        </div>
                        <div className='text-xs text-gray-500'>Tasks</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {stats.totalDuration}
                        </div>
                        <div className='text-xs text-gray-500'>Days</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {stats.totalDependencies}
                        </div>
                        <div className='text-xs text-gray-500'>
                          Dependencies
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-gray-900'>
                          {stats.totalResources}
                        </div>
                        <div className='text-xs text-gray-500'>Resources</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      >
                        <EyeIcon className='w-4 h-4 mr-2' />
                        Use Template
                      </button>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleExportTemplate(template)}
                          className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                          title='Export template'
                        >
                          <ArrowDownTrayIcon className='w-4 h-4' />
                        </button>
                        {!template.isDefault && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowDeleteModal(true);
                              }}
                              className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                              title='Delete template'
                            >
                              <TrashIcon className='w-4 h-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTemplate}
          form={createForm}
          setForm={setCreateForm}
          processing={processing}
        />
      )}

      {/* Template Details Modal */}
      {showTemplateModal && selectedTemplate && (
        <TemplateDetailsModal
          isOpen={showTemplateModal}
          onClose={() => {
            setShowTemplateModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onApply={handleApplyTemplate}
          processing={processing}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTemplate && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onConfirm={handleDeleteTemplate}
          processing={processing}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTemplate}
          fileInputRef={fileInputRef}
          processing={processing}
        />
      )}
    </div>
  );
};

// Create Template Modal Component
const CreateTemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  processing,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                <PlusIcon className='h-6 w-6 text-blue-600' />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Create New Template
                </h3>
                <div className='mt-4 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Template Name
                    </label>
                    <input
                      type='text'
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter template name'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={e =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter template description'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={e =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    >
                      {Object.entries(TEMPLATE_CATEGORY_LABELS).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              onClick={onSubmit}
              disabled={processing}
              className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
            >
              {processing ? 'Creating...' : 'Create Template'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Details Modal Component
const TemplateDetailsModal = ({
  isOpen,
  onClose,
  template,
  onApply,
  processing,
}) => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const stats = getTemplateStats(template);

  if (!isOpen || !template) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                <DocumentDuplicateIcon className='h-6 w-6 text-blue-600' />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  {template.name}
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    {template.description}
                  </p>
                </div>

                {/* Template Stats */}
                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div className='text-center p-3 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {stats.totalTasks}
                    </div>
                    <div className='text-sm text-gray-500'>Tasks</div>
                  </div>
                  <div className='text-center p-3 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {stats.totalDuration}
                    </div>
                    <div className='text-sm text-gray-500'>Days</div>
                  </div>
                  <div className='text-center p-3 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {stats.totalDependencies}
                    </div>
                    <div className='text-sm text-gray-500'>Dependencies</div>
                  </div>
                  <div className='text-center p-3 bg-gray-50 rounded-lg'>
                    <div className='text-2xl font-bold text-gray-900'>
                      {stats.totalResources}
                    </div>
                    <div className='text-sm text-gray-500'>Resources</div>
                  </div>
                </div>

                {/* Start Date Selection */}
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Project Start Date
                  </label>
                  <input
                    type='date'
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              onClick={() => onApply(template, startDate)}
              disabled={processing}
              className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
            >
              {processing
                ? 'Creating Project...'
                : 'Create Project from Template'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  template,
  onConfirm,
  processing,
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                <TrashIcon className='h-6 w-6 text-red-600' />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Delete Template
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Are you sure you want to delete "{template.name}"? This
                    action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              onClick={onConfirm}
              disabled={processing}
              className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
            >
              {processing ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Modal Component
const ImportModal = ({
  isOpen,
  onClose,
  onImport,
  fileInputRef,
  processing,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                <ArrowUpTrayIcon className='h-6 w-6 text-blue-600' />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Import Template
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Select a JSON file to import a project template.
                  </p>
                </div>
                <div className='mt-4'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.json'
                    onChange={onImport}
                    className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              onClick={onClose}
              className='w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplates;
