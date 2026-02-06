/**
 * Regions View
 */

import { formatCurrency, getSectorColor } from '../utils/formatters.js';
import { renderUKMap } from '../components/uk-map.js';
import { renderRegionSubdivisionMap } from '../components/region-map.js';
import { openRegionExplorer } from '../components/region-explorer.js';
import { loadRegionalOpportunities, renderRegionalScanner, selectBoroughFromMap } from '../components/regional-scanner.js';

// Regions that have enhanced scanner data
const SCANNER_ENABLED_REGIONS = ['london', 'south-east', 'north-west', 'north-east', 'yorkshire-humber', 'midlands', 'east-midlands', 'eastern', 'south-west', 'scotland', 'wales', 'northern-ireland'];

export async function renderRegionsView(container, { data, allData, params }) {
  const selectedRegion = params.id ? allData.regions?.find(r => r.id === params.id) : null;

  if (selectedRegion) {
    await renderRegionDetail(container, selectedRegion, allData);
  } else {
    await renderRegionGrid(container, allData);
  }
}

async function renderRegionGrid(container, allData) {
  // Sort regions by budget
  const sortedRegions = [...(allData.regions || [])].sort((a, b) =>
    (b.budget10Year || 0) - (a.budget10Year || 0)
  );

  // Calculate opportunity counts for each region
  const regionsWithOpps = (allData.regions || []).map(region => {
    const opps = (allData.opportunities || []).filter(o => o.region === region.id);
    return {
      ...region,
      opportunityCount: opps.length
    };
  });

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Regions</h1>
      <p class="view-subtitle">UK infrastructure investment by region - click a region on the map to explore</p>
    </div>

    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Regional Investment Map</h2>
        <div class="btn-group">
          <button class="btn btn-active" id="btn-regions-10year">10-Year</button>
          <button class="btn" id="btn-regions-2026">2026</button>
        </div>
      </div>
      <div class="region-map-layout">
        <!-- Interactive UK Map -->
        <div class="region-map-container card">
          <div id="regions-uk-map"></div>
        </div>

        <!-- Region Rankings Panel -->
        <div class="region-map-panel">
          <div class="map-panel-title">10-Year Budget Rankings</div>
          <div class="region-rankings">
            ${sortedRegions.map((region, index) => {
              const opps = (allData.opportunities || []).filter(o => o.region === region.id);
              const maxBudget = sortedRegions[0].budget10Year || 1;
              const percentage = ((region.budget10Year || 0) / maxBudget * 100).toFixed(0);

              return `
                <a href="#regions/${region.id}" class="region-rank-item" data-region="${region.id}">
                  <div class="rank-header">
                    <span class="rank-number">${index + 1}</span>
                    <span class="rank-name">${region.name}</span>
                    <span class="rank-value">${formatCurrency(region.budget10Year || 0)}</span>
                  </div>
                  <div class="rank-bar">
                    <div class="rank-bar-fill" style="width: ${percentage}%"></div>
                  </div>
                  <div class="rank-meta">${opps.length} opportunities</div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Region Cards Grid -->
    <section class="section">
      <h2 class="section-title mb-md">All Regions</h2>
      <div class="region-grid">
        ${(allData.regions || []).map(region => {
          const opps = (allData.opportunities || []).filter(o => o.region === region.id);

          return `
            <a href="#regions/${region.id}" class="card card-clickable region-card">
              <div class="card-title">${region.name}</div>
              <div class="region-budget">${formatCurrency(region.budget10Year || 0)}</div>
              <div class="region-opportunities">${opps.length} opportunities | ${region.expectedOpportunities || 0} expected</div>
              <p class="text-muted mt-sm">${region.strategicFocus || ''}</p>
            </a>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // Render the UK map
  const mapContainer = container.querySelector('#regions-uk-map');

  async function updateRegionsMap(budgetKey) {
    await renderUKMap(mapContainer, {
      data: regionsWithOpps,
      dataKey: budgetKey,
      title: budgetKey === 'budget10Year' ? '10-Year Regional Budget' : '2026 Regional Budget',
      width: 500,
      height: 650,
      onRegionClick: (regionId) => {
        window.location.hash = `#regions/${regionId}`;
      }
    });
  }

  // Initial render
  await updateRegionsMap('budget10Year');

  // Toggle buttons
  const btn10Year = container.querySelector('#btn-regions-10year');
  const btn2026 = container.querySelector('#btn-regions-2026');

  btn10Year.addEventListener('click', async () => {
    btn10Year.classList.add('btn-active');
    btn2026.classList.remove('btn-active');
    await updateRegionsMap('budget10Year');
  });

  btn2026.addEventListener('click', async () => {
    btn2026.classList.add('btn-active');
    btn10Year.classList.remove('btn-active');
    await updateRegionsMap('budget2026');
  });
}

async function renderRegionDetail(container, region, allData) {
  const opportunities = (allData.opportunities || []).filter(o => o.region === region.id);
  const clients = (allData.clients || []).filter(c =>
    (c.regions || []).includes(region.id) || (c.regions || []).includes('national')
  );

  // Get all clients for this region (used for sector breakdown)
  const regionClients = (allData.clients || []).filter(c =>
    (c.regions || []).includes(region.id)
  );

  // Get subdivision display name
  const subdivisionType = getSubdivisionType(region.id);

  // Check if this region has scanner data
  const hasScannerData = SCANNER_ENABLED_REGIONS.includes(region.id);

  // Load regional opportunities if available
  let regionalData = null;
  if (hasScannerData) {
    regionalData = await loadRegionalOpportunities(region.id);
  }

  // Calculate enhanced KPIs if scanner data available
  const scannerProjectCount = regionalData?.opportunities?.length || 0;
  const scannerTotalValue = regionalData?.opportunities?.reduce((sum, o) => sum + (o.value || 0), 0) || 0;

  // Calculate sector breakdown combining CLIENT BUDGETS + SCANNER OPPORTUNITIES
  // This gives the full picture: HS2's £56B from clients + Real Estate £53B from scanner
  const sectorBreakdown = calculateCombinedSectorBreakdown(
    regionClients,
    regionalData?.opportunities || [],
    allData.sectors || []
  );

  container.innerHTML = `
    <div class="view-header">
      <div class="view-header-actions" style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md);">
        <a href="#regions" class="btn">← Back to Regions</a>
        <button class="btn btn-primary" id="btn-explore-region">
          Explore Region
        </button>
      </div>
      <h1 class="view-title">${region.name}</h1>
      <p class="view-subtitle">${region.strategicFocus || ''}</p>
    </div>

    <!-- Region KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">10-Year Budget</div>
          <div class="kpi-value">${formatCurrency(region.budget10Year || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">2026 Spend</div>
          <div class="kpi-value">${formatCurrency(region.budget2026 || 0)}</div>
        </div>
        ${hasScannerData && scannerProjectCount > 0 ? `
          <div class="kpi-card">
            <div class="kpi-label">Scanned Projects</div>
            <div class="kpi-value">${scannerProjectCount}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Pipeline Value</div>
            <div class="kpi-value">${formatCurrency(scannerTotalValue)}</div>
          </div>
        ` : `
          <div class="kpi-card">
            <div class="kpi-label">Current Opportunities</div>
            <div class="kpi-value">${opportunities.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Key Clients</div>
            <div class="kpi-value">${clients.length}</div>
          </div>
        `}
      </div>
    </section>

    <!-- Regional Subdivision Map -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">${subdivisionType} Map</h2>
      </div>
      <div class="region-detail-map-layout">
        <div class="region-detail-map-container card">
          <div id="region-subdivision-map"></div>
        </div>
        <div class="region-detail-panel">
          <div class="map-panel-title">Sector Investment</div>
          <div class="region-sector-breakdown">
            ${renderSectorBreakdown(sectorBreakdown)}
          </div>
        </div>
      </div>
    </section>

    <!-- Regional Opportunities Scanner (for London & South East) -->
    ${hasScannerData ? `<div id="regional-scanner-container"></div>` : ''}

    <!-- Growth Areas -->
    ${region.growthAreas ? `
      <section class="section">
        <h2 class="section-title mb-md">Growth Areas</h2>
        <p>${region.growthAreas}</p>
      </section>
    ` : ''}

    <!-- Key Clients -->
    <section class="section">
      <h2 class="section-title mb-md">Key Clients</h2>
      <div class="client-list">
        ${clients.slice(0, 10).map(client => `
          <div class="client-item">
            <div>
              <div class="client-name">${client.name}</div>
              <div class="client-sector">${client.sector || 'Unknown'}</div>
              ${client.source ? `<div class="client-source">${client.source}</div>` : ''}
            </div>
            <div class="client-budget">${formatCurrency(client.budget10Year || 0)}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Legacy Opportunities (shown if no scanner data) -->
    ${!hasScannerData ? `
      <section class="section">
        <h2 class="section-title mb-md">Opportunities (${opportunities.length})</h2>
        ${opportunities.length ? `
          <div class="opportunity-list">
            ${opportunities.slice(0, 10).map(opp => `
              <div class="card opportunity-card">
                <div class="opportunity-header">
                  <div>
                    <div class="opportunity-title">${opp.title}</div>
                    <div class="opportunity-client">${opp.sector || 'Unknown sector'}</div>
                  </div>
                  <span class="badge ${getRatingClass(opp.bidRating)}">${opp.bidRating || 'TBC'}</span>
                </div>
                <div class="opportunity-meta">
                  ${getStatusBadge(opp.status)}
                  ${opp.procurementStage ? `<span class="badge">${opp.procurementStage}</span>` : ''}
                  <span class="opportunity-value">${formatCurrency(opp.value)}</span>
                </div>
                ${opp.bidDeadline ? `<div class="opportunity-deadline">Due: ${new Date(opp.bidDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-muted">No opportunities in this region</p>'}
      </section>
    ` : ''}
  `;

  // Render the regional subdivision map with combined data
  const mapContainer = container.querySelector('#region-subdivision-map');

  // Calculate total budget for this region from clients (regionClients already defined above)
  const totalRegionBudget = regionClients.reduce((sum, c) => sum + (c.budget10Year || 0), 0);

  // Calculate combined borough data from scanner opportunities AND clients
  // This gives the full picture for heatmap coloring and tooltip display
  const boroughData = calculateCombinedBoroughData(
    region.id,
    regionClients,
    regionalData?.opportunities || [],
    allData.sectors || []
  );

  await renderRegionSubdivisionMap(mapContainer, {
    regionId: region.id,
    regionName: region.name,
    boroughData: boroughData,  // Combined data for coloring and tooltips
    totalBudget: totalRegionBudget,
    title: `${region.name} ${subdivisionType}`,
    colorScheme: 'yellow',
    width: 500,
    height: 450,
    showLegend: true,
    onSubdivisionClick: hasScannerData ? (subdivisionName) => {
      // When clicking on map, scroll to and select borough in scanner
      const scannerContainer = container.querySelector('#regional-scanner-container');
      if (scannerContainer) {
        selectBoroughFromMap(scannerContainer, subdivisionName);
        scannerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } : null
  });

  // Render the regional scanner if available
  if (hasScannerData && regionalData) {
    const scannerContainer = container.querySelector('#regional-scanner-container');
    if (scannerContainer) {
      // Pass all data: scanner opportunities, legacy opportunities, AND clients
      renderRegionalScanner(scannerContainer, regionalData, {
        regionId: region.id,
        sectors: allData.sectors || [],
        legacyOpportunities: opportunities,  // From opportunities.json
        clients: regionClients  // Clients serving this region
      });
    }
  }

  // Setup Explore Region button
  const exploreBtn = container.querySelector('#btn-explore-region');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      openRegionExplorer(region, {
        opportunities,
        clients,
        sectorBreakdown
      });
    });
  }
}

// Get the subdivision type name for a region
function getSubdivisionType(regionId) {
  const types = {
    'london': 'Boroughs',
    'scotland': 'Council Areas',
    'wales': 'Principal Areas',
    'northern-ireland': 'Districts',
    'north-east': 'Districts',
    'north-west': 'Districts',
    'yorkshire-humber': 'Districts',
    'east-midlands': 'Districts',
    'midlands': 'Districts',
    'eastern': 'Districts',
    'south-east': 'Districts',
    'south-west': 'Districts'
  };
  return types[regionId] || 'Subdivisions';
}

// Calculate sector breakdown combining CLIENT BUDGETS + SCANNER OPPORTUNITIES
// This gives the complete picture: established sectors from clients + new sectors from scanner
function calculateCombinedSectorBreakdown(regionClients, scannerOpportunities, sectors) {
  const sectorMap = {};

  // Initialize all sectors from the sectors data
  sectors.forEach(sector => {
    sectorMap[sector.id] = {
      id: sector.id,
      name: sector.name,
      clientValue: 0,
      scannerValue: 0,
      totalValue: 0,
      clientCount: 0,
      projectCount: 0,
      color: sector.color || getSectorColor(sector.id)
    };
  });

  // Add client budgets by sector
  regionClients.forEach(client => {
    const sectorId = client.sector;
    if (sectorId && sectorMap[sectorId]) {
      sectorMap[sectorId].clientValue += client.budget10Year || 0;
      sectorMap[sectorId].clientCount += 1;
    }
  });

  // Add scanner opportunity values by sector (for sectors not covered by clients)
  scannerOpportunities.forEach(opp => {
    const sectorId = opp.sector;
    if (sectorId) {
      if (!sectorMap[sectorId]) {
        // Create entry for sectors not in main sectors list
        const sector = sectors.find(s => s.id === sectorId);
        sectorMap[sectorId] = {
          id: sectorId,
          name: sector?.name || sectorId.charAt(0).toUpperCase() + sectorId.slice(1).replace(/-/g, ' '),
          clientValue: 0,
          scannerValue: 0,
          totalValue: 0,
          clientCount: 0,
          projectCount: 0,
          color: sector?.color || getSectorColor(sectorId)
        };
      }
      sectorMap[sectorId].scannerValue += opp.value || 0;
      sectorMap[sectorId].projectCount += 1;
    }
  });

  // Calculate totals - use client value if available, otherwise scanner value
  // This prevents double-counting for sectors that have both
  Object.values(sectorMap).forEach(sector => {
    // For sectors with client data, use client budgets (more comprehensive)
    // For sectors without client data, use scanner project values
    if (sector.clientValue > 0) {
      sector.totalValue = sector.clientValue;
    } else {
      sector.totalValue = sector.scannerValue;
    }
  });

  return Object.values(sectorMap).filter(s => s.totalValue > 0);
}

// Calculate sector breakdown from CLIENT BUDGETS only (legacy)
function calculateClientSectorBreakdown(regionClients, sectors) {
  const sectorMap = {};

  // Initialize all sectors from the sectors data
  sectors.forEach(sector => {
    sectorMap[sector.id] = {
      id: sector.id,
      name: sector.name,
      totalValue: 0,
      clientCount: 0,
      color: sector.color || getSectorColor(sector.id)
    };
  });

  // Aggregate client budgets by sector
  regionClients.forEach(client => {
    const sectorId = client.sector;
    if (sectorId) {
      // If sector exists in our map, add to it
      if (sectorMap[sectorId]) {
        sectorMap[sectorId].totalValue += client.budget10Year || 0;
        sectorMap[sectorId].clientCount += 1;
      } else {
        // Create new sector entry for unmapped sectors
        sectorMap[sectorId] = {
          id: sectorId,
          name: sectorId.charAt(0).toUpperCase() + sectorId.slice(1),
          totalValue: client.budget10Year || 0,
          clientCount: 1,
          color: getSectorColor(sectorId)
        };
      }
    }
  });

  return Object.values(sectorMap).filter(s => s.totalValue > 0);
}

// Calculate sector breakdown for a region (from opportunities - legacy)
function calculateRegionSectorBreakdown(region, regionOpportunities, sectors) {
  const sectorMap = {};

  // Initialize all sectors
  sectors.forEach(sector => {
    sectorMap[sector.id] = {
      id: sector.id,
      name: sector.name,
      totalValue: 0,
      opportunityCount: 0,
      color: getSectorColor(sector.id)
    };
  });

  // Aggregate opportunities by sector
  regionOpportunities.forEach(opp => {
    if (opp.sector && sectorMap[opp.sector]) {
      sectorMap[opp.sector].totalValue += opp.value || 0;
      sectorMap[opp.sector].opportunityCount += 1;
    }
  });

  return Object.values(sectorMap).filter(s => s.totalValue > 0);
}

// Render sector breakdown bars
function renderSectorBreakdown(sectorBreakdown) {
  if (!sectorBreakdown.length) {
    return '<p class="text-muted">No sector data available for this region</p>';
  }

  // Sort by value
  const sorted = [...sectorBreakdown].sort((a, b) => b.totalValue - a.totalValue);
  const maxValue = sorted[0]?.totalValue || 1;

  return sorted.map(sector => {
    const percentage = ((sector.totalValue / maxValue) * 100).toFixed(0);

    // Determine what to show: clients (from client data) or projects (from scanner)
    let countLabel = '';
    if (sector.clientCount > 0) {
      countLabel = `${sector.clientCount} clients`;
    } else if (sector.projectCount > 0) {
      countLabel = `${sector.projectCount} projects`;
    } else if (sector.opportunityCount !== undefined) {
      countLabel = `${sector.opportunityCount} opportunities`;
    }

    return `
      <a href="#sectors/${sector.id}" class="sector-breakdown-item">
        <div class="sector-breakdown-header">
          <div class="sector-indicator" style="background: ${sector.color}"></div>
          <span class="sector-breakdown-name">${sector.name}</span>
          <span class="sector-breakdown-value">${formatCurrency(sector.totalValue)}</span>
        </div>
        <div class="sector-breakdown-bar">
          <div class="sector-breakdown-fill" style="width: ${percentage}%; background: ${sector.color}"></div>
        </div>
        ${countLabel ? `<span class="sector-breakdown-count">${countLabel}</span>` : ''}
      </a>
    `;
  }).join('');
}

function getRatingClass(rating) {
  const r = (rating || '').toLowerCase();
  if (r === 'high') return 'badge-high';
  if (r === 'medium') return 'badge-medium';
  return 'badge-low';
}

// Pipeline status colors
const STATUS_COLORS = {
  'planning': '#6B7280',
  'pre-procurement': '#8B5CF6',
  'procurement': '#F59E0B',
  'delivery': '#10B981',
  'complete': '#3B82F6'
};

const STATUS_LABELS = {
  'planning': 'Planning',
  'pre-procurement': 'Pre-Procurement',
  'procurement': 'In Procurement',
  'delivery': 'In Delivery',
  'complete': 'Complete'
};

function getStatusBadge(status) {
  const color = STATUS_COLORS[status] || '#888888';
  const label = STATUS_LABELS[status] || status || 'Unknown';
  return `<span class="badge" style="background: ${color}20; color: ${color}; border-color: ${color}">${label}</span>`;
}

// Calculate combined borough data from clients + scanner opportunities
// Returns object mapping borough names to { budget, opportunityCount, clientCount, sectors }
function calculateCombinedBoroughData(regionId, clients, scannerOpportunities, sectors) {
  const boroughData = {};

  // Helper to initialize or get borough entry
  function getBorough(name) {
    if (!boroughData[name]) {
      boroughData[name] = {
        budget: 0,
        opportunityCount: 0,
        clientCount: 0,
        sectors: new Set()
      };
    }
    return boroughData[name];
  }

  // Add client data - clients that serve specific subdivisions
  clients.forEach(client => {
    const budget = client.budget10Year || 0;
    const sectorId = client.sector;

    // Check if client has subdivision-specific mapping
    if (client.subdivisions && client.subdivisions[regionId]) {
      // Client serves specific boroughs
      const boroughs = client.subdivisions[regionId];
      const perBoroughBudget = budget / boroughs.length;

      boroughs.forEach(boroughName => {
        const borough = getBorough(boroughName);
        borough.budget += perBoroughBudget;
        borough.clientCount += 1;
        if (sectorId) borough.sectors.add(sectorId);
      });
    }
    // If client has no subdivisions, they serve the whole region - we don't attribute to specific boroughs
  });

  // Add scanner opportunity data
  scannerOpportunities.forEach(opp => {
    const boroughName = opp.location?.borough;
    if (!boroughName) return;

    const borough = getBorough(boroughName);
    borough.budget += opp.value || 0;
    borough.opportunityCount += 1;
    if (opp.sector) borough.sectors.add(opp.sector);
  });

  // Convert sets to arrays for serialization
  Object.values(boroughData).forEach(data => {
    data.sectors = Array.from(data.sectors);
  });

  return boroughData;
}
