import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  createNotes,
  updateNotes,
  validateNotes,
  sanitizeNotesContent,
  getNotesStatistics,
  formatNotes,
  exportNotes,
  importNotes,
  createAutoSaveHandler,
  getQuillConfig,
  getNotesPreview,
  hasUnsavedChanges,
  DEFAULT_NOTES_CONFIG,
} from '../../utils/notesUtils';

const NotesTab = ({ task, onTaskUpdate }) => {
  const [notes, setNotes] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);

  const quillRef = useRef(null);
  const autoSaveHandlerRef = useRef(null);

  // Initialize notes when task changes
  useEffect(() => {
    if (task) {
      const taskNotes = task.notes || createNotes();
      setNotes(taskNotes);
      setEditorContent(taskNotes.content || '');
      setLastSaved(
        taskNotes.lastModified ? new Date(taskNotes.lastModified) : null
      );

      // Initialize auto-save handler
      autoSaveHandlerRef.current = createAutoSaveHandler(
        handleSaveNotes,
        DEFAULT_NOTES_CONFIG
      );
    }
  }, [task]);

  // Validate content when it changes
  useEffect(() => {
    const validation = validateNotes(editorContent, DEFAULT_NOTES_CONFIG);
    setValidation(validation);
  }, [editorContent]);

  // Handle content change
  const handleContentChange = useCallback(
    (content, delta, source, editor) => {
      setEditorContent(content);

      // Trigger auto-save
      if (autoSaveHandlerRef.current && source === 'user') {
        autoSaveHandlerRef.current.trigger(content, task);
        setAutoSaveStatus('saving');
      }
    },
    [task]
  );

  // Save notes function
  const handleSaveNotes = useCallback(
    async (content, taskToUpdate) => {
      if (!taskToUpdate) return;

      try {
        const sanitizedContent = sanitizeNotesContent(
          content,
          DEFAULT_NOTES_CONFIG
        );
        const updatedNotes = updateNotes(
          notes,
          sanitizedContent,
          DEFAULT_NOTES_CONFIG
        );

        // Update task with new notes
        const updatedTask = {
          ...taskToUpdate,
          notes: updatedNotes,
        };

        await onTaskUpdate(updatedTask.id, updatedTask);

        setNotes(updatedNotes);
        setLastSaved(new Date());
        setAutoSaveStatus('saved');

        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save notes:', error);
        setAutoSaveStatus('error');
      }
    },
    [notes, onTaskUpdate]
  );

  // Force save
  const handleForceSave = useCallback(async () => {
    if (!autoSaveHandlerRef.current) return;

    try {
      setAutoSaveStatus('saving');
      await autoSaveHandlerRef.current.forceSave(editorContent, task);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Force save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [editorContent, task]);

  // Export notes
  const handleExport = () => {
    const exportData = exportNotes(notes, task);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-notes-${task?.id || 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import notes
  const handleImport = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importNotes(importData, DEFAULT_NOTES_CONFIG);

        if (importResult.success) {
          setNotes(importResult.notes);
          setEditorContent(importResult.notes.content);
          handleSaveNotes(importResult.notes.content, task);
        } else {
          console.error('Import failed:', importResult.errors);
        }
      } catch (error) {
        console.error('Failed to parse import file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Clear notes
  const handleClearNotes = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all notes? This action cannot be undone.'
      )
    ) {
      const emptyNotes = createNotes('', DEFAULT_NOTES_CONFIG);
      setNotes(emptyNotes);
      setEditorContent('');
      handleSaveNotes('', task);
    }
  };

  // Get statistics
  const statistics = getNotesStatistics(notes);
  const hasChanges = hasUnsavedChanges(notes, editorContent);
  const quillConfig = getQuillConfig(DEFAULT_NOTES_CONFIG);

  if (!task) {
    return (
      <div className='flex-1 bg-gray-50 p-4'>
        <div className='text-center text-gray-500'>
          <DocumentTextIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
          <p>Select a task to view notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 bg-gray-50 p-4 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <DocumentTextIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Task Notes</h3>
        </div>

        <div className='flex items-center gap-2'>
          {/* Auto-save status */}
          <div className='flex items-center gap-1 text-xs'>
            {autoSaveStatus === 'saving' && (
              <>
                <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse' />
                <span className='text-yellow-700'>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckIcon className='w-3 h-3 text-green-600' />
                <span className='text-green-700'>Saved</span>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <ExclamationTriangleIcon className='w-3 h-3 text-red-600' />
                <span className='text-red-700'>Error</span>
              </>
            )}
          </div>

          {/* Last saved indicator */}
          {lastSaved && (
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <ClockIcon className='w-3 h-3' />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className='bg-white border border-gray-200 rounded-lg p-3 mb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleForceSave}
              disabled={!hasChanges || autoSaveStatus === 'saving'}
              className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Save Now
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className='px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              {showPreview ? (
                <>
                  <EyeSlashIcon className='w-3 h-3 inline mr-1' />
                  Hide Preview
                </>
              ) : (
                <>
                  <EyeIcon className='w-3 h-3 inline mr-1' />
                  Show Preview
                </>
              )}
            </button>
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
              className='px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
            >
              <DocumentArrowDownIcon className='w-3 h-3 inline mr-1' />
              Export
            </button>

            <button
              onClick={handleClearNotes}
              className='px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
            >
              <TrashIcon className='w-3 h-3 inline mr-1' />
              Clear
            </button>
          </div>
        </div>
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

      {/* Editor */}
      <div className='bg-white border border-gray-200 rounded-lg mb-4'>
        <ReactQuill
          ref={quillRef}
          value={editorContent}
          onChange={handleContentChange}
          {...quillConfig}
          style={{ height: '300px' }}
        />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
          <h4 className='text-sm font-semibold text-gray-700 mb-2'>Preview</h4>
          <div
            className='prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: editorContent }}
          />
        </div>
      )}

      {/* Statistics */}
      <div className='bg-white border border-gray-200 rounded-lg p-4'>
        <h4 className='text-sm font-semibold text-gray-700 mb-3'>Statistics</h4>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='text-gray-600'>Words:</span>
            <div className='font-semibold text-blue-600'>
              {statistics.wordCount}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Characters:</span>
            <div className='font-semibold text-green-600'>
              {statistics.characterCount}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Lines:</span>
            <div className='font-semibold text-purple-600'>
              {statistics.lineCount}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Paragraphs:</span>
            <div className='font-semibold text-orange-600'>
              {statistics.paragraphCount}
            </div>
          </div>
        </div>

        {/* Progress bar for character limit */}
        <div className='mt-3'>
          <div className='flex justify-between text-xs text-gray-600 mb-1'>
            <span>Character Usage</span>
            <span>
              {statistics.characterCount} / {DEFAULT_NOTES_CONFIG.maxLength}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                statistics.characterCount > DEFAULT_NOTES_CONFIG.maxLength * 0.8
                  ? 'bg-red-500'
                  : statistics.characterCount >
                      DEFAULT_NOTES_CONFIG.maxLength * 0.6
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min((statistics.characterCount / DEFAULT_NOTES_CONFIG.maxLength) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Notes Preview */}
      <div className='bg-white border border-gray-200 rounded-lg p-4 mt-4'>
        <h4 className='text-sm font-semibold text-gray-700 mb-2'>
          Notes Preview
        </h4>
        <div className='text-sm text-gray-600 bg-gray-50 p-3 rounded'>
          {getNotesPreview(notes, 30)}
        </div>
      </div>
    </div>
  );
};

export default NotesTab;
