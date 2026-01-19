/**
 * Sectors View
 */

import { formatCurrency, formatPercentage, getSectorColor } from '../utils/formatters.js';
import { renderUKMap } from '../components/uk-map.js';

export async function renderSectorsView(container, { data, allData, params }) {
  const selectedSector = params.id ? allData.sectors?.find(s => s.id === params.id) : null;

  if (selectedSector) {
    await renderSectorDetail(container, selectedSector, allData);
  } else {
    renderSectorGrid(container, allData);
  }
}

function renderSectorGrid(container, allData) {
  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Sectors</h1>
      <p class="view-subtitle">UK infrastructure investment by sector</p>
    </div>

    <section class="section">
      <div class="sector-grid">
        ${(allData.sectors || []).map(sector => {
          const opps = (allData.opportunities || []).filter(o => o.sector === sector.id);
          const color = getSectorColor(sector.id);

          return `
            <a href="#sectors/${sector.id}" class="card card-clickable sector-card" data-sector="${sector.id}">
              <div class="card-title">${sector.name}</div>
              <p class="text-muted mb-sm">${sector.description || ''}</p>
              <div class="sector-metrics">
                <span class="badge badge-yellow">${formatCurrency(sector.budget10Year || 0)}</span>
                <span class="badge">${opps.length} opportunities</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

async function renderSectorDetail(container, sector, allData) {
  const opportunities = (allData.opportunities || []).filter(o => o.sector === sector.id);
  const clients = (allData.clients || []).filter(c => c.sector === sector.id);

  // Calculate regional distribution for this sector
  const regionalData = calculateSectorRegionalData(sector, opportunities, allData.regions || []);

  container.innerHTML = `
    <div class="view-header">
      <a href="#sectors" class="btn mb-md">Back to Sectors</a>
      <h1 class="view-title">${sector.name}</h1>
      <p class="view-subtitle">${sector.description || ''}</p>
    </div>

    <!-- Sector KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">10-Year Budget</div>
          <div class="kpi-value">${formatCurrency(sector.budget10Year || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">2026 Spend</div>
          <div class="kpi-value">${formatCurrency(sector.budget2026 || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Opportunities</div>
          <div class="kpi-value">${opportunities.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Key Clients</div>
          <div class="kpi-value">${clients.length}</div>
        </div>
      </div>
    </section>

    <!-- Regional Distribution Map -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Regional Distribution</h2>
        <div class="btn-group">
          <button class="btn btn-active" id="btn-sector-value">By Value</button>
          <button class="btn" id="btn-sector-count">By Count</button>
        </div>
      </div>
      <div class="sector-map-layout">
        <div class="sector-map-container card">
          <div id="sector-uk-map"></div>
        </div>
        <div class="sector-map-panel">
          <div class="map-panel-title">Top Regions for ${sector.name}</div>
          <div class="sector-region-rankings">
            ${renderSectorRegionRankings(regionalData)}
          </div>
        </div>
      </div>
    </section>

    <!-- Sub-sectors -->
    ${sector.subSectors ? `
      <section class="section">
        <h2 class="section-title mb-md">Sub-sector Breakdown</h2>
        <div class="sub-sector-list">
          ${(sector.subSectors || []).map(sub => `
            <div class="sub-sector-item">
              <span class="sub-sector-name">${sub.name}</span>
              <div class="progress-bar sub-sector-bar">
                <div class="progress-fill" style="width: ${sub.percentage}%"></div>
              </div>
              <span class="sub-sector-percentage">${formatPercentage(sub.percentage)}</span>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Opportunities -->
    <section class="section">
      <h2 class="section-title mb-md">Opportunities (${opportunities.length})</h2>
      ${opportunities.length ? `
        <div class="opportunity-list">
          ${opportunities.slice(0, 10).map(opp => renderOpportunityCard(opp)).join('')}
        </div>
      ` : '<p class="text-muted">No opportunities in this sector</p>'}
    </section>
  `;

  // Render the sector map
  const mapContainer = container.querySelector('#sector-uk-map');

  async function updateSectorMap(dataKey) {
    await renderUKMap(mapContainer, {
      data: regionalData,
      dataKey: dataKey,
      title: `${sector.name} - Regional Distribution`,
      colorScheme: getSectorColorScheme(sector.id),
      width: 450,
      height: 580,
      onRegionClick: (regionId) => {
        window.location.hash = `#regions/${regionId}`;
      }
    });
  }

  // Initial render
  await updateSectorMap('totalValue');

  // Toggle buttons
  const btnValue = container.querySelector('#btn-sector-value');
  const btnCount = container.querySelector('#btn-sector-count');

  btnValue.addEventListener('click', async () => {
    btnValue.classList.add('btn-active');
    btnCount.classList.remove('btn-active');
    await updateSectorMap('totalValue');
  });

  btnCount.addEventListener('click', async () => {
    btnCount.classList.add('btn-active');
    btnValue.classList.remove('btn-active');
    await updateSectorMap('opportunityCount');
  });
}

// Calculate regional data for a specific sector
function calculateSectorRegionalData(sector, sectorOpportunities, regions) {
  // Create a map of region -> aggregated data
  const regionMap = {};

  // Initialize all regions with base data
  regions.forEach(region => {
    regionMap[region.id] = {
      id: region.id,
      name: region.name,
      totalValue: 0,
      opportunityCount: 0
    };
  });

  // Aggregate opportunities by region
  sectorOpportunities.forEach(opp => {
    if (opp.region && regionMap[opp.region]) {
      regionMap[opp.region].totalValue += opp.value || 0;
      regionMap[opp.region].opportunityCount += 1;
    }
  });

  return Object.values(regionMap);
}

// Get color scheme based on sector
function getSectorColorScheme(sectorId) {
  const schemes = {
    'rail': 'green',
    'highways': 'blue',
    'aviation': 'yellow',
    'maritime': 'blue',
    'utilities': 'yellow'
  };
  return schemes[sectorId] || 'yellow';
}

// Render region rankings for the sector
function renderSectorRegionRankings(regionalData) {
  const sorted = [...regionalData]
    .filter(r => r.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 8);

  if (!sorted.length) {
    return '<p class="text-muted">No regional data available</p>';
  }

  return sorted.map((region, index) => {
    const positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
    return `
      <a href="#regions/${region.id}" class="ranking-item">
        <span class="ranking-position ${positionClass}">${index + 1}</span>
        <span class="ranking-name">${region.name}</span>
        <span class="ranking-value">${formatCurrency(region.totalValue)}</span>
        <span class="ranking-count badge">${region.opportunityCount} opps</span>
      </a>
    `;
  }).join('');
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

function renderOpportunityCard(opp) {
  const ratingClass = (opp.bidRating || '').toLowerCase() === 'high' ? 'badge-high' :
                      (opp.bidRating || '').toLowerCase() === 'medium' ? 'badge-medium' : 'badge-low';

  const statusColor = STATUS_COLORS[opp.status] || '#888888';
  const statusLabel = STATUS_LABELS[opp.status] || opp.status || 'Unknown';

  return `
    <div class="card opportunity-card">
      <div class="opportunity-header">
        <div>
          <div class="opportunity-title">${opp.title}</div>
          <div class="opportunity-client">${opp.region || 'Unknown region'}</div>
        </div>
        <span class="badge ${ratingClass}">${opp.bidRating || 'TBC'}</span>
      </div>
      <div class="opportunity-meta">
        <span class="badge" style="background: ${statusColor}20; color: ${statusColor}; border-color: ${statusColor}">${statusLabel}</span>
        ${opp.procurementStage ? `<span class="badge">${opp.procurementStage}</span>` : ''}
        <span class="opportunity-value">${formatCurrency(opp.value)}</span>
      </div>
      ${opp.bidDeadline ? `<div class="opportunity-deadline">Due: ${new Date(opp.bidDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>` : ''}
    </div>
  `;
}
