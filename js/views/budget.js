/**
 * Budget Summary View
 */

import { formatCurrency, formatNumber, getSectorColor } from '../utils/formatters.js';
import { renderUKMap } from '../components/uk-map.js';

export async function renderBudgetView(container, { data, allData, filters }) {
  // Calculate totals
  const totalBudget10Year = (allData.regions || []).reduce((sum, r) => sum + (r.budget10Year || 0), 0);
  const totalBudget2026 = (allData.regions || []).reduce((sum, r) => sum + (r.budget2026 || 0), 0);

  // Calculate regional budgets with opportunities count
  const regionsWithOpps = (allData.regions || []).map(region => {
    const opps = (allData.opportunities || []).filter(o => o.region === region.id);
    return {
      ...region,
      opportunityCount: opps.length
    };
  });

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Budget Summary</h1>
      <p class="view-subtitle">Investment allocation by region, sector, and client</p>
    </div>

    <!-- Total KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total 10-Year Budget</div>
          <div class="kpi-value">${formatCurrency(totalBudget10Year)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">2026 Spend</div>
          <div class="kpi-value">${formatCurrency(totalBudget2026)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Sectors</div>
          <div class="kpi-value">${allData.sectors?.length || 0}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">UK Regions</div>
          <div class="kpi-value">${allData.regions?.length || 0}</div>
        </div>
      </div>
    </section>

    <!-- UK Map Section -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Regional Investment Map</h2>
        <div class="btn-group">
          <button class="btn btn-active" id="btn-10year">10-Year</button>
          <button class="btn" id="btn-2026">2026</button>
        </div>
      </div>
      <div class="budget-map-layout">
        <div class="budget-map-container card">
          <div id="budget-uk-map"></div>
        </div>
        <div class="budget-map-panel">
          <div class="map-panel-title">Sector Budgets</div>
          <div class="sector-rankings">
            ${renderSectorSummary(allData.sectors, allData.opportunities)}
          </div>
        </div>
      </div>
    </section>

    <!-- Budget Overview -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Budget Rankings</h2>
      </div>
      <div class="budget-overview">
        <div>
          <h3 class="mb-md text-yellow">Top Sectors by 10-Year Budget</h3>
          <div class="budget-rankings">
            ${renderSectorRankings(allData.sectors)}
          </div>
        </div>
        <div>
          <h3 class="mb-md text-yellow">Top Regions by 10-Year Budget</h3>
          <div class="budget-rankings">
            ${renderRegionRankings(allData.regions)}
          </div>
        </div>
      </div>
    </section>

    <!-- Client List -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Major Clients</h2>
        <span class="text-muted">${data.clients?.length || 0} clients</span>
      </div>
      <div class="client-list">
        ${renderClientList(data.clients, allData.opportunities)}
      </div>
    </section>
  `;

  // Render the UK map
  const mapContainer = container.querySelector('#budget-uk-map');

  async function updateMap(budgetKey) {
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
  await updateMap('budget10Year');

  // Budget toggle buttons
  const btn10Year = container.querySelector('#btn-10year');
  const btn2026 = container.querySelector('#btn-2026');

  btn10Year.addEventListener('click', async () => {
    btn10Year.classList.add('btn-active');
    btn2026.classList.remove('btn-active');
    await updateMap('budget10Year');
  });

  btn2026.addEventListener('click', async () => {
    btn2026.classList.add('btn-active');
    btn10Year.classList.remove('btn-active');
    await updateMap('budget2026');
  });
}

function renderSectorSummary(sectors, opportunities) {
  if (!sectors || !sectors.length) {
    return '<p class="text-muted">No sector data available</p>';
  }

  const sorted = [...sectors].sort((a, b) => (b.budget10Year || 0) - (a.budget10Year || 0));

  return sorted.map(sector => {
    const sectorOpps = opportunities?.filter(o => o.sector === sector.id) || [];
    const color = getSectorColor(sector.id);

    return `
      <a href="#sectors/${sector.id}" class="sector-summary-item">
        <div class="sector-indicator" style="background: ${color};"></div>
        <div class="sector-info">
          <span class="sector-name">${sector.name}</span>
          <span class="sector-budget">${formatCurrency(sector.budget10Year || 0)}</span>
        </div>
        <span class="sector-opps">${sectorOpps.length} opps</span>
      </a>
    `;
  }).join('');
}

function renderSectorRankings(sectors) {
  if (!sectors || !sectors.length) return '<p class="text-muted">No data</p>';

  const sorted = [...sectors].sort((a, b) => (b.budget10Year || 0) - (a.budget10Year || 0));

  return sorted.map((sector, index) => {
    const positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
    return `
      <div class="ranking-item">
        <span class="ranking-position ${positionClass}">${index + 1}</span>
        <span class="ranking-name">${sector.name}</span>
        <span class="ranking-value">${formatCurrency(sector.budget10Year || 0)}</span>
      </div>
    `;
  }).join('');
}

function renderRegionRankings(regions) {
  if (!regions || !regions.length) return '<p class="text-muted">No data</p>';

  const sorted = [...regions].sort((a, b) => (b.budget10Year || 0) - (a.budget10Year || 0)).slice(0, 8);

  return sorted.map((region, index) => {
    const positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
    return `
      <div class="ranking-item">
        <span class="ranking-position ${positionClass}">${index + 1}</span>
        <span class="ranking-name">${region.name}</span>
        <span class="ranking-value">${formatCurrency(region.budget10Year || 0)}</span>
      </div>
    `;
  }).join('');
}

function renderClientList(clients, opportunities) {
  if (!clients || !clients.length) {
    return '<p class="text-muted">No clients match the current filters</p>';
  }

  const sorted = [...clients].sort((a, b) => (b.budget10Year || 0) - (a.budget10Year || 0));

  return sorted.slice(0, 20).map(client => {
    // Find linked opportunities for this client
    const linkedOpps = (opportunities || []).filter(o => o.client === client.id);
    const inProcurement = linkedOpps.filter(o => o.status === 'procurement').length;
    const totalOpps = linkedOpps.length;

    return `
      <div class="client-item">
        <div>
          <div class="client-name">${client.name}</div>
          <div class="client-sector">${client.sector || 'Unknown'} | ${(client.regions || []).join(', ')}</div>
          ${totalOpps > 0 ? `
            <div class="client-procurements">
              ${inProcurement > 0 ? `<span class="badge" style="background: #F59E0B20; color: #F59E0B; border-color: #F59E0B">${inProcurement} in procurement</span>` : ''}
              ${totalOpps > inProcurement ? `<span class="badge">${totalOpps - inProcurement} pipeline</span>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="client-budget">${formatCurrency(client.budget2026 || 0)}</div>
        <div class="client-budget">${formatCurrency(client.budget10Year || 0)}</div>
      </div>
    `;
  }).join('');
}
