/**
 * Export Utilities
 * Provides CSV and Excel export functionality for dashboard data
 */

/**
 * Export data to CSV format and trigger download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file (without extension)
 * @param {Array} columns - Optional array of {key, label} to specify which columns and their headers
 */
export function exportToCSV(data, filename, columns = null) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from data or use provided columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Create header row
  const headers = cols.map(col => escapeCSVField(col.label));

  // Create data rows
  const rows = data.map(item => {
    return cols.map(col => {
      const value = item[col.key];
      return escapeCSVField(formatValue(value));
    });
  });

  // Combine into CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format using SheetJS
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name for the downloaded file (without extension)
 * @param {Array} columns - Optional array of {key, label} to specify which columns and their headers
 * @param {string} sheetName - Name for the worksheet
 */
export function exportToExcel(data, filename, columns = null, sheetName = 'Data') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Check if SheetJS is available
  if (typeof XLSX === 'undefined') {
    console.error('SheetJS library not loaded');
    alert('Excel export requires SheetJS library');
    return;
  }

  // Determine columns from data or use provided columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Create worksheet data with headers
  const wsData = [
    cols.map(col => col.label),
    ...data.map(item => cols.map(col => formatValue(item[col.key])))
  ];

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-size columns based on content
  const colWidths = cols.map((col, i) => {
    const maxLength = Math.max(
      col.label.length,
      ...data.map(item => String(formatValue(item[col.key])).length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Generate and download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export multiple datasets to Excel with multiple sheets
 * @param {Array} sheets - Array of {name, data, columns} objects
 * @param {string} filename - Name for the downloaded file (without extension)
 */
export function exportToExcelMultiSheet(sheets, filename) {
  if (typeof XLSX === 'undefined') {
    console.error('SheetJS library not loaded');
    alert('Excel export requires SheetJS library');
    return;
  }

  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data, columns }) => {
    if (!data || data.length === 0) return;

    const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
    const wsData = [
      cols.map(col => col.label),
      ...data.map(item => cols.map(col => formatValue(item[col.key])))
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns
    ws['!cols'] = cols.map((col, i) => {
      const maxLength = Math.max(
        col.label.length,
        ...data.map(item => String(formatValue(item[col.key])).length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });

    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); // Excel sheet name max 31 chars
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Escape a field for CSV format
 */
function escapeCSVField(field) {
  const stringField = String(field ?? '');
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

/**
 * Format a value for export
 */
function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0];
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

/**
 * Trigger download of a Blob
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get default column definitions for opportunities
 */
export function getOpportunityColumns() {
  return [
    { key: 'title', label: 'Opportunity' },
    { key: 'client', label: 'Client' },
    { key: 'sector', label: 'Sector' },
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Status' },
    { key: 'procurementStage', label: 'Stage' },
    { key: 'value', label: 'Value (£)' },
    { key: 'bidDeadline', label: 'Bid Deadline' },
    { key: 'contractStart', label: 'Contract Start' },
    { key: 'duration', label: 'Duration' },
    { key: 'bidRating', label: 'Rating' }
  ];
}

/**
 * Get default column definitions for clients
 */
export function getClientColumns() {
  return [
    { key: 'name', label: 'Client Name' },
    { key: 'sector', label: 'Sector' },
    { key: 'region', label: 'Region' },
    { key: 'budget10Year', label: '10-Year Budget (£)' },
    { key: 'budget2026', label: '2026 Budget (£)' },
    { key: 'type', label: 'Type' }
  ];
}

/**
 * Get default column definitions for projects
 */
export function getProjectColumns() {
  return [
    { key: 'name', label: 'Project Name' },
    { key: 'client', label: 'Client' },
    { key: 'sector', label: 'Sector' },
    { key: 'region', label: 'Region' }
  ];
}
