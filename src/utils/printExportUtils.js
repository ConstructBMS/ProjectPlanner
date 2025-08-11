// Print and Export Utilities for Gantt Charts and Task Grids
// Supports PDF, PNG, and Excel export with advanced formatting options

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Print layout renderer
export class PrintLayoutRenderer {
  constructor(settings) {
    this.settings = settings;
    this.pageSize = this.getPageSize(settings.pageSize);
    this.orientation = settings.orientation;
    this.scaling = settings.scaling / 100;
  }

  getPageSize(pageSize) {
    const sizes = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      letter: { width: 216, height: 279 },
      legal: { width: 216, height: 356 },
    };
    return sizes[pageSize] || sizes.a4;
  }

  // Generate print-ready HTML
  generatePrintHTML(tasks, taskLinks, viewState) {
    const {
      includeGrid,
      includeGantt,
      includeHeaders,
      includeFooters,
      showPageNumbers,
      showDateRange,
      showProjectInfo,
    } = this.settings;

    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Schedule</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .print-page { page-break-after: always; }
              .print-page:last-child { page-break-after: avoid; }
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }

            .print-container {
              width: ${this.pageSize.width}mm;
              height: ${this.pageSize.height}mm;
              margin: 0 auto;
              padding: 20mm;
              box-sizing: border-box;
              transform: scale(${this.scaling});
              transform-origin: top left;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }

            .project-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }

            .project-info {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }

            .date-range {
              font-size: 14px;
              color: #333;
              margin-bottom: 10px;
            }

            .task-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }

            .task-grid th,
            .task-grid td {
              border: 1px solid #ddd;
              padding: 4px 6px;
              text-align: left;
            }

            .task-grid th {
              background-color: #f5f5f5;
              font-weight: bold;
            }

            .gantt-chart {
              width: 100%;
              height: 400px;
              border: 1px solid #ddd;
              margin-bottom: 20px;
              position: relative;
              overflow: hidden;
            }

            .gantt-header {
              height: 30px;
              background-color: #f5f5f5;
              border-bottom: 1px solid #ddd;
              display: flex;
              align-items: center;
              padding: 0 10px;
              font-size: 10px;
              font-weight: bold;
            }

            .gantt-timeline {
              height: 20px;
              background-color: #f8f8f8;
              border-bottom: 1px solid #ddd;
              display: flex;
              align-items: center;
              padding: 0 10px;
              font-size: 8px;
            }

            .gantt-content {
              height: calc(100% - 50px);
              overflow: hidden;
            }

            .task-row {
              height: 20px;
              border-bottom: 1px solid #eee;
              display: flex;
              align-items: center;
              font-size: 8px;
            }

            .task-name {
              width: 200px;
              padding: 0 5px;
              border-right: 1px solid #ddd;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .task-bar {
              flex: 1;
              height: 12px;
              background-color: #3B82F6;
              border-radius: 2px;
              margin: 0 2px;
              position: relative;
            }

            .milestone {
              width: 8px;
              height: 8px;
              background-color: #8B5CF6;
              border-radius: 50%;
              margin: 0 2px;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #333;
              font-size: 10px;
              color: #666;
            }

            .page-number {
              position: absolute;
              bottom: 10mm;
              right: 20mm;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
    `;

    // Add header if requested
    if (includeHeaders) {
      html += `
        <div class="header">
          <div class="project-title">Project Schedule</div>
          ${showProjectInfo ? `<div class="project-info">Generated on ${new Date().toLocaleDateString()}</div>` : ''}
          ${showDateRange ? `<div class="date-range">Date Range: ${this.getDateRangeText()}</div>` : ''}
        </div>
      `;
    }

    // Add task grid if requested
    if (includeGrid) {
      html += this.generateTaskGridHTML(tasks);
    }

    // Add Gantt chart if requested
    if (includeGantt) {
      html += this.generateGanttChartHTML(tasks, taskLinks, viewState);
    }

    // Add footer if requested
    if (includeFooters) {
      html += `
        <div class="footer">
          <div>Project Schedule Report</div>
          <div>Total Tasks: ${tasks.length} | Total Duration: ${this.calculateTotalDuration(tasks)} days</div>
        </div>
      `;
    }

    // Add page numbers if requested
    if (showPageNumbers) {
      html += '<div class="page-number">Page 1</div>';
    }

    html += `
        </body>
      </html>
    `;

    return html;
  }

  generateTaskGridHTML(tasks) {
    let html = `
      <table class="task-grid">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
          </tr>
        </thead>
        <tbody>
    `;

    tasks.forEach(task => {
      html += `
        <tr>
          <td>${task.name}</td>
          <td>${new Date(task.startDate).toLocaleDateString()}</td>
          <td>${new Date(task.endDate).toLocaleDateString()}</td>
          <td>${task.duration} days</td>
          <td>${task.progress || 0}%</td>
          <td>${task.status}</td>
          <td>${task.priority}</td>
          <td>${task.assignee || '-'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  generateGanttChartHTML(tasks, taskLinks, viewState) {
    let html = `
      <div class="gantt-chart">
        <div class="gantt-header">Gantt Chart</div>
        <div class="gantt-timeline">Timeline</div>
        <div class="gantt-content">
    `;

    tasks.forEach(task => {
      const isMilestone = task.type === 'milestone' || task.isMilestone;
      html += `
        <div class="task-row">
          <div class="task-name">${task.name}</div>
          ${isMilestone ? '<div class="milestone"></div>' : '<div class="task-bar"></div>'}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  getDateRangeText() {
    const { dateRange, customDateRange } = this.settings;

    switch (dateRange) {
      case 'all':
        return 'All dates';
      case 'visible':
        return 'Visible date range';
      case 'custom':
        return `${customDateRange.start.toLocaleDateString()} - ${customDateRange.end.toLocaleDateString()}`;
      default:
        return 'All dates';
    }
  }

  calculateTotalDuration(tasks) {
    return tasks.reduce((total, task) => total + (task.duration || 0), 0);
  }
}

// PDF Export functionality
export class PDFExporter {
  constructor(settings) {
    this.settings = settings;
    this.doc = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.pageSize,
    });
  }

  async exportToPDF(tasks, taskLinks, viewState) {
    try {
      const renderer = new PrintLayoutRenderer(this.settings);
      const html = renderer.generatePrintHTML(tasks, taskLinks, viewState);

      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save the PDF
      const filename = `project-schedule-${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(filename);

      return filename;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export PDF');
    }
  }
}

// PNG Export functionality
export class PNGExporter {
  constructor(settings) {
    this.settings = settings;
  }

  async exportToPNG(tasks, taskLinks, viewState) {
    try {
      const renderer = new PrintLayoutRenderer(this.settings);
      const html = renderer.generatePrintHTML(tasks, taskLinks, viewState);

      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Convert to canvas with quality settings
      const quality = this.settings.quality;
      const scale = quality === 'high' ? 3 : quality === 'medium' ? 2 : 1;

      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Convert to blob and download
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `project-schedule-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');

      return `project-schedule-${new Date().toISOString().split('T')[0]}.png`;
    } catch (error) {
      console.error('PNG export error:', error);
      throw new Error('Failed to export PNG');
    }
  }
}

// Excel Export functionality
export class ExcelExporter {
  constructor(settings) {
    this.settings = settings;
  }

  exportToExcel(tasks, taskLinks, viewState) {
    try {
      const workbook = XLSX.utils.book_new();

      // Task data worksheet
      const taskData = tasks.map(task => ({
        'Task Name': task.name,
        'Start Date': new Date(task.startDate).toLocaleDateString(),
        'End Date': new Date(task.endDate).toLocaleDateString(),
        'Duration (days)': task.duration || 0,
        'Progress (%)': task.progress || 0,
        Status: task.status,
        Priority: task.priority,
        Assignee: task.assignee || '',
        Type: task.type,
        'Is Milestone': task.isMilestone ? 'Yes' : 'No',
        'Parent Task': task.parentId || '',
        Notes: task.notes || '',
      }));

      const taskWorksheet = XLSX.utils.json_to_sheet(taskData);
      XLSX.utils.book_append_sheet(workbook, taskWorksheet, 'Tasks');

      // Dependency data worksheet
      if (taskLinks && taskLinks.length > 0) {
        const dependencyData = taskLinks.map(link => {
          const fromTask = tasks.find(t => t.id === link.fromId);
          const toTask = tasks.find(t => t.id === link.toId);

          return {
            'From Task': fromTask ? fromTask.name : link.fromId,
            'To Task': toTask ? toTask.name : link.toId,
            'Link Type': link.type,
            'Lag (days)': link.lag || 0,
          };
        });

        const dependencyWorksheet = XLSX.utils.json_to_sheet(dependencyData);
        XLSX.utils.book_append_sheet(
          workbook,
          dependencyWorksheet,
          'Dependencies'
        );
      }

      // Project summary worksheet
      const summaryData = [
        { Metric: 'Total Tasks', Value: tasks.length },
        {
          Metric: 'Total Duration',
          Value: `${tasks.reduce((sum, t) => sum + (t.duration || 0), 0)} days`,
        },
        {
          Metric: 'Milestones',
          Value: tasks.filter(t => t.isMilestone).length,
        },
        { Metric: 'Dependencies', Value: taskLinks ? taskLinks.length : 0 },
        {
          Metric: 'Project Start',
          Value:
            tasks.length > 0
              ? new Date(
                  Math.min(...tasks.map(t => new Date(t.startDate)))
                ).toLocaleDateString()
              : 'N/A',
        },
        {
          Metric: 'Project End',
          Value:
            tasks.length > 0
              ? new Date(
                  Math.max(...tasks.map(t => new Date(t.endDate)))
                ).toLocaleDateString()
              : 'N/A',
        },
        { Metric: 'Generated Date', Value: new Date().toLocaleDateString() },
      ];

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

      // Save the Excel file
      const filename = `project-schedule-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      return filename;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export Excel file');
    }
  }
}

// Main export function
export const exportProject = async (settings, tasks, taskLinks, viewState) => {
  try {
    switch (settings.format) {
      case 'pdf':
        const pdfExporter = new PDFExporter(settings);
        return await pdfExporter.exportToPDF(tasks, taskLinks, viewState);

      case 'png':
        const pngExporter = new PNGExporter(settings);
        return await pngExporter.exportToPNG(tasks, taskLinks, viewState);

      case 'xlsx':
        const excelExporter = new ExcelExporter(settings);
        return excelExporter.exportToExcel(tasks, taskLinks, viewState);

      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// Print function
export const printProject = async (settings, tasks, taskLinks, viewState) => {
  try {
    const renderer = new PrintLayoutRenderer(settings);
    const html = renderer.generatePrintHTML(tasks, taskLinks, viewState);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    return true;
  } catch (error) {
    console.error('Print error:', error);
    throw new Error('Failed to print project');
  }
};

// Utility functions
export const validatePrintSettings = settings => {
  const errors = [];

  if (settings.pageRange === 'custom') {
    if (settings.customPageRange.start > settings.customPageRange.end) {
      errors.push('Start page cannot be greater than end page');
    }
  }

  if (settings.dateRange === 'custom') {
    if (settings.customDateRange.start > settings.customDateRange.end) {
      errors.push('Start date cannot be after end date');
    }
  }

  if (settings.scaling < 25 || settings.scaling > 200) {
    errors.push('Scaling must be between 25% and 200%');
  }

  return errors;
};

export const validateExportSettings = settings => {
  const errors = [];

  if (settings.dateRange === 'custom') {
    if (settings.customDateRange.start > settings.customDateRange.end) {
      errors.push('Start date cannot be after end date');
    }
  }

  if (settings.scaling < 25 || settings.scaling > 200) {
    errors.push('Scaling must be between 25% and 200%');
  }

  return errors;
};
