import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PaperClipIcon,
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  ArchiveBoxIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import {
  validateFile,
  uploadFile,
  deleteFile,
  downloadFile,
  getPreviewUrl,
  formatFileSize,
  getFileCategory,
  getFileIcon,
  getAttachmentsStatistics,
  sortAttachments,
  filterAttachments,
  exportAttachments,
  importAttachments,
  validateAttachments,
  DEFAULT_ATTACHMENTS_CONFIG,
  FILE_CATEGORIES,
} from '../../utils/attachmentsUtils';

const AttachmentsTab = ({ task, onTaskUpdate, supabaseClient }) => {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showPreview, setShowPreview] = useState({});
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Initialize attachments when task changes
  useEffect(() => {
    if (task) {
      setAttachments(task.attachments || []);
    }
  }, [task]);

  // Validate attachments when they change
  useEffect(() => {
    const validation = validateAttachments(
      attachments,
      DEFAULT_ATTACHMENTS_CONFIG
    );
    setValidation(validation);
  }, [attachments]);

  // Handle file selection
  const handleFileSelect = useCallback(files => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
  }, []);

  // Handle file input change
  const handleFileInputChange = event => {
    handleFileSelect(event.target.files);
  };

  // Handle drag events
  const handleDrag = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Upload files
  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length || !task) return;

    if (!supabaseClient) {
      console.warn('Supabase client not available. File uploads are disabled.');
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    const uploadPromises = selectedFiles.map(async (file, index) => {
      try {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const result = await uploadFile(
          file,
          task.id,
          supabaseClient,
          DEFAULT_ATTACHMENTS_CONFIG
        );

        if (result.success) {
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          return result.attachment;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setUploadProgress(prev => ({ ...prev, [index]: -1 }));
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);

      if (successfulUploads.length > 0) {
        const updatedAttachments = [...attachments, ...successfulUploads];
        const updatedTask = {
          ...task,
          attachments: updatedAttachments,
        };

        await onTaskUpdate(task.id, updatedTask);
        setAttachments(updatedAttachments);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedFiles, task, supabaseClient, attachments, onTaskUpdate]);

  // Delete attachment
  const handleDeleteAttachment = useCallback(
    async attachment => {
      if (!task) return;

      if (!supabaseClient) {
        console.warn(
          'Supabase client not available. File deletion is disabled.'
        );
        return;
      }

      if (
        !window.confirm(
          `Are you sure you want to delete "${attachment.originalName}"?`
        )
      ) {
        return;
      }

      try {
        const result = await deleteFile(
          attachment,
          supabaseClient,
          DEFAULT_ATTACHMENTS_CONFIG
        );

        if (result.success) {
          const updatedAttachments = attachments.filter(
            att => att.id !== attachment.id
          );
          const updatedTask = {
            ...task,
            attachments: updatedAttachments,
          };

          await onTaskUpdate(task.id, updatedTask);
          setAttachments(updatedAttachments);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    },
    [task, supabaseClient, attachments, onTaskUpdate]
  );

  // Download attachment
  const handleDownloadAttachment = useCallback(
    async attachment => {
      if (!supabaseClient) return;

      try {
        await downloadFile(
          attachment,
          supabaseClient,
          DEFAULT_ATTACHMENTS_CONFIG
        );
      } catch (error) {
        console.error('Download failed:', error);
      }
    },
    [supabaseClient]
  );

  // Toggle preview
  const handleTogglePreview = useCallback(attachmentId => {
    setShowPreview(prev => ({
      ...prev,
      [attachmentId]: !prev[attachmentId],
    }));
  }, []);

  // Export attachments
  const handleExport = () => {
    const exportData = exportAttachments(attachments, task);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-attachments-${task?.id || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import attachments
  const handleImport = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importAttachments(importData);

        if (importResult.success) {
          // Note: This only imports metadata, not the actual files
          console.log('Import successful:', importResult.attachments);
        } else {
          console.error('Import failed:', importResult.errors);
        }
      } catch (error) {
        console.error('Failed to parse import file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Get filtered and sorted attachments
  const filteredAttachments = filterAttachments(attachments, {
    ...filters,
    search: searchTerm,
  });
  const sortedAttachments = sortAttachments(
    filteredAttachments,
    sortBy,
    sortOrder
  );
  const statistics = getAttachmentsStatistics(attachments);

  // Get icon component
  const getIconComponent = iconName => {
    const iconMap = {
      PhotoIcon,
      DocumentTextIcon,
      TableCellsIcon,
      PresentationChartLineIcon,
      ArchiveBoxIcon,
      DocumentIcon,
    };
    return iconMap[iconName] || DocumentIcon;
  };

  if (!task) {
    return (
      <div className='flex-1 bg-gray-50 p-4'>
        <div className='text-center text-gray-500'>
          <PaperClipIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
          <p>Select a task to view attachments</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 bg-gray-50 p-4 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <PaperClipIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Task Attachments
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          <label className='px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer'>
            <DocumentArrowUpIcon className='w-3 h-3 inline mr-1' />
            Import
            <input
              type='file'
              accept='.json'
              onChange={handleImport}
              className='hidden'
            />
          </label>

          <button
            onClick={handleExport}
            disabled={attachments.length === 0}
            className='px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <DocumentArrowDownIcon className='w-3 h-3 inline mr-1' />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <h4 className='text-sm font-semibold text-gray-700 mb-3'>Statistics</h4>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='text-gray-600'>Total Files:</span>
            <div className='font-semibold text-blue-600'>
              {statistics.totalFiles}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Total Size:</span>
            <div className='font-semibold text-green-600'>
              {formatFileSize(statistics.totalSize)}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Images:</span>
            <div className='font-semibold text-purple-600'>
              {statistics.imageCount}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Previewable:</span>
            <div className='font-semibold text-orange-600'>
              {statistics.previewableCount}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <h4 className='text-sm font-semibold text-gray-700 mb-3'>
          Upload Files
        </h4>

        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ArrowUpTrayIcon className='w-8 h-8 mx-auto mb-2 text-gray-400' />
          <p className='text-sm text-gray-600 mb-2'>
            Drag and drop files here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className='text-blue-600 hover:text-blue-700 underline'
            >
              browse
            </button>
          </p>
          <p className='text-xs text-gray-500'>
            Maximum file size:{' '}
            {formatFileSize(DEFAULT_ATTACHMENTS_CONFIG.maxFileSize)} | Maximum
            files: {DEFAULT_ATTACHMENTS_CONFIG.maxFiles}
          </p>

          <input
            ref={fileInputRef}
            type='file'
            multiple
            onChange={handleFileInputChange}
            className='hidden'
            accept={DEFAULT_ATTACHMENTS_CONFIG.allowedTypes.join(',')}
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className='mt-4'>
            <h5 className='text-xs font-medium text-gray-700 mb-2'>
              Selected Files:
            </h5>
            <div className='space-y-2 max-h-32 overflow-y-auto'>
              {selectedFiles.map((file, index) => {
                const IconComponent = getIconComponent(
                  getFileIcon(getFileCategory(file.type))
                );
                const progress = uploadProgress[index];

                return (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                  >
                    <div className='flex items-center gap-2'>
                      <IconComponent className='w-4 h-4 text-gray-600' />
                      <span className='text-sm text-gray-700'>{file.name}</span>
                      <span className='text-xs text-gray-500'>
                        ({formatFileSize(file.size)})
                      </span>
                    </div>

                    {progress !== undefined && (
                      <div className='flex items-center gap-2'>
                        {progress === 100 && (
                          <CheckIcon className='w-4 h-4 text-green-600' />
                        )}
                        {progress === -1 && (
                          <XMarkIcon className='w-4 h-4 text-red-600' />
                        )}
                        {progress >= 0 && progress < 100 && (
                          <div className='w-16 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className='mt-3 flex gap-2'>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className='px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>

              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setUploadProgress({});
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
                className='px-4 py-2 text-gray-700 bg-white border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      {!validation.isValid && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-lg mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
            <span className='text-sm font-medium text-red-900'>
              Validation Errors
            </span>
          </div>
          <ul className='text-xs text-red-700 space-y-1'>
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
            <span className='text-sm font-medium text-yellow-900'>
              Warnings
            </span>
          </div>
          <ul className='text-xs text-yellow-700 space-y-1'>
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search and Filters */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <MagnifyingGlassIcon className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search attachments...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <FunnelIcon className='w-4 h-4 text-gray-600' />
            <select
              value={filters.category || ''}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  category: e.target.value || undefined,
                }))
              }
              className='px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Categories</option>
              {Object.values(FILE_CATEGORIES).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className='px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='uploadedAt-desc'>Newest First</option>
              <option value='uploadedAt-asc'>Oldest First</option>
              <option value='name-asc'>Name A-Z</option>
              <option value='name-desc'>Name Z-A</option>
              <option value='size-desc'>Largest First</option>
              <option value='size-asc'>Smallest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attachments List */}
      <div className='bg-white border border-gray-200 rounded-lg'>
        <div className='p-4 border-b border-gray-200'>
          <h4 className='text-sm font-semibold text-gray-700'>
            Attachments ({sortedAttachments.length})
          </h4>
        </div>

        {sortedAttachments.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <PaperClipIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
            <p>No attachments found</p>
            <p className='text-sm'>Upload files to get started</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {sortedAttachments.map(attachment => {
              const IconComponent = getIconComponent(attachment.icon);

              return (
                <div key={attachment.id} className='p-4 hover:bg-gray-50'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <IconComponent className='w-8 h-8 text-gray-600 mt-1' />

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h5 className='text-sm font-medium text-gray-900 truncate'>
                            {attachment.originalName}
                          </h5>
                          <span className='text-xs text-gray-500'>
                            {formatFileSize(attachment.size)}
                          </span>
                        </div>

                        <div className='text-xs text-gray-500'>
                          Uploaded{' '}
                          {new Date(attachment.uploadedAt).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(attachment.uploadedAt).toLocaleTimeString()}
                        </div>

                        {attachment.isPreviewable && (
                          <button
                            onClick={() => handleTogglePreview(attachment.id)}
                            className='text-xs text-blue-600 hover:text-blue-700 mt-1'
                          >
                            {showPreview[attachment.id]
                              ? 'Hide Preview'
                              : 'Show Preview'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-1'>
                      {attachment.isPreviewable && (
                        <button
                          onClick={() => handleTogglePreview(attachment.id)}
                          className='p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100'
                          title='Preview'
                        >
                          <EyeIcon className='w-4 h-4' />
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadAttachment(attachment)}
                        className='p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100'
                        title='Download'
                      >
                        <ArrowDownTrayIcon className='w-4 h-4' />
                      </button>

                      <button
                        onClick={() => handleDeleteAttachment(attachment)}
                        className='p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50'
                        title='Delete'
                      >
                        <TrashIcon className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {showPreview[attachment.id] && attachment.isPreviewable && (
                    <div className='mt-3 p-3 bg-gray-50 rounded border'>
                      {attachment.isImage ? (
                        <img
                          src={
                            attachment.previewUrl ||
                            getPreviewUrl(attachment, supabaseClient)
                          }
                          alt={attachment.originalName}
                          className='max-w-full max-h-64 object-contain rounded'
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <div className='text-center py-8'>
                          <DocumentTextIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
                          <p className='text-sm text-gray-500'>
                            Preview not available
                          </p>
                          <button
                            onClick={() => handleDownloadAttachment(attachment)}
                            className='text-xs text-blue-600 hover:text-blue-700 mt-1'
                          >
                            Download to view
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsTab;
