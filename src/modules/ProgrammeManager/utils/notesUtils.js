/**
 * Task Notes Utilities
 * Handle rich text notes management and auto-save functionality
 */

/**
 * Default notes configuration
 */
export const DEFAULT_NOTES_CONFIG = {
  autoSaveDelay: 2000, // 2 seconds
  maxLength: 10000,
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
  allowedAttributes: {
    a: ['href', 'target', 'title'],
  },
  placeholder: 'Add notes for this task...',
  toolbarOptions: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['link', 'blockquote'],
    ['clean']
  ],
};

/**
 * Create a new notes object
 * @param {string} content - Initial content
 * @param {Object} config - Configuration
 * @returns {Object} Notes object
 */
export const createNotes = (content = '', config = DEFAULT_NOTES_CONFIG) => {
  return {
    content: content || '',
    lastModified: new Date().toISOString(),
    version: 1,
    wordCount: calculateWordCount(content),
    characterCount: content.length,
    isEmpty: !content || content.trim().length === 0,
  };
};

/**
 * Calculate word count from HTML content
 * @param {string} htmlContent - HTML content
 * @returns {number} Word count
 */
export const calculateWordCount = (htmlContent) => {
  if (!htmlContent) return 0;
  
  // Remove HTML tags and get text content
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Split by whitespace and filter out empty strings
  const words = textContent.split(/\s+/).filter(word => word.length > 0);
  
  return words.length;
};

/**
 * Calculate character count from HTML content
 * @param {string} htmlContent - HTML content
 * @returns {number} Character count
 */
export const calculateCharacterCount = (htmlContent) => {
  if (!htmlContent) return 0;
  
  // Remove HTML tags and get text content
  const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
  
  return textContent.length;
};

/**
 * Update notes content
 * @param {Object} notes - Current notes object
 * @param {string} newContent - New content
 * @param {Object} config - Configuration
 * @returns {Object} Updated notes object
 */
export const updateNotes = (notes, newContent, config = DEFAULT_NOTES_CONFIG) => {
  const wordCount = calculateWordCount(newContent);
  const characterCount = calculateCharacterCount(newContent);
  
  return {
    ...notes,
    content: newContent,
    lastModified: new Date().toISOString(),
    version: (notes.version || 1) + 1,
    wordCount,
    characterCount,
    isEmpty: !newContent || newContent.trim().length === 0,
  };
};

/**
 * Validate notes content
 * @param {string} content - Notes content
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateNotes = (content, config = DEFAULT_NOTES_CONFIG) => {
  const errors = [];
  const warnings = [];

  if (content.length > config.maxLength) {
    errors.push(`Notes exceed maximum length of ${config.maxLength} characters`);
  }

  if (content.length > config.maxLength * 0.8) {
    warnings.push(`Notes are approaching the maximum length limit`);
  }

  // Check for potentially unsafe HTML
  const unsafeTags = content.match(/<script|javascript:|on\w+\s*=/gi);
  if (unsafeTags) {
    errors.push('Notes contain potentially unsafe content');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Sanitize HTML content
 * @param {string} content - Raw HTML content
 * @param {Object} config - Configuration
 * @returns {string} Sanitized HTML content
 */
export const sanitizeNotesContent = (content, config = DEFAULT_NOTES_CONFIG) => {
  if (!content) return '';

  let sanitized = content;

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Only allow specified tags
  const allowedTagsRegex = new RegExp(`<(?!\/?(?:${config.allowedTags.join('|')})\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(allowedTagsRegex, '');

  return sanitized;
};

/**
 * Get notes statistics
 * @param {Object} notes - Notes object
 * @returns {Object} Statistics
 */
export const getNotesStatistics = (notes) => {
  if (!notes || !notes.content) {
    return {
      wordCount: 0,
      characterCount: 0,
      lineCount: 0,
      paragraphCount: 0,
      isEmpty: true,
    };
  }

  const content = notes.content;
  const wordCount = calculateWordCount(content);
  const characterCount = calculateCharacterCount(content);
  const lineCount = (content.match(/\n/g) || []).length + 1;
  const paragraphCount = (content.match(/<p[^>]*>/gi) || []).length;

  return {
    wordCount,
    characterCount,
    lineCount,
    paragraphCount,
    isEmpty: notes.isEmpty,
  };
};

/**
 * Format notes for display
 * @param {Object} notes - Notes object
 * @returns {Object} Formatted notes
 */
export const formatNotes = (notes) => {
  if (!notes) {
    return {
      content: '',
      lastModified: null,
      version: 0,
      statistics: getNotesStatistics(null),
      isEmpty: true,
    };
  }

  return {
    content: notes.content || '',
    lastModified: notes.lastModified ? new Date(notes.lastModified) : new Date(),
    version: notes.version || 1,
    statistics: getNotesStatistics(notes),
    isEmpty: notes.isEmpty || false,
  };
};

/**
 * Export notes data
 * @param {Object} notes - Notes object
 * @param {Object} task - Associated task
 * @returns {Object} Exportable notes data
 */
export const exportNotes = (notes, task) => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    taskId: task?.id,
    taskName: task?.name,
    notes: formatNotes(notes),
    metadata: {
      description: 'Task notes export',
      format: 'rich-text',
    },
  };
};

/**
 * Import notes data
 * @param {Object} importData - Import data object
 * @param {Object} config - Configuration
 * @returns {Object} Import result
 */
export const importNotes = (importData, config = DEFAULT_NOTES_CONFIG) => {
  const errors = [];
  const warnings = [];

  if (!importData.notes) {
    errors.push('No notes data found in import');
  }

  if (importData.notes && importData.notes.content) {
    const validation = validateNotes(importData.notes.content, config);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    // Sanitize content
    importData.notes.content = sanitizeNotesContent(importData.notes.content, config);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    notes: importData.notes ? formatNotes(importData.notes) : createNotes(),
  };
};

/**
 * Create auto-save handler
 * @param {Function} saveFunction - Function to call for saving
 * @param {Object} config - Configuration
 * @returns {Object} Auto-save handler
 */
export const createAutoSaveHandler = (saveFunction, config = DEFAULT_NOTES_CONFIG) => {
  let timeoutId = null;
  let lastContent = '';
  let isSaving = false;

  const handler = {
    /**
     * Trigger auto-save
     * @param {string} content - Current content
     * @param {Object} task - Task object
     */
    trigger: (content, task) => {
      if (content === lastContent || isSaving) {
        return;
      }

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      timeoutId = setTimeout(async () => {
        if (content !== lastContent) {
          isSaving = true;
          lastContent = content;
          
          try {
            await saveFunction(content, task);
          } catch (error) {
            console.error('Auto-save failed:', error);
          } finally {
            isSaving = false;
          }
        }
      }, config.autoSaveDelay);
    },

    /**
     * Force immediate save
     * @param {string} content - Current content
     * @param {Object} task - Task object
     */
    forceSave: async (content, task) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (content !== lastContent) {
        isSaving = true;
        lastContent = content;
        
        try {
          await saveFunction(content, task);
        } catch (error) {
          console.error('Force save failed:', error);
          throw error;
        } finally {
          isSaving = false;
        }
      }
    },

    /**
     * Cancel pending auto-save
     */
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },

    /**
     * Check if currently saving
     * @returns {boolean} Whether currently saving
     */
    isSaving: () => isSaving,

    /**
     * Get last saved content
     * @returns {string} Last saved content
     */
    getLastContent: () => lastContent,
  };

  return handler;
};

/**
 * Get Quill editor configuration
 * @param {Object} config - Configuration
 * @returns {Object} Quill configuration
 */
export const getQuillConfig = (config = DEFAULT_NOTES_CONFIG) => {
  return {
    theme: 'snow',
    placeholder: config.placeholder,
    modules: {
      toolbar: config.toolbarOptions,
      clipboard: {
        matchVisual: false,
      },
    },
    formats: [
      'bold', 'italic', 'underline',
      'list', 'bullet',
      'header',
      'link', 'blockquote',
    ],
  };
};

/**
 * Get notes preview (first few words)
 * @param {Object} notes - Notes object
 * @param {number} maxWords - Maximum words to show
 * @returns {string} Preview text
 */
export const getNotesPreview = (notes, maxWords = 20) => {
  if (!notes || !notes.content || notes.isEmpty) {
    return 'No notes';
  }

  // Remove HTML tags and get text content
  const textContent = notes.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (textContent.length === 0) {
    return 'No notes';
  }

  const words = textContent.split(/\s+/);
  
  if (words.length <= maxWords) {
    return textContent;
  }

  return words.slice(0, maxWords).join(' ') + '...';
};

/**
 * Check if notes have unsaved changes
 * @param {Object} notes - Current notes
 * @param {string} currentContent - Current editor content
 * @returns {boolean} Whether there are unsaved changes
 */
export const hasUnsavedChanges = (notes, currentContent) => {
  if (!notes) return currentContent && currentContent.trim().length > 0;
  
  const notesContent = notes.content || '';
  return notesContent !== currentContent;
};

/**
 * Get notes history (if available)
 * @param {Object} notes - Notes object
 * @returns {Array} History entries
 */
export const getNotesHistory = (notes) => {
  if (!notes || !notes.history) {
    return [];
  }

  return notes.history.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp),
  })).sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Add notes history entry
 * @param {Object} notes - Notes object
 * @param {string} content - Content at this point
 * @param {string} action - Action performed
 * @returns {Object} Updated notes object
 */
export const addNotesHistoryEntry = (notes, content, action = 'modified') => {
  const history = notes.history || [];
  
  return {
    ...notes,
    history: [
      ...history,
      {
        timestamp: new Date().toISOString(),
        content: content,
        action: action,
        version: (notes.version || 1) + 1,
      },
    ].slice(-10), // Keep only last 10 entries
  };
};
