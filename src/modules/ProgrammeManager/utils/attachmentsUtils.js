/**
 * Task Attachments Utilities
 * Handle file upload, storage, and preview functionality
 */

/**
 * Default attachments configuration
 */
export const DEFAULT_ATTACHMENTS_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 20,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
  ],
  imageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  previewableTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  storageBucket: 'task-attachments',
  uploadPath: 'uploads',
};

/**
 * File type categories
 */
export const FILE_CATEGORIES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  ARCHIVE: 'archive',
  OTHER: 'other',
};

/**
 * Get file category based on MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} File category
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return FILE_CATEGORIES.OTHER;

  if (mimeType.startsWith('image/')) {
    return FILE_CATEGORIES.IMAGE;
  }

  if (mimeType.includes('word') || mimeType.includes('document') || mimeType === 'application/pdf' || mimeType === 'text/') {
    return FILE_CATEGORIES.DOCUMENT;
  }

  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') {
    return FILE_CATEGORIES.SPREADSHEET;
  }

  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return FILE_CATEGORIES.PRESENTATION;
  }

  if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return FILE_CATEGORIES.ARCHIVE;
  }

  return FILE_CATEGORIES.OTHER;
};

/**
 * Get file icon based on category
 * @param {string} category - File category
 * @returns {string} Icon name
 */
export const getFileIcon = (category) => {
  switch (category) {
    case FILE_CATEGORIES.IMAGE:
      return 'PhotoIcon';
    case FILE_CATEGORIES.DOCUMENT:
      return 'DocumentTextIcon';
    case FILE_CATEGORIES.SPREADSHEET:
      return 'TableCellsIcon';
    case FILE_CATEGORIES.PRESENTATION:
      return 'PresentationChartLineIcon';
    case FILE_CATEGORIES.ARCHIVE:
      return 'ArchiveBoxIcon';
    default:
      return 'DocumentIcon';
  }
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateFile = (file, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  const errors = [];
  const warnings = [];

  // Check file size
  if (file.size > config.maxFileSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(config.maxFileSize)})`);
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Warning for large files
  if (file.size > config.maxFileSize * 0.8) {
    warnings.push('File is approaching the size limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    file,
  };
};

/**
 * Generate unique file name
 * @param {string} originalName - Original file name
 * @param {string} taskId - Task ID
 * @returns {string} Unique file name
 */
export const generateFileName = (originalName, taskId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(`.${extension}`, '');
  
  return `${taskId}_${baseName}_${timestamp}_${random}.${extension}`;
};

/**
 * Create attachment object
 * @param {File} file - File object
 * @param {string} taskId - Task ID
 * @param {string} storagePath - Storage path
 * @returns {Object} Attachment object
 */
export const createAttachment = (file, taskId, storagePath) => {
  const category = getFileCategory(file.type);
  const icon = getFileIcon(category);
  
  return {
    id: `${taskId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    name: file.name,
    originalName: file.name,
    size: file.size,
    type: file.type,
    category,
    icon,
    storagePath,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'current-user', // TODO: Get from auth context
    isPreviewable: DEFAULT_ATTACHMENTS_CONFIG.previewableTypes.includes(file.type),
    isImage: DEFAULT_ATTACHMENTS_CONFIG.imageTypes.includes(file.type),
    downloadUrl: null, // Will be set after upload
    previewUrl: null, // Will be set for images
  };
};

/**
 * Upload file to Supabase storage
 * @param {File} file - File to upload
 * @param {string} taskId - Task ID
 * @param {Object} supabaseClient - Supabase client
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Upload result
 */
export const uploadFile = async (file, taskId, supabaseClient, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  try {
    // Validate file
    const validation = validateFile(file, config);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate file name and path
    const fileName = generateFileName(file.name, taskId);
    const filePath = `${config.uploadPath}/${taskId}/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabaseClient.storage
      .from(config.storageBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(config.storageBucket)
      .getPublicUrl(filePath);

    // Create attachment object
    const attachment = createAttachment(file, taskId, filePath);
    attachment.downloadUrl = urlData.publicUrl;

    // Generate preview URL for images
    if (attachment.isImage) {
      attachment.previewUrl = urlData.publicUrl;
    }

    return {
      success: true,
      attachment,
      data,
    };

  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Supabase storage
 * @param {Object} attachment - Attachment object
 * @param {Object} supabaseClient - Supabase client
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Delete result
 */
export const deleteFile = async (attachment, supabaseClient, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  try {
    const { error } = await supabaseClient.storage
      .from(config.storageBucket)
      .remove([attachment.storagePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return {
      success: true,
    };

  } catch (error) {
    console.error('File delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get file preview URL
 * @param {Object} attachment - Attachment object
 * @param {Object} supabaseClient - Supabase client
 * @param {Object} config - Configuration
 * @returns {string} Preview URL
 */
export const getPreviewUrl = (attachment, supabaseClient, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  if (attachment.previewUrl) {
    return attachment.previewUrl;
  }

  if (attachment.isPreviewable) {
    const { data } = supabaseClient.storage
      .from(config.storageBucket)
      .getPublicUrl(attachment.storagePath);
    
    return data.publicUrl;
  }

  return null;
};

/**
 * Download file
 * @param {Object} attachment - Attachment object
 * @param {Object} supabaseClient - Supabase client
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} Download result
 */
export const downloadFile = async (attachment, supabaseClient, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(config.storageBucket)
      .download(attachment.storagePath);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    // Create download link
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
    };

  } catch (error) {
    console.error('File download error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate attachments array
 * @param {Array} attachments - Attachments array
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateAttachments = (attachments, config = DEFAULT_ATTACHMENTS_CONFIG) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(attachments)) {
    errors.push('Attachments must be an array');
    return { isValid: false, errors, warnings };
  }

  if (attachments.length > config.maxFiles) {
    errors.push(`Maximum number of files (${config.maxFiles}) exceeded`);
  }

  // Check for duplicate file names
  const fileNames = attachments.map(att => att.originalName);
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
  
  if (duplicates.length > 0) {
    warnings.push(`Duplicate file names found: ${duplicates.join(', ')}`);
  }

  // Check total size
  const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
  const maxTotalSize = config.maxFileSize * config.maxFiles;
  
  if (totalSize > maxTotalSize) {
    warnings.push(`Total file size (${formatFileSize(totalSize)}) is approaching the limit`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalSize,
    fileCount: attachments.length,
  };
};

/**
 * Get attachments statistics
 * @param {Array} attachments - Attachments array
 * @returns {Object} Statistics
 */
export const getAttachmentsStatistics = (attachments) => {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      categories: {},
      previewableCount: 0,
      imageCount: 0,
    };
  }

  const categories = {};
  let totalSize = 0;
  let previewableCount = 0;
  let imageCount = 0;

  attachments.forEach(attachment => {
    totalSize += attachment.size;
    
    if (attachment.isPreviewable) {
      previewableCount++;
    }
    
    if (attachment.isImage) {
      imageCount++;
    }

    const category = attachment.category;
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    totalFiles: attachments.length,
    totalSize,
    categories,
    previewableCount,
    imageCount,
  };
};

/**
 * Sort attachments
 * @param {Array} attachments - Attachments array
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Array} Sorted attachments
 */
export const sortAttachments = (attachments, sortBy = 'uploadedAt', sortOrder = 'desc') => {
  if (!Array.isArray(attachments)) return [];

  return [...attachments].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === 'uploadedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Filter attachments
 * @param {Array} attachments - Attachments array
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered attachments
 */
export const filterAttachments = (attachments, filters = {}) => {
  if (!Array.isArray(attachments)) return [];

  return attachments.filter(attachment => {
    // Category filter
    if (filters.category && attachment.category !== filters.category) {
      return false;
    }

    // Type filter
    if (filters.type && !attachment.type.includes(filters.type)) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fileName = attachment.name.toLowerCase();
      const originalName = attachment.originalName.toLowerCase();
      
      if (!fileName.includes(searchTerm) && !originalName.includes(searchTerm)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const uploadDate = new Date(attachment.uploadedAt);
      
      if (filters.dateFrom && uploadDate < new Date(filters.dateFrom)) {
        return false;
      }
      
      if (filters.dateTo && uploadDate > new Date(filters.dateTo)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Export attachments data
 * @param {Array} attachments - Attachments array
 * @param {Object} task - Associated task
 * @returns {Object} Exportable data
 */
export const exportAttachments = (attachments, task) => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    taskId: task?.id,
    taskName: task?.name,
    attachments: attachments.map(att => ({
      id: att.id,
      name: att.name,
      originalName: att.originalName,
      size: att.size,
      type: att.type,
      category: att.category,
      uploadedAt: att.uploadedAt,
      uploadedBy: att.uploadedBy,
      storagePath: att.storagePath,
    })),
    statistics: getAttachmentsStatistics(attachments),
    metadata: {
      description: 'Task attachments export',
      format: 'json',
    },
  };
};

/**
 * Import attachments data
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importAttachments = (importData) => {
  const errors = [];
  const warnings = [];

  if (!importData.attachments) {
    errors.push('No attachments data found in import');
  }

  if (!Array.isArray(importData.attachments)) {
    errors.push('Attachments data must be an array');
  }

  if (importData.attachments && importData.attachments.length > DEFAULT_ATTACHMENTS_CONFIG.maxFiles) {
    errors.push(`Import contains too many files (${importData.attachments.length} > ${DEFAULT_ATTACHMENTS_CONFIG.maxFiles})`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    attachments: importData.attachments || [],
  };
};
