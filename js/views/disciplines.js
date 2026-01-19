/**
 * Disciplines View
 */

import { formatCurrency } from '../utils/formatters.js';
import { renderUKMap } from '../components/uk-map.js';

export async function renderDisciplinesView(container, { data, allData, params }) {
  const selectedDiscipline = params.id ? allData.disciplines?.find(d => d.id === params.id) : null;

  if (selectedDiscipline) {
    await renderDisciplineDetail(container, selectedDiscipline, allData);
  } else {
    renderDisciplineGrid(container, allData);
  }
}

function renderDisciplineGrid(container, allData) {
  const disciplines = allData.disciplines || [];

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Disciplines</h1>
      <p class="view-subtitle">Service line opportunities across the market</p>
    </div>

    <section class="section">
      <div class="discipline-grid">
        ${disciplines.map(discipline => {
          const opps = (allData.opportunities || []).filter(o => o.discipline === discipline.id);

          return `
            <a href="#disciplines/${discipline.id}" class="card card-clickable discipline-card">
              <div class="discipline-icon">${discipline.icon || ''}</div>
              <div class="discipline-name card-title">${discipline.name}</div>
              <div class="discipline-budget">${formatCurrency(discipline.budget10Year || 0)}</div>
              <p class="text-muted">${opps.length} opportunities</p>
            </a>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Cross-Sector Analysis -->
    <section class="section">
      <h2 class="section-title mb-md">Discipline Demand by Sector</h2>
      <div class="grid-auto">
        ${renderDisciplineSectorMatrix(disciplines, allData.sectors, allData.opportunities)}
      </div>
    </section>
  `;
}

async function renderDisciplineDetail(container, discipline, allData) {
  const opportunities = (allData.opportunities || []).filter(o => o.discipline === discipline.id);

  // Group by sector
  const bySector = {};
  opportunities.forEach(opp => {
    if (!bySector[opp.sector]) bySector[opp.sector] = [];
    bySector[opp.sector].push(opp);
  });

  // Calculate regional distribution for this discipline
  const regionalData = calculateDisciplineRegionalData(discipline, opportunities, allData.regions || []);

  container.innerHTML = `
    <div class="view-header">
      <a href="#disciplines" class="btn mb-md">Back to Disciplines</a>
      <h1 class="view-title">${discipline.name}</h1>
      <p class="view-subtitle">${discipline.description || ''}</p>
    </div>

    <!-- Discipline KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">10-Year Market</div>
          <div class="kpi-value">${formatCurrency(discipline.budget10Year || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">2026 Demand</div>
          <div class="kpi-value">${formatCurrency(discipline.budget2026 || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Opportunities</div>
          <div class="kpi-value">${opportunities.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sectors</div>
          <div class="kpi-value">${Object.keys(bySector).length}</div>
        </div>
      </div>
    </section>

    <!-- Regional Distribution Map -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Regional Distribution</h2>
        <div class="btn-group">
          <button class="btn btn-active" id="btn-disc-value">By Value</button>
          <button class="btn" id="btn-disc-count">By Count</button>
        </div>
      </div>
      <div class="discipline-map-layout">
        <div class="discipline-map-container card">
          <div id="discipline-uk-map"></div>
        </div>
        <div class="discipline-map-panel">
          <div class="map-panel-title">Top Regions for ${discipline.name}</div>
          <div class="discipline-region-rankings">
            ${renderDisciplineRegionRankings(regionalData)}
          </div>
        </div>
      </div>
    </section>

    <!-- Opportunities by Sector -->
    <section class="section">
      <h2 class="section-title mb-md">Opportunities by Sector</h2>
      ${Object.entries(bySector).map(([sectorId, opps]) => `
        <div class="mb-lg">
          <h3 class="text-yellow mb-sm">${sectorId} (${opps.length})</h3>
          <div class="opportunity-list">
            ${opps.slice(0, 5).map(opp => `
              <div class="card opportunity-card">
                <div class="opportunity-header">
                  <div>
                    <div class="opportunity-title">${opp.title}</div>
                    <div class="opportunity-client">${opp.region || 'Unknown'}</div>
                  </div>
                  <span class="opportunity-value">${formatCurrency(opp.value)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      ${!Object.keys(bySector).length ? '<p class="text-muted">No opportunities for this discipline</p>' : ''}
    </section>
  `;

  // Render the discipline map
  const mapContainer = container.querySelector('#discipline-uk-map');

  async function updateDisciplineMap(dataKey) {
    await renderUKMap(mapContainer, {
      data: regionalData,
      dataKey: dataKey,
      title: `${discipline.name} - Regional Distribution`,
      colorScheme: getDisciplineColorScheme(discipline.id),
      width: 450,
      height: 580,
      onRegionClick: (regionId) => {
        window.location.hash = `#regions/${regionId}`;
      }
    });
  }

  // Initial render
  await updateDisciplineMap('totalValue');

  // Toggle buttons
  const btnValue = container.querySelector('#btn-disc-value');
  const btnCount = container.querySelector('#btn-disc-count');

  btnValue.addEventListener('click', async () => {
    btnValue.classList.add('btn-active');
    btnCount.classList.remove('btn-active');
    await updateDisciplineMap('totalValue');
  });

  btnCount.addEventListener('click', async () => {
    btnCount.classList.add('btn-active');
    btnValue.classList.remove('btn-active');
    await updateDisciplineMap('opportunityCount');
  });
}

// Calculate regional data for a specific discipline
function calculateDisciplineRegionalData(discipline, disciplineOpportunities, regions) {
  const regionMap = {};

  // Initialize all regions
  regions.forEach(region => {
    regionMap[region.id] = {
      id: region.id,
      name: region.name,
      totalValue: 0,
      opportunityCount: 0
    };
  });

  // Aggregate opportunities by region
  disciplineOpportunities.forEach(opp => {
    if (opp.region && regionMap[opp.region]) {
      regionMap[opp.region].totalValue += opp.value || 0;
      regionMap[opp.region].opportunityCount += 1;
    }
  });

  return Object.values(regionMap);
}

// Get color scheme based on discipline - using consistent yellow-orange heatmap
function getDisciplineColorScheme(disciplineId) {
  return 'yellow';
}

// Render region rankings for the discipline
function renderDisciplineRegionRankings(regionalData) {
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

function renderDisciplineSectorMatrix(disciplines, sectors, opportunities) {
  if (!sectors || !sectors.length) return '';

  return sectors.map(sector => {
    const sectorOpps = (opportunities || []).filter(o => o.sector === sector.id);

    return `
      <div class="card">
        <div class="card-title mb-sm">${sector.name}</div>
        <div class="flex flex-col gap-sm">
          ${disciplines.map(disc => {
            const count = sectorOpps.filter(o => o.discipline === disc.id).length;
            return `
              <div class="flex justify-between items-center">
                <span class="text-muted">${disc.name}</span>
                <span class="badge ${count > 0 ? 'badge-yellow' : ''}">${count}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}
