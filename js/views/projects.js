/**
 * Live Projects View
 * Excel/CSV import with UK map visualization and auto-save functionality
 */

import { renderUKMap } from '../components/uk-map.js';
import { formatCurrency } from '../utils/formatters.js';
import { exportToCSV, exportToExcel, getProjectColumns } from '../utils/export.js';
import { getInfoButtonHTML, setupInfoPopup } from '../components/data-info.js';

// Storage key for persistence
const STORAGE_KEY = 'gleeds_live_projects';

export async function renderProjectsView(container, { data, allData, state }) {
  // Load projects from localStorage if not in state
  let projects = loadProjectsFromStorage();

  // Calculate regional data for the map
  const regionalData = calculateRegionalProjectData(projects, allData.regions || []);
  const totalProjects = projects.length;
  const regionsWithProjects = regionalData.filter(r => r.projectCount > 0).length;

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Live Projects ${getInfoButtonHTML()}</h1>
      <p class="view-subtitle">Your current project portfolio across UK regions</p>
    </div>

    <!-- KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Projects</div>
          <div class="kpi-value">${totalProjects}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Regions Active</div>
          <div class="kpi-value">${regionsWithProjects}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Top Region</div>
          <div class="kpi-value">${getTopRegion(regionalData)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Data Status</div>
          <div class="kpi-value" style="font-size: 1rem;">${projects.length > 0 ? 'Loaded' : 'No Data'}</div>
        </div>
      </div>
    </section>

    <!-- Main Map Section - Hero -->
    <section class="section projects-hero-section">
      <div class="projects-hero-layout">
        <!-- Large Map -->
        <div class="projects-hero-map">
          <div id="projects-uk-map"></div>
        </div>

        <!-- Side Panel with Rankings -->
        <div class="projects-hero-panel">
          <div class="projects-hero-panel-title">Projects by Region</div>
          <div class="projects-region-list">
            ${regionalData
              .filter(r => r.projectCount > 0)
              .sort((a, b) => b.projectCount - a.projectCount)
              .map((region, idx) => `
                <div class="projects-region-item">
                  <span class="projects-region-rank">${idx + 1}</span>
                  <span class="projects-region-name">${region.name}</span>
                  <span class="projects-region-count badge badge-yellow">${region.projectCount}</span>
                </div>
              `).join('') || '<p class="text-muted">Upload projects to see distribution</p>'}
          </div>
          ${projects.length === 0 ? `
            <div class="projects-hero-empty">
              <p class="text-muted">No projects loaded yet</p>
              <p class="text-muted" style="font-size: 0.85rem;">Upload an Excel file below to visualize your portfolio</p>
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- Upload & List Section - Secondary -->
    <div class="projects-secondary-layout">
      <!-- Upload Section -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Import Projects</h2>
          ${projects.length > 0 ? `
            <button class="btn btn-sm" id="clear-data-btn" style="background: var(--status-low); color: white;">Clear Data</button>
          ` : ''}
        </div>

        <div class="excel-dropzone" id="excel-dropzone">
          <div class="excel-dropzone-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="excel-dropzone-text">Drop Excel file here or click to upload</div>
          <div class="excel-dropzone-hint">Supported: .xlsx, .xls, .csv | Columns: Name, Client, Sector, Region</div>
          <input type="file" id="excel-input" accept=".xlsx,.xls,.csv" style="display: none;" />
        </div>

        <div id="import-status" class="mt-md"></div>

        <div class="mt-md flex gap-sm flex-wrap">
          ${projects.length > 0 ? `
            <button class="btn btn-secondary" id="export-csv-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <polyline points="8 16 12 20 16 16"/>
              </svg>
              Export CSV
            </button>
            <button class="btn btn-secondary" id="export-excel-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M8 13h2l2 3 2-6 2 3h2"/>
              </svg>
              Export Excel
            </button>
          ` : ''}
          <button class="btn" id="download-template-btn">Download Template</button>
        </div>
      </section>

      <!-- Project List -->
      ${projects.length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Project List</h2>
            <span class="badge badge-yellow">${projects.length} projects</span>
          </div>
          <div class="projects-list-scroll">
            ${projects.slice(0, 100).map((project, idx) => `
              <div class="project-item">
                <div class="project-item-info">
                  <div class="project-item-name">${project.name}</div>
                  <div class="project-item-meta">${project.client || 'Unknown client'} | ${project.sector || 'Unknown sector'}</div>
                </div>
                <span class="badge">${formatRegionName(project.region)}</span>
              </div>
            `).join('')}
            ${projects.length > 100 ? `
              <div class="text-muted text-center mt-md">Showing 100 of ${projects.length} projects</div>
            ` : ''}
          </div>
        </section>
      ` : ''}
    </div>
  `;

  // Render the UK map - large for presentations
  const mapContainer = container.querySelector('#projects-uk-map');
  if (mapContainer) {
    await renderUKMap(mapContainer, {
      data: regionalData,
      dataKey: 'projectCount',
      title: '',
      colorScheme: 'yellow',
      width: 550,
      height: 700,
      valueFormatter: (val) => `${val} projects`,
      onRegionClick: (regionId) => {
        // Could filter to show only that region's projects
        console.log('Region clicked:', regionId);
      }
    });
  }

  // Setup info popup — user-uploaded data, no external reports
  setupInfoPopup(container, {
    title: 'Live Projects',
    reports: [],
    summary: projects.length > 0
      ? `${projects.length} projects imported from your uploaded Excel/CSV file`
      : 'No data imported yet — upload an Excel or CSV file to get started',
    note: 'Live Projects data is stored locally in your browser. It persists until you upload a new file or clear data.'
  });

  // Initialize file handling
  initFileHandling(container, state);
}

function loadProjectsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Could not load projects from localStorage:', err);
  }
  return [];
}

function saveProjectsToStorage(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn('Could not save projects to localStorage:', err);
  }
}

function clearProjectsFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear projects from localStorage:', err);
  }
}

function calculateRegionalProjectData(projects, regions) {
  const regionMap = {};

  // Initialize all regions
  regions.forEach(region => {
    regionMap[region.id] = {
      id: region.id,
      name: region.name,
      projectCount: 0,
      projects: []
    };
  });

  // Count projects by region
  projects.forEach(project => {
    const regionId = normalizeRegion(project.region);
    if (regionMap[regionId]) {
      regionMap[regionId].projectCount += 1;
      regionMap[regionId].projects.push(project);
    }
  });

  return Object.values(regionMap);
}

function getTopRegion(regionalData) {
  const sorted = [...regionalData].sort((a, b) => b.projectCount - a.projectCount);
  if (sorted[0] && sorted[0].projectCount > 0) {
    return sorted[0].name;
  }
  return 'N/A';
}

function formatRegionName(region) {
  if (!region) return 'Unknown';
  return region.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function normalizeRegion(region) {
  if (!region) return 'other';

  const aliases = {
    'yorkshire & the humber': 'yorkshire-humber',
    'yorkshire and the humber': 'yorkshire-humber',
    'yorkshire & humber': 'yorkshire-humber',
    'yorkshire-and-the-humber': 'yorkshire-humber',
    'east of england': 'eastern',
    'east': 'eastern',
    'east anglia': 'eastern',
    'north-west': 'north-west',
    'northwest': 'north-west',
    'north west': 'north-west',
    'north-east': 'north-east',
    'northeast': 'north-east',
    'north east': 'north-east',
    'south-west': 'south-west',
    'southwest': 'south-west',
    'south west': 'south-west',
    'south-east': 'south-east',
    'southeast': 'south-east',
    'south east': 'south-east',
    'west midlands': 'midlands',
    'east midlands': 'east-midlands',
    'midlands': 'midlands',
    'northern ireland': 'northern-ireland',
    'ni': 'northern-ireland',
    'greater london': 'london',
    'london': 'london'
  };

  const normalized = region.toLowerCase().trim();
  return aliases[normalized] || normalized.replace(/\s+/g, '-');
}

function initFileHandling(container, state) {
  const dropzone = container.querySelector('#excel-dropzone');
  const fileInput = container.querySelector('#excel-input');
  const statusDiv = container.querySelector('#import-status');
  const exportCSVBtn = container.querySelector('#export-csv-btn');
  const exportExcelBtn = container.querySelector('#export-excel-btn');
  const clearBtn = container.querySelector('#clear-data-btn');
  const templateBtn = container.querySelector('#download-template-btn');

  if (!dropzone || !fileInput) return;

  // Click to upload
  dropzone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0], statusDiv);
    }
  });

  // Drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0], statusDiv);
    }
  });

  // Export CSV button
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', () => {
      const projects = loadProjectsFromStorage();
      const filename = `live-projects-${new Date().toISOString().split('T')[0]}`;
      exportToCSV(projects, filename, getProjectColumns());
    });
  }

  // Export Excel button
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
      const projects = loadProjectsFromStorage();
      const filename = `live-projects-${new Date().toISOString().split('T')[0]}`;
      exportToExcel(projects, filename, getProjectColumns(), 'Projects');
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all project data?')) {
        clearProjectsFromStorage();
        window.location.reload();
      }
    });
  }

  // Template button
  if (templateBtn) {
    templateBtn.addEventListener('click', downloadTemplate);
  }
}

function handleFile(file, statusDiv) {
  const fileName = file.name.toLowerCase();

  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
    statusDiv.innerHTML = '<p style="color: var(--status-low);">Please upload an Excel (.xlsx, .xls) or CSV file</p>';
    return;
  }

  statusDiv.innerHTML = '<p class="text-muted">Processing file...</p>';

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      let projects = [];

      if (fileName.endsWith('.csv')) {
        // Parse CSV
        projects = parseCSV(e.target.result);
      } else {
        // Parse Excel using SheetJS
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        projects = parseExcelData(jsonData);
      }

      if (projects.length === 0) {
        statusDiv.innerHTML = '<p style="color: var(--status-low);">No valid projects found. Check column names (Name, Client, Sector, Region)</p>';
        return;
      }

      // Save to localStorage
      saveProjectsToStorage(projects);

      statusDiv.innerHTML = `<p style="color: var(--status-high);">Successfully imported ${projects.length} projects!</p>`;

      // Refresh view
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('File parse error:', err);
      statusDiv.innerHTML = `<p style="color: var(--status-low);">Error parsing file: ${err.message}</p>`;
    }
  };

  if (fileName.endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
}

function parseExcelData(jsonData) {
  const projects = [];

  jsonData.forEach((row, idx) => {
    // Find the name column (case-insensitive)
    const name = row['Name'] || row['name'] || row['Project'] || row['project'] || row['Project Name'] || row['project name'];
    const client = row['Client'] || row['client'] || row['Customer'] || row['customer'];
    const sector = row['Sector'] || row['sector'] || row['Industry'] || row['industry'];
    const region = row['Region'] || row['region'] || row['Location'] || row['location'] || row['Area'] || row['area'];

    if (name) {
      projects.push({
        id: `proj-${idx + 1}`,
        name: String(name).trim(),
        client: client ? String(client).trim() : '',
        sector: sector ? String(sector).trim() : '',
        region: region ? String(region).trim() : ''
      });
    }
  });

  return projects;
}

function parseCSV(csv) {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  // Find column indices
  const nameIdx = headers.findIndex(h => h === 'name' || h === 'project' || h === 'project name');
  const clientIdx = headers.findIndex(h => h === 'client' || h === 'customer');
  const sectorIdx = headers.findIndex(h => h === 'sector' || h === 'industry');
  const regionIdx = headers.findIndex(h => h === 'region' || h === 'location' || h === 'area');

  // Parse data rows
  const projects = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const name = nameIdx >= 0 ? values[nameIdx] : null;
    if (!name) continue;

    projects.push({
      id: `proj-${i}`,
      name: name.trim(),
      client: clientIdx >= 0 ? (values[clientIdx] || '').trim() : '',
      sector: sectorIdx >= 0 ? (values[sectorIdx] || '').trim() : '',
      region: regionIdx >= 0 ? (values[regionIdx] || '').trim() : ''
    });
  }

  return projects;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function exportProjects(projects) {
  if (!projects.length) return;

  const headers = ['Name', 'Client', 'Sector', 'Region'];
  const rows = projects.map(p => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.client || '').replace(/"/g, '""')}"`,
    `"${(p.sector || '').replace(/"/g, '""')}"`,
    `"${(p.region || '').replace(/"/g, '""')}"`
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `live-projects-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function downloadTemplate() {
  const template = `Name,Client,Sector,Region
HS2 Phase 2a Cost Management,HS2 Ltd,Rail,Midlands
Thames Tideway Supervision,Thames Water,Utilities,London
Manchester Airport T2,MAG,Aviation,North West
A66 Trans-Pennine Project Controls,National Highways,Highways,North East
Scottish Water AMP8 Programme,Scottish Water,Utilities,Scotland`;

  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'live-projects-template.csv';
  a.click();

  URL.revokeObjectURL(url);
}
