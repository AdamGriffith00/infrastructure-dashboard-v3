/**
 * Data Sources View
 * Lists all data sources used in the dashboard with citations and links
 * Dynamically pulls from clients, scanner opportunities, and pipeline data
 */

import { formatCurrency } from '../utils/formatters.js';
import { SOURCE_LINKS } from '../components/data-info.js';

// Scanner region files mapping
const SCANNER_REGION_FILES = [
  { file: 'london-south-east', regions: ['london', 'south-east'] },
  { file: 'north-west', regions: ['north-west'] },
  { file: 'north-east', regions: ['north-east'] },
  { file: 'yorkshire-humber', regions: ['yorkshire-humber'] },
  { file: 'midlands', regions: ['midlands'] },
  { file: 'east-midlands', regions: ['east-midlands'] },
  { file: 'eastern', regions: ['eastern'] },
  { file: 'south-west', regions: ['south-west'] },
  { file: 'scotland', regions: ['scotland'] },
  { file: 'wales', regions: ['wales'] },
  { file: 'northern-ireland', regions: ['northern-ireland'] }
];

export async function renderSourcesView(container, { data, allData }) {
  const clients = allData.clients || [];
  const opportunities = allData.opportunities || [];
  const sectors = allData.sectors || [];
  const regions = allData.regions || [];

  // Build sector/region name lookups
  const sectorNames = {};
  sectors.forEach(s => { sectorNames[s.id] = s.name; });
  const regionNames = {};
  regions.forEach(r => { regionNames[r.id] = r.name; });

  // Group clients by sector
  const sourcesBySector = {};
  clients.forEach(client => {
    const sector = client.sector || 'other';
    if (!sourcesBySector[sector]) sourcesBySector[sector] = [];
    sourcesBySector[sector].push({
      name: client.name,
      source: client.source || 'Company reports',
      budget10Year: client.budget10Year || 0,
      subSector: client.subSector || null
    });
  });

  const sectorOrder = Object.keys(sourcesBySector).sort((a, b) => {
    const totalA = sourcesBySector[a].reduce((sum, c) => sum + c.budget10Year, 0);
    const totalB = sourcesBySector[b].reduce((sum, c) => sum + c.budget10Year, 0);
    return totalB - totalA;
  });

  // Use canonical source links from data-info component
  const sourceLinks = SOURCE_LINKS;

  // Load all scanner data
  const scannerByRegion = {};
  let totalScannerOpps = 0;
  let totalScannerValue = 0;

  await Promise.all(SCANNER_REGION_FILES.map(async ({ file, regions: regionIds }) => {
    try {
      const resp = await fetch(`data/regional-opportunities/${file}.json`);
      if (!resp.ok) return;
      const data = await resp.json();
      const opps = data.opportunities || [];
      // Split by region
      for (const regionId of regionIds) {
        const regionOpps = opps.filter(o => o.region === regionId);
        scannerByRegion[regionId] = regionOpps;
        totalScannerOpps += regionOpps.length;
        totalScannerValue += regionOpps.reduce((sum, o) => sum + (o.value || 0), 0);
      }
    } catch (e) { /* skip missing files */ }
  }));

  // Pipeline stats
  const pipelineValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const pipelineByStatus = {};
  opportunities.forEach(o => {
    const status = o.status || 'unknown';
    if (!pipelineByStatus[status]) pipelineByStatus[status] = { count: 0, value: 0 };
    pipelineByStatus[status].count++;
    pipelineByStatus[status].value += o.value || 0;
  });

  const statusLabels = {
    'planning': 'Planning',
    'pre-procurement': 'Pre-Procurement',
    'procurement': 'In Procurement',
    'delivery': 'In Delivery',
    'complete': 'Complete'
  };
  const statusColors = {
    'planning': '#6B7280',
    'pre-procurement': '#8B5CF6',
    'procurement': '#F59E0B',
    'delivery': '#10B981',
    'complete': '#3B82F6'
  };

  // Totals
  const totalClientBudget = clients.reduce((sum, c) => sum + (c.budget10Year || 0), 0);
  const totalDataPoints = clients.length + totalScannerOpps + opportunities.length;
  const dataFiles = 3 + Object.keys(scannerByRegion).length; // clients + opps + sectors + scanner files
  const lastUpdated = allData.lastUpdated || '2026-01-17';

  // Build dynamic primary sources from client source fields
  const primarySources = {};
  clients.forEach(c => {
    const src = c.source || 'Company reports';
    if (!primarySources[src]) primarySources[src] = { clients: [], totalBudget: 0 };
    primarySources[src].clients.push(c.name);
    primarySources[src].totalBudget += c.budget10Year || 0;
  });
  const sortedPrimarySources = Object.entries(primarySources)
    .sort((a, b) => b[1].totalBudget - a[1].totalBudget);

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Data Sources</h1>
      <p class="view-subtitle">All data sources used in this dashboard with citations and methodology</p>
    </div>

    <!-- Overview KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Data Points</div>
          <div class="kpi-value">${totalDataPoints.toLocaleString()}</div>
          <div class="kpi-note">${clients.length} clients + ${totalScannerOpps} scanner + ${opportunities.length} pipeline</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Pipeline Value</div>
          <div class="kpi-value">${formatCurrency(totalClientBudget + totalScannerValue)}</div>
          <div class="kpi-note">Clients + scanner opportunities</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Data Files</div>
          <div class="kpi-value">${dataFiles}</div>
          <div class="kpi-note">JSON data sources</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Last Updated</div>
          <div class="kpi-value">${formatDate(lastUpdated)}</div>
          <div class="kpi-note">Data refresh date</div>
        </div>
      </div>
    </section>

    <!-- Methodology -->
    <section class="section">
      <h2 class="section-title">Methodology</h2>
      <div class="card">
        <div class="methodology-content">
          <div class="methodology-item">
            <h4>10-Year Budget</h4>
            <p>Investment pipeline figures represent confirmed or planned capital expenditure over the next 10 years, sourced from regulatory determinations, published business plans, and official investment announcements.</p>
          </div>
          <div class="methodology-item">
            <h4>2026 Spend</h4>
            <p>Annual spend figures are derived from published annual budgets or calculated as 1/5th of 5-year regulatory periods (e.g., AMP8 for water, CP7 for rail).</p>
          </div>
          <div class="methodology-item">
            <h4>Regional Attribution</h4>
            <p>Investment is attributed to regions based on client operating areas. National clients (e.g., National Highways) are broken down by regional operating units where data is available.</p>
          </div>
          <div class="methodology-item">
            <h4>Data Currency</h4>
            <p>All figures are in current prices (nominal) unless otherwise stated. Water sector figures are based on Ofwat PR24 Final Determination (December 2024).</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Scanner Opportunities by Region -->
    <section class="section">
      <h2 class="section-title">Scanner Opportunities by Region</h2>
      <p class="text-muted mb-md">${totalScannerOpps.toLocaleString()} scanned projects worth ${formatCurrency(totalScannerValue)} across ${Object.keys(scannerByRegion).length} regions</p>
      <div class="scanner-region-grid">
        ${Object.entries(scannerByRegion)
          .sort((a, b) => b[1].reduce((s, o) => s + (o.value || 0), 0) - a[1].reduce((s, o) => s + (o.value || 0), 0))
          .map(([regionId, opps]) => {
            const regionValue = opps.reduce((sum, o) => sum + (o.value || 0), 0);
            const regionSectors = new Set(opps.map(o => o.sector).filter(Boolean));
            return `
              <div class="scanner-region-card card">
                <h4>${regionNames[regionId] || capitalise(regionId)}</h4>
                <div class="scanner-region-stats">
                  <span><strong>${opps.length}</strong> projects</span>
                  <span><strong>${formatCurrency(regionValue)}</strong></span>
                </div>
                <div class="scanner-region-stats" style="margin-top: 4px;">
                  <span>${regionSectors.size} sectors</span>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    </section>

    <!-- Pipeline Opportunities -->
    <section class="section">
      <h2 class="section-title">Pipeline Opportunities</h2>
      <p class="text-muted mb-md">${opportunities.length} tracked opportunities worth ${formatCurrency(pipelineValue)}</p>
      <div class="pipeline-status-grid">
        ${Object.entries(pipelineByStatus)
          .sort((a, b) => (statusLabels[a[0]] ? Object.keys(statusLabels).indexOf(a[0]) : 99) - (statusLabels[b[0]] ? Object.keys(statusLabels).indexOf(b[0]) : 99))
          .map(([status, data]) => `
            <div class="pipeline-status-item" style="border-left: 3px solid ${statusColors[status] || '#6B7280'}">
              <div class="status-count">${data.count}</div>
              <div class="status-label">${statusLabels[status] || capitalise(status)}</div>
              <div class="text-muted" style="font-size: 0.8rem; margin-top: 2px;">${formatCurrency(data.value)}</div>
            </div>
          `).join('')}
      </div>
    </section>

    <!-- Sources by Sector -->
    <section class="section">
      <h2 class="section-title">Sources by Sector</h2>
      <div class="sources-list">
        ${sectorOrder.map(sectorId => {
          const sectorClients = sourcesBySector[sectorId];
          const sectorName = sectorNames[sectorId] || capitalise(sectorId);
          const sectorTotal = sectorClients.reduce((sum, c) => sum + c.budget10Year, 0);

          const bySource = {};
          sectorClients.forEach(c => {
            const src = c.source;
            if (!bySource[src]) bySource[src] = { clients: [], total: 0 };
            bySource[src].clients.push(c.name);
            bySource[src].total += c.budget10Year;
          });

          return `
            <div class="source-sector-card card">
              <div class="source-sector-header">
                <div class="source-sector-indicator sector-indicator ${sectorId}"></div>
                <h3 class="source-sector-name">${sectorName}</h3>
                <span class="source-sector-total">${formatCurrency(sectorTotal)}</span>
              </div>
              <div class="source-sector-body">
                ${Object.entries(bySource).map(([source, srcData]) => {
                  const link = sourceLinks[source];
                  return `
                    <div class="source-item">
                      <div class="source-name">
                        ${link ? `<a href="${link}" target="_blank" rel="noopener">${source} ↗</a>` : source}
                      </div>
                      <div class="source-clients">${srcData.clients.join(', ')}</div>
                      <div class="source-value">${formatCurrency(srcData.total)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Primary Data Sources (dynamic) -->
    <section class="section">
      <h2 class="section-title">Primary Data Sources</h2>
      <p class="text-muted mb-md">${sortedPrimarySources.length} unique sources extracted from client data</p>
      <div class="dynamic-sources-grid">
        ${sortedPrimarySources.map(([sourceName, srcData]) => {
          const link = sourceLinks[sourceName];
          return `
            <div class="dynamic-source-card card${link ? ' card-clickable' : ''}" ${link ? `onclick="window.open('${link}', '_blank')"` : ''}>
              <h4>${sourceName}</h4>
              <div class="source-card-meta">${srcData.clients.length} client${srcData.clients.length !== 1 ? 's' : ''}</div>
              <div class="source-card-value">${formatCurrency(srcData.totalBudget)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="section">
      <div class="card disclaimer-card">
        <h4>Data Disclaimer</h4>
        <p>This dashboard aggregates publicly available data from official sources. While every effort is made to ensure accuracy, figures should be verified against primary sources for business-critical decisions. Investment pipelines are subject to change based on policy decisions, market conditions, and project progress. Last comprehensive update: ${formatDate(lastUpdated)}.</p>
      </div>
    </section>
  `;

  // No info popup needed — this page IS the data sources reference
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

export default { renderSourcesView };
