/**
 * Data Sources View
 * Lists all data sources used in the dashboard with citations and links
 */

import { formatCurrency } from '../utils/formatters.js';

export function renderSourcesView(container, { data, allData }) {
  // Group clients by sector and extract sources
  const sourcesBySector = {};
  const sectorNames = {};

  // Build sector name lookup
  (allData.sectors || []).forEach(sector => {
    sectorNames[sector.id] = sector.name;
  });

  // Group clients by sector
  (allData.clients || []).forEach(client => {
    const sector = client.sector || 'other';
    if (!sourcesBySector[sector]) {
      sourcesBySector[sector] = [];
    }
    sourcesBySector[sector].push({
      name: client.name,
      source: client.source || 'Company reports',
      budget10Year: client.budget10Year || 0,
      subSector: client.subSector || null
    });
  });

  // Sort sectors by total budget
  const sectorOrder = Object.keys(sourcesBySector).sort((a, b) => {
    const totalA = sourcesBySector[a].reduce((sum, c) => sum + c.budget10Year, 0);
    const totalB = sourcesBySector[b].reduce((sum, c) => sum + c.budget10Year, 0);
    return totalB - totalA;
  });

  // Define source links where available
  const sourceLinks = {
    'Ofwat PR24 Final Determination Dec 2024': 'https://www.ofwat.gov.uk/regulated-companies/price-review/2024-price-review/final-determinations/',
    'Network Rail CP7 Delivery Plan': 'https://www.networkrail.co.uk/who-we-are/publications-and-resources/our-delivery-plan-for-2024-2029/',
    'TfL Business Plan 2024/25': 'https://tfl.gov.uk/corporate/publications-and-reports/business-plan',
    'National Highways RIS3 Programme': 'https://nationalhighways.co.uk/our-roads/our-road-investment-strategy/',
    'Transport Scotland STPR2': 'https://www.transport.gov.scot/our-approach/strategy/strategic-transport-projects-review-2/',
    'Heathrow 2.0 Masterplan': 'https://www.heathrow.com/company/about-heathrow/expansion',
    'Gatwick Airport Masterplan 2024': 'https://www.gatwickairport.com/business-community/future-plans/',
  };

  // Calculate totals
  const totalClients = allData.clients?.length || 0;
  const totalBudget = (allData.clients || []).reduce((sum, c) => sum + (c.budget10Year || 0), 0);
  const lastUpdated = allData.lastUpdated || '2026-01-17';

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Data Sources</h1>
      <p class="view-subtitle">All data sources used in this dashboard with citations and methodology</p>
    </div>

    <!-- Overview -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Data Points</div>
          <div class="kpi-value">${totalClients}</div>
          <div class="kpi-note">Clients & organisations</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Pipeline Value</div>
          <div class="kpi-value">${formatCurrency(totalBudget)}</div>
          <div class="kpi-note">10-year investment</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Last Updated</div>
          <div class="kpi-value">${formatDate(lastUpdated)}</div>
          <div class="kpi-note">Data refresh date</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sectors Covered</div>
          <div class="kpi-value">${sectorOrder.length}</div>
          <div class="kpi-note">Infrastructure sectors</div>
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

    <!-- Sources by Sector -->
    <section class="section">
      <h2 class="section-title">Sources by Sector</h2>
      <div class="sources-list">
        ${sectorOrder.map(sectorId => {
          const clients = sourcesBySector[sectorId];
          const sectorName = sectorNames[sectorId] || capitalise(sectorId);
          const sectorTotal = clients.reduce((sum, c) => sum + c.budget10Year, 0);

          // Group by source
          const bySource = {};
          clients.forEach(c => {
            const src = c.source;
            if (!bySource[src]) {
              bySource[src] = { clients: [], total: 0 };
            }
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
                ${Object.entries(bySource).map(([source, data]) => {
                  const link = sourceLinks[source];
                  return `
                    <div class="source-item">
                      <div class="source-name">
                        ${link ? `<a href="${link}" target="_blank" rel="noopener">${source} ↗</a>` : source}
                      </div>
                      <div class="source-clients">${data.clients.join(', ')}</div>
                      <div class="source-value">${formatCurrency(data.total)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Key Sources Summary -->
    <section class="section">
      <h2 class="section-title">Primary Data Sources</h2>
      <div class="key-sources-grid">
        <a href="https://www.ofwat.gov.uk/regulated-companies/price-review/2024-price-review/" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">Ofwat</div>
          <div class="key-source-desc">Water sector regulator - PR24 Final Determinations for AMP8 (2025-2030)</div>
          <div class="key-source-sector">Utilities (Water)</div>
        </a>
        <a href="https://www.networkrail.co.uk/" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">Network Rail</div>
          <div class="key-source-desc">CP7 Control Period delivery plans and regional strategic plans</div>
          <div class="key-source-sector">Rail</div>
        </a>
        <a href="https://nationalhighways.co.uk/" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">National Highways</div>
          <div class="key-source-desc">Road Investment Strategy 3 (RIS3) programme and regional schemes</div>
          <div class="key-source-sector">Highways</div>
        </a>
        <a href="https://www.gov.uk/government/organisations/department-for-transport" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">Department for Transport</div>
          <div class="key-source-desc">CRSTS settlements, aviation policy, rail funding</div>
          <div class="key-source-sector">Multiple</div>
        </a>
        <a href="https://www.caa.co.uk/" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">CAA / Airport Operators</div>
          <div class="key-source-desc">Airport masterplans, DCO applications, capital programmes</div>
          <div class="key-source-sector">Aviation</div>
        </a>
        <a href="https://www.britishports.org.uk/" target="_blank" rel="noopener" class="key-source-card card card-clickable">
          <div class="key-source-name">Port Operators</div>
          <div class="key-source-desc">Published investment plans, freeport programmes</div>
          <div class="key-source-sector">Maritime</div>
        </a>
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
