import React, { useState, useRef, useCallback } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';

const PrintExportDialog = ({ isOpen, onClose, contentRef }) => {
  const [exportType, setExportType] = useState('pdf'); // 'pdf' or 'print'
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [scale, setScale] = useState('fit-width'); // 'fit-width', 'fit-height', 'custom'
  const [customScale, setCustomScale] = useState(100);
  const [orientation, setOrientation] = useState('landscape'); // 'portrait' or 'landscape'
  const [includeGrid, setIncludeGrid] = useState(true);
  const [includeGantt, setIncludeGantt] = useState(true);
  const [includeProperties, setIncludeProperties] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [margins, setMargins] = useState({
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  });

  const handleExport = useCallback(async () => {
    if (!contentRef?.current) {
      console.error('Content reference not available');
      return;
    }

    setIsExporting(true);

    try {
      if (exportType === 'pdf') {
        await exportToPDF();
      } else {
        await printContent();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [exportType, dateRange, scale, customScale, orientation, includeGrid, includeGantt, includeProperties, margins, contentRef]);

  const exportToPDF = async () => {
    // Dynamic import for jsPDF and html2canvas
    const [jsPDF, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    const { jsPDF: JsPDF } = jsPDF;
    const html2canvasModule = html2canvas.default || html2canvas;

    // Create a temporary container for the content to be exported
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '100%';
    tempContainer.style.height = '100%';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`;
    document.body.appendChild(tempContainer);

    try {
      // Clone the content
      const contentClone = contentRef.current.cloneNode(true);
      
      // Apply date range filtering if specified
      if (dateRange.start || dateRange.end) {
        applyDateRangeFilter(contentClone, dateRange);
      }

      // Apply visibility settings
      applyVisibilitySettings(contentClone, {
        includeGrid,
        includeGantt,
        includeProperties,
      });

      // Apply scaling
      const scaleValue = scale === 'custom' ? customScale / 100 : 1;
      contentClone.style.transform = `scale(${scaleValue})`;
      contentClone.style.transformOrigin = 'top left';

      tempContainer.appendChild(contentClone);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the content
      const canvas = await html2canvasModule(tempContainer, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
      });

      // Create PDF
      const pdf = new JsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210 - margins.left - margins.right; // A4 width minus margins
      const pageHeight = 297 - margins.top - margins.bottom; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Project Schedule', 105, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
      
      if (dateRange.start || dateRange.end) {
        const rangeText = `Date Range: ${dateRange.start || 'Start'} - ${dateRange.end || 'End'}`;
        pdf.text(rangeText, 105, 32, { align: 'center' });
      }

      // Add content pages
      while (heightLeft >= pageHeight) {
        pdf.addImage(canvas, 'PNG', margins.left, margins.top + position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        
        if (heightLeft >= pageHeight) {
          pdf.addPage();
        }
      }

      if (heightLeft > 0) {
        pdf.addImage(canvas, 'PNG', margins.left, margins.top + position, imgWidth, imgHeight);
      }

      // Save the PDF
      const fileName = `project-schedule-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } finally {
      // Clean up
      document.body.removeChild(tempContainer);
    }
  };

  const printContent = async () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to print the content.');
      return;
    }

    // Clone the content
    const contentClone = contentRef.current.cloneNode(true);
    
    // Apply date range filtering if specified
    if (dateRange.start || dateRange.end) {
      applyDateRangeFilter(contentClone, dateRange);
    }

    // Apply visibility settings
    applyVisibilitySettings(contentClone, {
      includeGrid,
      includeGantt,
      includeProperties,
    });

    // Create print styles
    const printStyles = `
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            font-family: Arial, sans-serif;
          }
          .print-header h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .print-header p {
            font-size: 12px;
            margin: 5px 0;
            color: #666;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        @page {
          size: ${orientation} A4;
          margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
        }
      </style>
    `;

    // Create header content
    const headerContent = `
      <div class="print-header">
        <h1>Project Schedule</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        ${dateRange.start || dateRange.end ? `<p>Date Range: ${dateRange.start || 'Start'} - ${dateRange.end || 'End'}</p>` : ''}
      </div>
    `;

    // Write content to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Project Schedule</title>
          ${printStyles}
        </head>
        <body>
          ${headerContent}
          ${contentClone.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const applyDateRangeFilter = (content, dateRange) => {
    // Apply date range filtering to Gantt chart
    const ganttBars = content.querySelectorAll('.gantt-bar, .milestone-diamond');
    ganttBars.forEach(bar => {
      const taskStart = bar.getAttribute('data-start-date');
      const taskEnd = bar.getAttribute('data-end-date');
      
      if (taskStart && taskEnd) {
        const startDate = new Date(taskStart);
        const endDate = new Date(taskEnd);
        const filterStart = dateRange.start ? new Date(dateRange.start) : null;
        const filterEnd = dateRange.end ? new Date(dateRange.end) : null;
        
        // Hide bars that don't overlap with the date range
        if ((filterStart && endDate < filterStart) || (filterEnd && startDate > filterEnd)) {
          bar.style.display = 'none';
        }
      }
    });
  };

  const applyVisibilitySettings = (content, settings) => {
    // Apply visibility settings based on user preferences
    if (!settings.includeGrid) {
      const gridElement = content.querySelector('.asta-grid');
      if (gridElement) {
        gridElement.style.display = 'none';
      }
    }
    
    if (!settings.includeGantt) {
      const ganttElement = content.querySelector('.gantt-chart');
      if (ganttElement) {
        ganttElement.style.display = 'none';
      }
    }
    
    if (!settings.includeProperties) {
      const propertiesElement = content.querySelector('.task-properties-pane');
      if (propertiesElement) {
        propertiesElement.style.display = 'none';
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Print & Export Options
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Export Type</h3>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportType === 'pdf'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">PDF Export</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="print"
                  checked={exportType === 'print'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <PrinterIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Print</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Date Range (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Scale Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Scale Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="fit-width"
                  checked={scale === 'fit-width'}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Fit to Page Width</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="fit-height"
                  checked={scale === 'fit-height'}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Fit to Page Height</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="custom"
                  checked={scale === 'custom'}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Custom Scale</span>
              </label>
              {scale === 'custom' && (
                <div className="ml-6">
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={customScale}
                    onChange={(e) => setCustomScale(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-600">{customScale}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Page Orientation</h3>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="portrait"
                  checked={orientation === 'portrait'}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Portrait</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="landscape"
                  checked={orientation === 'landscape'}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Landscape</span>
              </label>
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Include Content</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={(e) => setIncludeGrid(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Task Grid</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGantt}
                  onChange={(e) => setIncludeGantt(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Gantt Chart</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProperties}
                  onChange={(e) => setIncludeProperties(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Task Properties</span>
              </label>
            </div>
          </div>

          {/* Margins */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Margins (mm)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Top
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={margins.top}
                  onChange={(e) => setMargins(prev => ({ ...prev, top: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bottom
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={margins.bottom}
                  onChange={(e) => setMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Left
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={margins.left}
                  onChange={(e) => setMargins(prev => ({ ...prev, left: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Right
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={margins.right}
                  onChange={(e) => setMargins(prev => ({ ...prev, right: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                {exportType === 'pdf' ? (
                  <DocumentArrowDownIcon className="w-4 h-4" />
                ) : (
                  <PrinterIcon className="w-4 h-4" />
                )}
                <span>{exportType === 'pdf' ? 'Export PDF' : 'Print'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintExportDialog;
