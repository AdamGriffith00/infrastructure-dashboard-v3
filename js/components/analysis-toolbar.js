/**
 * Analysis Toolbar Component
 * Provides filtering, sorting, search, and export controls
 */

import { exportToCSV, exportToExcel } from '../utils/export.js';

/**
 * Render the analysis toolbar
 * @param {Object} options - Configuration options
 * @returns {string} HTML string for the toolbar
 */
export function renderAnalysisToolbar(options = {}) {
  const {
    id = 'analysis-toolbar',
    showSearch = true,
    showValueFilter = true,
    showDateFilter = true,
    showExport = true,
    filterOptions = {},
    searchPlaceholder = 'Search...',
    minValue = 0,
    maxValue = 100000000
  } = options;

  return `
    <div id="${id}" class="analysis-toolbar">
      ${showSearch ? `
        <div class="toolbar-group">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" id="${id}-search" class="input search-input" placeholder="${searchPlaceholder}">
            <button class="search-clear" id="${id}-search-clear" style="display: none;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      ` : ''}

      ${showValueFilter ? `
        <div class="toolbar-group">
          <label class="toolbar-label">Value Range:</label>
          <select id="${id}-value-range" class="input toolbar-select">
            <option value="all">All Values</option>
            <option value="0-1m">Under £1M</option>
            <option value="1m-10m">£1M - £10M</option>
            <option value="10m-50m">£10M - £50M</option>
            <option value="50m-100m">£50M - £100M</option>
            <option value="100m+">Over £100M</option>
          </select>
        </div>
      ` : ''}

      ${showDateFilter ? `
        <div class="toolbar-group">
          <label class="toolbar-label">Date Range:</label>
          <select id="${id}-date-range" class="input toolbar-select">
            <option value="all">All Dates</option>
            <option value="30days">Next 30 Days</option>
            <option value="90days">Next 90 Days</option>
            <option value="6months">Next 6 Months</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028+">2028+</option>
          </select>
        </div>
      ` : ''}

      <div class="toolbar-spacer"></div>

      ${showExport ? `
        <div class="toolbar-group toolbar-export">
          <button class="btn btn-secondary" id="${id}-export-csv" title="Export to CSV">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <polyline points="8 16 12 20 16 16"/>
            </svg>
            CSV
          </button>
          <button class="btn btn-secondary" id="${id}-export-excel" title="Export to Excel">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M8 13h2l2 3 2-6 2 3h2"/>
            </svg>
            Excel
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Setup event listeners for the analysis toolbar
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Configuration options
 * @returns {Object} Controller object with methods to get current filters
 */
export function setupAnalysisToolbar(container, options = {}) {
  const {
    id = 'analysis-toolbar',
    onFilterChange = () => {},
    onExport = null,
    exportFilename = 'export',
    exportColumns = null,
    getData = () => []
  } = options;

  let currentFilters = {
    search: '',
    valueRange: 'all',
    dateRange: 'all'
  };

  // Search input
  const searchInput = container.querySelector(`#${id}-search`);
  const searchClear = container.querySelector(`#${id}-search-clear`);

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const value = e.target.value;
      searchClear.style.display = value ? 'flex' : 'none';
      debounceTimer = setTimeout(() => {
        currentFilters.search = value.toLowerCase();
        onFilterChange(currentFilters);
      }, 200);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      currentFilters.search = '';
      onFilterChange(currentFilters);
    });
  }

  // Value range filter
  const valueRangeSelect = container.querySelector(`#${id}-value-range`);
  if (valueRangeSelect) {
    valueRangeSelect.addEventListener('change', (e) => {
      currentFilters.valueRange = e.target.value;
      onFilterChange(currentFilters);
    });
  }

  // Date range filter
  const dateRangeSelect = container.querySelector(`#${id}-date-range`);
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', (e) => {
      currentFilters.dateRange = e.target.value;
      onFilterChange(currentFilters);
    });
  }

  // Export buttons
  const exportCSVBtn = container.querySelector(`#${id}-export-csv`);
  const exportExcelBtn = container.querySelector(`#${id}-export-excel`);

  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', () => {
      const data = getData();
      if (onExport) {
        onExport('csv', data);
      } else {
        exportToCSV(data, exportFilename, exportColumns);
      }
    });
  }

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
      const data = getData();
      if (onExport) {
        onExport('excel', data);
      } else {
        exportToExcel(data, exportFilename, exportColumns);
      }
    });
  }

  // Return controller
  return {
    getFilters: () => ({ ...currentFilters }),
    setFilters: (filters) => {
      currentFilters = { ...currentFilters, ...filters };
      if (searchInput && filters.search !== undefined) {
        searchInput.value = filters.search;
        searchClear.style.display = filters.search ? 'flex' : 'none';
      }
      if (valueRangeSelect && filters.valueRange !== undefined) {
        valueRangeSelect.value = filters.valueRange;
      }
      if (dateRangeSelect && filters.dateRange !== undefined) {
        dateRangeSelect.value = filters.dateRange;
      }
    },
    reset: () => {
      currentFilters = { search: '', valueRange: 'all', dateRange: 'all' };
      if (searchInput) {
        searchInput.value = '';
        searchClear.style.display = 'none';
      }
      if (valueRangeSelect) valueRangeSelect.value = 'all';
      if (dateRangeSelect) dateRangeSelect.value = 'all';
      onFilterChange(currentFilters);
    }
  };
}

/**
 * Apply filters to an array of opportunities
 * @param {Array} data - Array of opportunity objects
 * @param {Object} filters - Current filter state
 * @returns {Array} Filtered data
 */
export function applyFilters(data, filters) {
  let filtered = [...data];

  // Search filter
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(item => {
      return (
        (item.title && item.title.toLowerCase().includes(search)) ||
        (item.name && item.name.toLowerCase().includes(search)) ||
        (item.client && item.client.toLowerCase().includes(search)) ||
        (item.sector && item.sector.toLowerCase().includes(search)) ||
        (item.region && item.region.toLowerCase().includes(search))
      );
    });
  }

  // Value range filter
  if (filters.valueRange && filters.valueRange !== 'all') {
    filtered = filtered.filter(item => {
      const value = item.value || 0;
      switch (filters.valueRange) {
        case '0-1m': return value < 1000000;
        case '1m-10m': return value >= 1000000 && value < 10000000;
        case '10m-50m': return value >= 10000000 && value < 50000000;
        case '50m-100m': return value >= 50000000 && value < 100000000;
        case '100m+': return value >= 100000000;
        default: return true;
      }
    });
  }

  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    filtered = filtered.filter(item => {
      const deadline = item.bidDeadline ? new Date(item.bidDeadline) : null;
      const contractStart = item.contractStart ? new Date(item.contractStart) : null;
      const refDate = deadline || contractStart;

      if (!refDate) return filters.dateRange === 'all';

      switch (filters.dateRange) {
        case '30days': {
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return refDate >= now && refDate <= thirtyDays;
        }
        case '90days': {
          const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          return refDate >= now && refDate <= ninetyDays;
        }
        case '6months': {
          const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
          return refDate >= now && refDate <= sixMonths;
        }
        case '2026': return refDate.getFullYear() === 2026;
        case '2027': return refDate.getFullYear() === 2027;
        case '2028+': return refDate.getFullYear() >= 2028;
        default: return true;
      }
    });
  }

  return filtered;
}

/**
 * Sort data by column
 * @param {Array} data - Array of objects
 * @param {string} column - Column key to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted data
 */
export function sortData(data, column, direction = 'asc') {
  return [...data].sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? 1 : -1;
    if (bVal == null) return direction === 'asc' ? -1 : 1;

    // Handle dates
    if (column.toLowerCase().includes('date') || column === 'bidDeadline' || column === 'contractStart') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    // Handle numbers
    else if (typeof aVal === 'number' || column === 'value' || column.includes('budget')) {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }
    // Handle strings
    else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
