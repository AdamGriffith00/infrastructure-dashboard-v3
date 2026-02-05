/**
 * Regional Opportunities Scanner Component
 * Displays comprehensive project scanning across sectors for a region
 */

import { formatCurrency } from '../utils/formatters.js';

const READINESS_CONFIG = {
  'ready-to-buy': { label: 'Ready to Buy', color: '#10B981', icon: '●' },
  'has-money-not-ready': { label: 'Has Money, Not Ready', color: '#F59E0B', icon: '●' },
  'no-money-not-ready': { label: 'No Money, Not Ready', color: '#6B7280', icon: '●' }
};

const STATUS_CONFIG = {
  'planning': { label: 'Planning', color: '#6B7280' },
  'pre-procurement': { label: 'Pre-Procurement', color: '#8B5CF6' },
  'procurement': { label: 'In Procurement', color: '#F59E0B' },
  'delivery': { label: 'In Delivery', color: '#10B981' },
  'complete': { label: 'Complete', color: '#3B82F6' }
};

export async function loadRegionalOpportunities(regionId) {
  // Map region IDs to data files
  const regionMapping = {
    'london': 'london-south-east',
    'south-east': 'london-south-east'
  };

  const dataFile = regionMapping[regionId];
  if (!dataFile) return null;

  try {
    const response = await fetch(`data/regional-opportunities/${dataFile}.json`);
    if (!response.ok) return null;
    const data = await response.json();

    // Filter opportunities to only this region
    const filteredOpportunities = data.opportunities.filter(o => o.region === regionId);

    return {
      ...data,
      opportunities: filteredOpportunities,
      allOpportunities: data.opportunities
    };
  } catch (err) {
    console.error('Failed to load regional opportunities:', err);
    return null;
  }
}

export function renderRegionalScanner(container, regionData, options = {}) {
  const { regionId, sectors = [], legacyOpportunities = [], clients = [] } = options;

  // Combine all data sources into a unified list
  const scannerOpportunities = regionData?.opportunities || [];

  // Convert legacy opportunities to the scanner format
  const convertedLegacyOpps = legacyOpportunities.map(opp => ({
    id: `legacy-${opp.id}`,
    title: opp.title,
    sector: opp.sector,
    region: opp.region,
    location: { borough: opp.location?.borough || opp.borough, area: opp.location?.area },
    value: opp.value || 0,
    status: opp.status || 'planning',
    procurementStage: opp.procurementStage,
    readiness: opp.readiness || 'no-money-not-ready',
    fundingStatus: opp.fundingStatus || 'Unknown',
    serviceRelevance: opp.serviceRelevance || [],
    projectType: opp.projectType || 'public',
    sourceType: 'opportunity'
  }));

  // Convert clients to opportunity-like format for display
  const convertedClients = clients.map(client => ({
    id: `client-${client.id || client.name}`,
    title: client.name,
    sector: client.sector,
    region: regionId,
    location: { borough: null, area: client.location || null },
    value: client.budget10Year || 0,
    status: 'delivery',  // Clients are typically in active delivery
    procurementStage: client.procurementStage || 'Active',
    readiness: 'ready-to-buy',  // Clients have committed budgets
    fundingStatus: client.source || 'Confirmed budget',
    serviceRelevance: client.services || [],
    projectType: client.type || 'public',
    sourceType: 'client'
  }));

  // Combine all sources - scanner first, then legacy, then clients
  // Filter out duplicates by title similarity
  const allItems = [...scannerOpportunities.map(o => ({ ...o, sourceType: 'scanner' }))];

  // Add legacy opportunities if not already present
  convertedLegacyOpps.forEach(opp => {
    const exists = allItems.some(o => o.title?.toLowerCase() === opp.title?.toLowerCase());
    if (!exists) allItems.push(opp);
  });

  // Add clients if not already present
  convertedClients.forEach(client => {
    const exists = allItems.some(o => o.title?.toLowerCase() === client.title?.toLowerCase());
    if (!exists) allItems.push(client);
  });

  if (allItems.length === 0) {
    container.innerHTML = `
      <div class="regional-scanner-empty">
        <p>No opportunities or clients data available for this region.</p>
      </div>
    `;
    return;
  }

  const opportunities = allItems;

  // Calculate summaries
  const totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const readinessCounts = countByField(opportunities, 'readiness');
  const sectorCounts = countByField(opportunities, 'sector');
  const boroughCounts = countByBorough(opportunities);

  // Get unique boroughs for dropdown
  const boroughs = [...new Set(opportunities.map(o => o.location?.borough).filter(Boolean))].sort();

  container.innerHTML = `
    <section class="section regional-scanner">
      <div class="section-header">
        <h2 class="section-title">Regional Opportunities Scanner</h2>
        <div class="scanner-meta">
          Last refreshed: ${formatDate(regionData.lastUpdated)} |
          ${opportunities.length} projects |
          ${formatCurrency(totalValue)} total
        </div>
      </div>

      <!-- Filters -->
      <div class="scanner-filters">
        <div class="filter-group">
          <label for="filter-sector">Sector</label>
          <select id="filter-sector" class="filter-select">
            <option value="">All Sectors</option>
            ${sectors.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-readiness">Readiness</label>
          <select id="filter-readiness" class="filter-select">
            <option value="">All Readiness</option>
            ${Object.entries(READINESS_CONFIG).map(([k, v]) =>
              `<option value="${k}">${v.label}</option>`
            ).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-value">Min Value</label>
          <select id="filter-value" class="filter-select">
            <option value="0">Any Value</option>
            <option value="10000000">&gt; 10m</option>
            <option value="50000000">&gt; 50m</option>
            <option value="100000000">&gt; 100m</option>
            <option value="500000000">&gt; 500m</option>
            <option value="1000000000">&gt; 1bn</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-status">Status</label>
          <select id="filter-status" class="filter-select">
            <option value="">All Status</option>
            ${Object.entries(STATUS_CONFIG).map(([k, v]) =>
              `<option value="${k}">${v.label}</option>`
            ).join('')}
          </select>
        </div>
        <button class="btn btn-sm" id="clear-filters">Clear Filters</button>
      </div>

      <!-- Readiness Summary -->
      <div class="readiness-summary">
        ${Object.entries(READINESS_CONFIG).map(([key, config]) => {
          const count = readinessCounts[key] || 0;
          return `
            <div class="readiness-chip" data-readiness="${key}">
              <span class="readiness-dot" style="color: ${config.color}">${config.icon}</span>
              <span class="readiness-label">${config.label}</span>
              <span class="readiness-count">(${count})</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Scanner Tabs -->
      <div class="scanner-tabs">
        <button class="scanner-tab active" data-tab="all-projects">All Projects</button>
        <button class="scanner-tab" data-tab="by-area">By Area</button>
      </div>

      <!-- Tab Content: All Projects -->
      <div class="scanner-tab-content active" id="tab-all-projects">
        <div class="scanner-table-container">
          <table class="scanner-table" id="projects-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="title">Project</th>
                <th class="sortable" data-sort="sector">Sector</th>
                <th class="sortable" data-sort="location">Location</th>
                <th class="sortable" data-sort="status">Stage</th>
                <th>Funding</th>
                <th class="sortable" data-sort="value">Value</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody id="projects-tbody">
              ${renderTableRows(opportunities, sectors)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: By Area -->
      <div class="scanner-tab-content" id="tab-by-area">
        ${renderAreaGrid(opportunities, boroughs, boroughCounts, sectors)}
      </div>

      <!-- Sector Trends -->
      ${regionData.sectorTrends ? renderSectorTrends(regionData.sectorTrends, sectors) : ''}
    </section>

    <!-- Opportunity Detail Modal -->
    <div class="opp-modal-overlay" id="opp-modal-overlay">
      <div class="opp-modal" id="opp-modal">
        <button class="opp-modal-close" id="opp-modal-close">&times;</button>
        <div class="opp-modal-content" id="opp-modal-content"></div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupFilterListeners(container, opportunities, sectors);
  setupTableSorting(container, opportunities, sectors);
  setupReadinessChips(container, opportunities, sectors);
  setupTabSwitching(container);
  setupAreaCardClicks(container, opportunities, sectors);
  setupOpportunityModal(container, opportunities, sectors);
}

function renderTableRows(opportunities, sectors) {
  return opportunities.map(opp => {
    const readiness = READINESS_CONFIG[opp.readiness] || READINESS_CONFIG['no-money-not-ready'];
    const status = STATUS_CONFIG[opp.status] || STATUS_CONFIG['planning'];
    const sector = sectors.find(s => s.id === opp.sector);
    const sectorColor = sector?.color || '#888888';

    // Source type indicator
    const sourceTypeConfig = {
      'scanner': { label: 'Scanned', color: '#8B5CF6' },
      'opportunity': { label: 'Pipeline', color: '#3B82F6' },
      'client': { label: 'Client', color: '#10B981' }
    };
    const sourceType = sourceTypeConfig[opp.sourceType] || sourceTypeConfig['scanner'];

    return `
      <tr class="project-row" data-id="${opp.id}" data-sector="${opp.sector}"
          data-readiness="${opp.readiness}" data-status="${opp.status}"
          data-value="${opp.value}" data-borough="${opp.location?.borough || ''}"
          data-source-type="${opp.sourceType || 'scanner'}">
        <td>
          <div class="project-title-cell">
            <span class="project-name clickable-opp" data-opp-id="${opp.id}" title="${opp.title}">${opp.title}</span>
            <span class="source-type-badge" style="background: ${sourceType.color}20; color: ${sourceType.color}">${sourceType.label}</span>
          </div>
        </td>
        <td>
          <span class="sector-badge" style="border-left: 3px solid ${sectorColor}">
            ${sector?.name || opp.sector || 'Unknown'}
          </span>
        </td>
        <td>
          <div class="location-cell">
            <span class="borough">${opp.location?.borough || '-'}</span>
            ${opp.location?.area ? `<span class="area">${opp.location.area}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="status-badge" style="background: ${status.color}20; color: ${status.color}; border-color: ${status.color}">
            ${status.label}
          </span>
          ${opp.procurementStage ? `<span class="procurement-stage">${opp.procurementStage}</span>` : ''}
        </td>
        <td>
          <div class="funding-cell">
            <span class="readiness-indicator" style="color: ${readiness.color}">${readiness.icon}</span>
            <span class="funding-text" title="${opp.fundingStatus || ''}">${truncate(opp.fundingStatus || '-', 30)}</span>
          </div>
        </td>
        <td class="value-cell">
          ${formatCurrency(opp.value)}
        </td>
        <td>
          <div class="services-cell">
            ${(opp.serviceRelevance || []).slice(0, 2).map(s =>
              `<span class="service-tag">${abbreviateService(s)}</span>`
            ).join('')}
            ${(opp.serviceRelevance || []).length > 2 ?
              `<span class="service-more">+${opp.serviceRelevance.length - 2}</span>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderSectorTrends(trends, sectors) {
  const trendEntries = Object.entries(trends);
  if (!trendEntries.length) return '';

  return `
    <div class="sector-trends">
      <h3 class="section-title mb-md">Sector Investment Outlook</h3>
      <div class="trends-grid">
        ${trendEntries.map(([sectorId, trend]) => {
          const sector = sectors.find(s => s.id === sectorId);
          const sectorColor = sector?.color || '#888888';
          return `
            <div class="trend-card" style="border-left: 4px solid ${sectorColor}">
              <div class="trend-header">
                <span class="trend-sector">${sector?.name || sectorId}</span>
              </div>
              <p class="trend-outlook">${trend.outlook || ''}</p>
              ${trend.keyDrivers?.length ? `
                <div class="trend-drivers">
                  <span class="trend-label">Key Drivers:</span>
                  ${trend.keyDrivers.map(d => `<span class="driver-tag">${d}</span>`).join('')}
                </div>
              ` : ''}
              ${trend.risks?.length ? `
                <div class="trend-risks">
                  <span class="trend-label">Risks:</span>
                  ${trend.risks.slice(0, 2).map(r => `<span class="risk-tag">${r}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderAreaProjectItem(opp, sectors) {
  const readiness = READINESS_CONFIG[opp.readiness] || READINESS_CONFIG['no-money-not-ready'];
  const sector = sectors.find(s => s.id === opp.sector);

  return `
    <div class="area-project-item clickable-opp" data-opp-id="${opp.id}" title="${opp.title}">
      <span class="area-project-dot" style="color: ${readiness.color}">●</span>
      <span class="area-project-name">${truncate(opp.title, 30)}</span>
      <span class="area-project-sector" style="border-left: 2px solid ${sector?.color || '#888'}">${sector?.name || opp.sector || 'Unknown'}</span>
      <span class="area-project-value">${formatCurrency(opp.value)}</span>
    </div>
  `;
}

function renderAreaGrid(opportunities, boroughs, boroughCounts, sectors) {
  if (!boroughs.length) {
    return `<p class="text-muted">No area data available.</p>`;
  }

  // Sort boroughs by total value descending
  const sortedBoroughs = [...boroughs].sort((a, b) => {
    const aValue = boroughCounts[a]?.value || 0;
    const bValue = boroughCounts[b]?.value || 0;
    return bValue - aValue;
  });

  return `
    <div class="area-grid">
      ${sortedBoroughs.map(borough => {
        const data = boroughCounts[borough] || { count: 0, value: 0 };
        const boroughOpps = opportunities.filter(o => o.location?.borough === borough);
        const sectorBreakdown = countByField(boroughOpps, 'sector');
        const topSectors = Object.entries(sectorBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        const readinessCounts = countByField(boroughOpps, 'readiness');
        const readyCount = readinessCounts['ready-to-buy'] || 0;

        return `
          <div class="area-card" data-borough="${borough}">
            <div class="area-card-header">
              <h4 class="area-card-title">${borough}</h4>
              <span class="area-card-value">${formatCurrency(data.value)}</span>
            </div>
            <div class="area-card-stats">
              <div class="area-stat">
                <span class="area-stat-value">${data.count}</span>
                <span class="area-stat-label">Projects</span>
              </div>
              <div class="area-stat">
                <span class="area-stat-value">${readyCount}</span>
                <span class="area-stat-label">Ready</span>
              </div>
              <div class="area-stat">
                <span class="area-stat-value">${Object.keys(sectorBreakdown).length}</span>
                <span class="area-stat-label">Sectors</span>
              </div>
            </div>
            <div class="area-card-sectors">
              ${topSectors.map(([sectorId, count]) => {
                const sector = sectors.find(s => s.id === sectorId);
                return `<span class="area-sector-tag" style="border-left: 2px solid ${sector?.color || '#888'}">${sector?.name || sectorId} (${count})</span>`;
              }).join('')}
            </div>
            <div class="area-card-projects">
              <div class="area-projects-visible">
                ${boroughOpps.slice(0, 5).map(opp => renderAreaProjectItem(opp, sectors)).join('')}
              </div>
              ${boroughOpps.length > 5 ? `
                <div class="area-projects-hidden">
                  ${boroughOpps.slice(5).map(opp => renderAreaProjectItem(opp, sectors)).join('')}
                </div>
                <button class="area-project-toggle">
                  <span class="toggle-more">+${boroughOpps.length - 5} more projects</span>
                  <span class="toggle-less">Show less</span>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderBoroughContent(borough, opportunities, sectors) {
  const boroughOpps = opportunities.filter(o => o.location?.borough === borough);
  if (!boroughOpps.length) {
    return `<p class="text-muted">No projects found in ${borough}.</p>`;
  }

  const totalValue = boroughOpps.reduce((sum, o) => sum + (o.value || 0), 0);
  const readyCounts = countByField(boroughOpps, 'readiness');
  const sectorBreakdown = countByField(boroughOpps, 'sector');
  const topSector = Object.entries(sectorBreakdown).sort((a, b) => b[1] - a[1])[0];
  const topSectorInfo = sectors.find(s => s.id === topSector?.[0]);

  return `
    <div class="borough-header">
      <h4>${borough}</h4>
    </div>
    <div class="borough-kpis">
      <div class="borough-kpi">
        <div class="borough-kpi-value">${formatCurrency(totalValue)}</div>
        <div class="borough-kpi-label">Total Value</div>
      </div>
      <div class="borough-kpi">
        <div class="borough-kpi-value">${boroughOpps.length}</div>
        <div class="borough-kpi-label">Projects</div>
      </div>
      <div class="borough-kpi">
        <div class="borough-kpi-value">${topSectorInfo?.name || topSector?.[0] || '-'}</div>
        <div class="borough-kpi-label">Top Sector</div>
      </div>
      <div class="borough-kpi">
        <div class="borough-kpi-value">${readyCounts['ready-to-buy'] || 0}</div>
        <div class="borough-kpi-label">Ready to Buy</div>
      </div>
    </div>
    <div class="borough-projects">
      <h5>Projects in ${borough}</h5>
      <div class="borough-project-list">
        ${boroughOpps.map(opp => {
          const readiness = READINESS_CONFIG[opp.readiness] || READINESS_CONFIG['no-money-not-ready'];
          const sector = sectors.find(s => s.id === opp.sector);
          return `
            <div class="borough-project-item">
              <div class="borough-project-main">
                <span class="borough-project-name">${opp.title}</span>
                <span class="borough-project-sector">(${sector?.name || opp.sector})</span>
              </div>
              <div class="borough-project-meta">
                <span class="borough-project-value">${formatCurrency(opp.value)}</span>
                <span class="borough-project-readiness" style="color: ${readiness.color}">${readiness.label}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="borough-sector-breakdown">
      <h5>Sector Breakdown</h5>
      <div class="borough-sector-bars">
        ${Object.entries(sectorBreakdown)
          .sort((a, b) => b[1] - a[1])
          .map(([sectorId, count]) => {
            const sector = sectors.find(s => s.id === sectorId);
            const percentage = (count / boroughOpps.length) * 100;
            return `
              <div class="borough-sector-bar">
                <div class="borough-sector-label">${sector?.name || sectorId}</div>
                <div class="borough-sector-bar-track">
                  <div class="borough-sector-bar-fill" style="width: ${percentage}%; background: ${sector?.color || '#888'}"></div>
                </div>
                <div class="borough-sector-count">${count}</div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;
}

// Helper functions
function countByField(items, field) {
  return items.reduce((acc, item) => {
    const value = item[field];
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});
}

function countByBorough(items) {
  return items.reduce((acc, item) => {
    const borough = item.location?.borough;
    if (borough) {
      if (!acc[borough]) {
        acc[borough] = { count: 0, value: 0 };
      }
      acc[borough].count += 1;
      acc[borough].value += item.value || 0;
    }
    return acc;
  }, {});
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function abbreviateService(service) {
  const abbreviations = {
    'Cost and Commercial Management': 'CCM',
    'Project Management': 'PM',
    'Programme Advisory': 'PA',
    'P3M': 'P3M',
    'NEC Supervisor': 'NEC',
    'NEC Project Manager': 'NEC PM',
    "Employer's Agent": 'EA'
  };
  return abbreviations[service] || service.split(' ').map(w => w[0]).join('');
}

// Event handlers
function setupFilterListeners(container, allOpportunities, sectors) {
  const filterSector = container.querySelector('#filter-sector');
  const filterReadiness = container.querySelector('#filter-readiness');
  const filterValue = container.querySelector('#filter-value');
  const filterStatus = container.querySelector('#filter-status');
  const clearBtn = container.querySelector('#clear-filters');
  const tbody = container.querySelector('#projects-tbody');

  function applyFilters() {
    const sector = filterSector.value;
    const readiness = filterReadiness.value;
    const minValue = parseInt(filterValue.value) || 0;
    const status = filterStatus.value;

    const filtered = allOpportunities.filter(opp => {
      if (sector && opp.sector !== sector) return false;
      if (readiness && opp.readiness !== readiness) return false;
      if (opp.value < minValue) return false;
      if (status && opp.status !== status) return false;
      return true;
    });

    tbody.innerHTML = renderTableRows(filtered, sectors);
    setupRowClickHandlers(container, filtered, sectors);
  }

  filterSector.addEventListener('change', applyFilters);
  filterReadiness.addEventListener('change', applyFilters);
  filterValue.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  clearBtn.addEventListener('click', () => {
    filterSector.value = '';
    filterReadiness.value = '';
    filterValue.value = '0';
    filterStatus.value = '';
    applyFilters();
  });

  setupRowClickHandlers(container, allOpportunities, sectors);
}

function setupRowClickHandlers(container, opportunities, sectors) {
  const rows = container.querySelectorAll('.project-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const borough = row.dataset.borough;
      if (borough) {
        const selector = container.querySelector('#borough-selector');
        selector.value = borough;
        selector.dispatchEvent(new Event('change'));

        // Scroll to borough section
        const boroughSection = container.querySelector('#borough-deep-dive');
        boroughSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setupBoroughSelector(container, opportunities, boroughCounts, sectors) {
  const selector = container.querySelector('#borough-selector');
  const content = container.querySelector('#borough-content');

  selector.addEventListener('change', () => {
    const borough = selector.value;
    if (borough) {
      content.innerHTML = renderBoroughContent(borough, opportunities, sectors);
    } else {
      content.innerHTML = '<p class="text-muted">Select a borough from the dropdown or click on the map to see detailed information.</p>';
    }
  });
}

function setupTableSorting(container, opportunities, sectors) {
  const headers = container.querySelectorAll('.sortable');
  let currentSort = { field: null, ascending: true };
  const tbody = container.querySelector('#projects-tbody');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;

      // Toggle direction if same field
      if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.field = field;
        currentSort.ascending = true;
      }

      // Update header styles
      headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      header.classList.add(currentSort.ascending ? 'sort-asc' : 'sort-desc');

      // Sort opportunities
      const sorted = [...opportunities].sort((a, b) => {
        let aVal, bVal;

        switch (field) {
          case 'title':
            aVal = a.title?.toLowerCase() || '';
            bVal = b.title?.toLowerCase() || '';
            break;
          case 'sector':
            aVal = a.sector || '';
            bVal = b.sector || '';
            break;
          case 'location':
            aVal = a.location?.borough?.toLowerCase() || '';
            bVal = b.location?.borough?.toLowerCase() || '';
            break;
          case 'status':
            aVal = a.status || '';
            bVal = b.status || '';
            break;
          case 'value':
            aVal = a.value || 0;
            bVal = b.value || 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
      });

      tbody.innerHTML = renderTableRows(sorted, sectors);
      setupRowClickHandlers(container, sorted, sectors);
    });
  });
}

function setupReadinessChips(container, opportunities, sectors) {
  const chips = container.querySelectorAll('.readiness-chip');
  const filterReadiness = container.querySelector('#filter-readiness');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const readiness = chip.dataset.readiness;
      filterReadiness.value = readiness;
      filterReadiness.dispatchEvent(new Event('change'));
    });
  });
}

function setupTabSwitching(container) {
  const tabs = container.querySelectorAll('.scanner-tab');
  const tabContents = container.querySelectorAll('.scanner-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

function setupAreaCardClicks(container, opportunities, sectors) {
  const toggleButtons = container.querySelectorAll('.area-project-toggle');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.area-card');
      const isExpanded = card.classList.contains('expanded');

      if (isExpanded) {
        card.classList.remove('expanded');
      } else {
        card.classList.add('expanded');
      }
    });
  });
}

function setupOpportunityModal(container, opportunities, sectors) {
  const overlay = container.querySelector('#opp-modal-overlay');
  const modal = container.querySelector('#opp-modal');
  const content = container.querySelector('#opp-modal-content');
  const closeBtn = container.querySelector('#opp-modal-close');

  if (!overlay || !modal || !content || !closeBtn) return;

  // Close modal handlers
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('visible');
    }
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      overlay.classList.remove('visible');
    }
  };
  document.addEventListener('keydown', escHandler);

  // Click handlers for opportunities
  container.addEventListener('click', (e) => {
    const clickableOpp = e.target.closest('.clickable-opp');
    if (!clickableOpp) return;

    e.preventDefault();
    e.stopPropagation();

    const oppId = clickableOpp.dataset.oppId;
    const opp = opportunities.find(o => o.id === oppId);

    if (opp) {
      content.innerHTML = renderOpportunityDetail(opp, sectors);
      overlay.classList.add('visible');
    }
  });
}

function renderOpportunityDetail(opp, sectors) {
  const readiness = READINESS_CONFIG[opp.readiness] || READINESS_CONFIG['no-money-not-ready'];
  const status = STATUS_CONFIG[opp.status] || STATUS_CONFIG['planning'];
  const sector = sectors.find(s => s.id === opp.sector);

  // Estimate staff based on value (rough heuristic)
  const valueInMillions = (opp.value || 0) / 1000000;
  let staffEstimate = '';
  if (valueInMillions < 50) {
    staffEstimate = '2-5';
  } else if (valueInMillions < 200) {
    staffEstimate = '5-15';
  } else if (valueInMillions < 500) {
    staffEstimate = '10-25';
  } else if (valueInMillions < 1000) {
    staffEstimate = '20-50';
  } else {
    staffEstimate = '50+';
  }

  // Calculate timeline
  const timeline = opp.estimatedStart && opp.estimatedEnd
    ? `${opp.estimatedStart} - ${opp.estimatedEnd}`
    : opp.estimatedStart || 'TBC';

  // Build search URL as fallback
  const searchQuery = encodeURIComponent(`${opp.title} UK infrastructure`);
  const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
  const sourceUrl = opp.sourceLink || searchUrl;

  return `
    <div class="opp-detail">
      <!-- Header -->
      <div class="opp-detail-header">
        <div class="opp-detail-sector" style="background: ${sector?.color || '#888'}20; color: ${sector?.color || '#888'}; border-color: ${sector?.color || '#888'}">
          ${sector?.name || opp.sector || 'Unknown'}
        </div>
        <h2 class="opp-detail-title">${opp.title}</h2>
        <div class="opp-detail-location">
          ${opp.location?.borough || ''}${opp.location?.area ? `, ${opp.location.area}` : ''}
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="opp-detail-metrics">
        <div class="opp-metric">
          <div class="opp-metric-value">${formatCurrency(opp.value)}</div>
          <div class="opp-metric-label">Value</div>
        </div>
        <div class="opp-metric">
          <div class="opp-metric-value">${staffEstimate}</div>
          <div class="opp-metric-label">Est. Staff</div>
        </div>
        <div class="opp-metric">
          <div class="opp-metric-value">${timeline}</div>
          <div class="opp-metric-label">Timeline</div>
        </div>
        <div class="opp-metric">
          <div class="opp-metric-value" style="color: ${readiness.color}">${readiness.label.split(',')[0]}</div>
          <div class="opp-metric-label">Readiness</div>
        </div>
      </div>

      <!-- Status -->
      <div class="opp-detail-status">
        <span class="opp-status-badge" style="background: ${status.color}20; color: ${status.color}">${status.label}</span>
        ${opp.procurementStage ? `<span class="opp-stage-badge">${opp.procurementStage}</span>` : ''}
        ${opp.projectType ? `<span class="opp-type-badge">${opp.projectType}</span>` : ''}
      </div>

      <!-- Description -->
      ${opp.description ? `
        <div class="opp-detail-section">
          <h4>Overview</h4>
          <p>${opp.description}</p>
        </div>
      ` : ''}

      <!-- Funding -->
      <div class="opp-detail-section">
        <h4>Funding</h4>
        <p class="opp-funding">${opp.fundingStatus || 'Not specified'}</p>
        ${opp.externalTenderNote ? `<p class="opp-tender-note">⚠️ ${opp.externalTenderNote}</p>` : ''}
      </div>

      <!-- Key Drivers -->
      ${opp.keyDrivers?.length ? `
        <div class="opp-detail-section">
          <h4>Key Drivers</h4>
          <div class="opp-tags">
            ${opp.keyDrivers.map(d => `<span class="opp-tag">${d}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Services -->
      ${opp.serviceRelevance?.length ? `
        <div class="opp-detail-section">
          <h4>Relevant Services</h4>
          <div class="opp-services">
            ${opp.serviceRelevance.map(s => `<span class="opp-service">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Quick Assessment -->
      <div class="opp-detail-section opp-assessment">
        <h4>Quick Assessment</h4>
        <div class="opp-assessment-grid">
          <div class="opp-check ${opp.readiness === 'ready-to-buy' ? 'yes' : opp.readiness === 'has-money-not-ready' ? 'maybe' : 'no'}">
            <span class="check-icon">${opp.readiness === 'ready-to-buy' ? '✓' : opp.readiness === 'has-money-not-ready' ? '○' : '✗'}</span>
            <span>Client Ready</span>
          </div>
          <div class="opp-check ${opp.status === 'procurement' || opp.status === 'pre-procurement' ? 'yes' : 'maybe'}">
            <span class="check-icon">${opp.status === 'procurement' ? '✓' : '○'}</span>
            <span>In Procurement</span>
          </div>
          <div class="opp-check ${opp.projectType === 'public' ? 'yes' : 'maybe'}">
            <span class="check-icon">${opp.projectType === 'public' ? '✓' : '○'}</span>
            <span>Public Tender</span>
          </div>
          <div class="opp-check ${opp.serviceRelevance?.length >= 2 ? 'yes' : 'maybe'}">
            <span class="check-icon">${opp.serviceRelevance?.length >= 2 ? '✓' : '○'}</span>
            <span>Multi-Service</span>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="opp-detail-actions">
        <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary opp-source-btn">
          ${opp.sourceLink ? 'View Source' : 'Search Online'} →
        </a>
      </div>
    </div>
  `;
}

// Export helper for map integration
export function selectBoroughFromMap(container, borough) {
  // Switch to By Area tab
  const byAreaTab = container.querySelector('.scanner-tab[data-tab="by-area"]');
  if (byAreaTab) {
    byAreaTab.click();
  }

  // Find and highlight the area card
  const areaCard = container.querySelector(`.area-card[data-borough="${borough}"]`);
  if (areaCard) {
    // Expand the card if it has a toggle button
    const toggleBtn = areaCard.querySelector('.area-project-toggle');
    if (toggleBtn && !areaCard.classList.contains('expanded')) {
      areaCard.classList.add('expanded');
    }

    // Scroll into view with highlight effect
    areaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    areaCard.style.outline = '2px solid var(--gleeds-yellow)';
    setTimeout(() => {
      areaCard.style.outline = '';
    }, 2000);
  }
}
