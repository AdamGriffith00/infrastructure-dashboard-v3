/**
 * Live Projects View
 * CSV import with auto-save functionality
 */

export function renderProjectsView(container, { data, allData, state }) {
  const projects = data.projects || [];
  const projectsByRegion = groupByRegion(projects, allData.regions);

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Live Projects</h1>
      <p class="view-subtitle">Current project distribution across regions</p>
    </div>

    <!-- CSV Import -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Import Projects</h2>
        ${projects.length > 0 ? `<span class="badge badge-yellow">${projects.length} projects loaded</span>` : ''}
      </div>
      <div class="csv-dropzone" id="csv-dropzone">
        <div class="csv-dropzone-icon">+</div>
        <div class="csv-dropzone-text">Drop CSV file here or click to upload</div>
        <div class="csv-dropzone-hint">Expected columns: name, client, sector, region</div>
        <input type="file" id="csv-input" accept=".csv" style="display: none;" />
      </div>
      <div id="import-status" class="mt-md"></div>
    </section>

    <!-- Project Summary -->
    ${projects.length > 0 ? `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Projects by Region</h2>
          <button class="btn" id="export-btn">Export CSV</button>
        </div>
        <div class="projects-summary">
          ${(allData.regions || []).map(region => {
            const count = projectsByRegion[region.id]?.length || 0;
            return `
              <div class="project-region-count ${count > 0 ? 'card-clickable' : ''}" data-region="${region.id}">
                <span class="project-region-name">${region.name}</span>
                <span class="project-region-number">${count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Project List -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">All Projects</h2>
        </div>
        <div class="client-list">
          ${projects.slice(0, 50).map(project => `
            <div class="client-item">
              <div>
                <div class="client-name">${project.name}</div>
                <div class="client-sector">${project.client || 'Unknown client'} | ${project.sector || 'Unknown sector'}</div>
              </div>
              <span class="badge">${project.region || 'Unknown'}</span>
            </div>
          `).join('')}
        </div>
        ${projects.length > 50 ? `<p class="text-muted mt-md">Showing 50 of ${projects.length} projects</p>` : ''}
      </section>
    ` : `
      <section class="section">
        <div class="empty-state">
          <div class="empty-state-icon">*</div>
          <h3>No Projects Loaded</h3>
          <p class="text-muted">Import a CSV file to see your project distribution</p>
        </div>
      </section>
    `}
  `;

  // Initialize CSV handling
  initCSVHandling(container, state, allData);
}

function groupByRegion(projects, regions) {
  const grouped = {};

  // Initialize all regions
  (regions || []).forEach(r => {
    grouped[r.id] = [];
  });

  // Group projects
  projects.forEach(project => {
    const regionId = normalizeRegion(project.region);
    if (grouped[regionId]) {
      grouped[regionId].push(project);
    } else {
      // Handle unknown regions
      if (!grouped['other']) grouped['other'] = [];
      grouped['other'].push(project);
    }
  });

  return grouped;
}

function normalizeRegion(region) {
  if (!region) return 'other';

  const aliases = {
    'yorkshire & the humber': 'yorkshire-humber',
    'yorkshire and the humber': 'yorkshire-humber',
    'east of england': 'eastern',
    'east': 'eastern',
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
    'west midlands': 'west-midlands',
    'east midlands': 'east-midlands',
    'northern ireland': 'northern-ireland'
  };

  const normalized = region.toLowerCase().trim();
  return aliases[normalized] || normalized.replace(/\s+/g, '-');
}

function initCSVHandling(container, state, allData) {
  const dropzone = container.querySelector('#csv-dropzone');
  const fileInput = container.querySelector('#csv-input');
  const statusDiv = container.querySelector('#import-status');
  const exportBtn = container.querySelector('#export-btn');

  if (!dropzone || !fileInput) return;

  // Click to upload
  dropzone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0], state, statusDiv, allData);
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
      handleFile(e.dataTransfer.files[0], state, statusDiv, allData);
    }
  });

  // Export button
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportProjects(state.get('data')?.projects || []);
    });
  }
}

function handleFile(file, state, statusDiv, allData) {
  if (!file.name.endsWith('.csv')) {
    statusDiv.innerHTML = '<p class="text-muted" style="color: var(--status-low);">Please upload a CSV file</p>';
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const csv = e.target.result;
      const projects = parseCSV(csv);

      if (projects.length === 0) {
        statusDiv.innerHTML = '<p class="text-muted" style="color: var(--status-low);">No valid projects found in CSV</p>';
        return;
      }

      // Save to state and localStorage
      const data = state.get('data');
      data.projects = projects;
      state.set('data', data);

      // Save to localStorage for persistence
      try {
        localStorage.setItem('dashboard_projects', JSON.stringify(projects));
      } catch (err) {
        console.warn('Could not save to localStorage');
      }

      statusDiv.innerHTML = `<p class="text-muted" style="color: var(--status-high);">Successfully imported ${projects.length} projects</p>`;

      // Refresh view
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('CSV parse error:', err);
      statusDiv.innerHTML = '<p class="text-muted" style="color: var(--status-low);">Error parsing CSV file</p>';
    }
  };

  reader.readAsText(file);
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

  if (nameIdx === -1) {
    console.warn('No name column found');
  }

  // Parse data rows
  const projects = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const project = {
      id: `proj-${i}`,
      name: values[nameIdx] || `Project ${i}`,
      client: values[clientIdx] || '',
      sector: values[sectorIdx] || '',
      region: values[regionIdx] || ''
    };

    projects.push(project);
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

  const headers = ['name', 'client', 'sector', 'region'];
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
  a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
