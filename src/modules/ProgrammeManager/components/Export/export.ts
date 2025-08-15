import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export Gantt chart as PNG image
 */
export async function exportPNG(selector: string, name: string): Promise<void> {
  try {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) {
      throw new Error('Gantt element not found');
    }

    // Get background color from CSS variables or use default
    const backgroundColor = getComputedStyle(document.body).getPropertyValue('--rbn-bg') || '#0b1220';
    
    const canvas = await html2canvas(el, { 
      backgroundColor,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    
    console.log('[PP][export] PNG exported successfully:', name);
  } catch (error) {
    console.error('[PP][export] PNG export failed:', error);
    throw error;
  }
}

/**
 * Export Gantt chart as PDF (A4 landscape)
 */
export async function exportPDF(selector: string, name: string): Promise<void> {
  try {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) {
      throw new Error('Gantt element not found');
    }

    const canvas = await html2canvas(el, { 
      backgroundColor: '#0b1220',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'px', 
      format: 'a4' 
    });
    
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    
    // Add header text
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text(name, 20, 24);
    
    // Add image centered on page
    pdf.addImage(img, 'PNG', (pageW - w) / 2, 36, w, h);
    
    pdf.save(`${name}.pdf`);
    
    console.log('[PP][export] PDF exported successfully:', name);
  } catch (error) {
    console.error('[PP][export] PDF export failed:', error);
    throw error;
  }
}

/**
 * Get current theme background color
 */
export function getThemeBackgroundColor(): string {
  const isDark = document.documentElement.classList.contains('dark') || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDark ? '#0b1220' : '#ffffff';
}

/**
 * Export with current theme background
 */
export async function exportPNGWithTheme(selector: string, name: string): Promise<void> {
  const backgroundColor = getThemeBackgroundColor();
  
  try {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) {
      throw new Error('Gantt element not found');
    }
    
    const canvas = await html2canvas(el, { 
      backgroundColor,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    
    console.log('[PP][export] PNG exported successfully with theme:', name);
  } catch (error) {
    console.error('[PP][export] PNG export failed:', error);
    throw error;
  }
}
