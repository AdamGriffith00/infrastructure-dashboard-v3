/**
 * Overall Dashboard View
 */

import { formatCurrency, formatNumber, getSectorColor } from '../utils/formatters.js';

export function renderOverallView(container, { data, allData, filters }) {
  // Calculate totals
  const totalBudget10Year = calculateTotalBudget(allData.clients, 'budget10Year');
  const totalBudget2026 = calculateTotalBudget(allData.clients, 'budget2026');
  const totalOpportunities = allData.opportunities?.length || 0;
  const totalClients = allData.clients?.length || 0;

  // Get filtered counts if filters are active
  const filteredOpportunities = data.opportunities?.length || 0;
  const filteredClients = data.clients?.length || 0;

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">UK Infrastructure Market Overview</h1>
      <p class="view-subtitle">Addressable market analysis for strategic planning</p>
    </div>

    <!-- KPI Summary -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Key Metrics</h2>
        ${data.isFiltered ? '<span class="badge badge-yellow">Filtered</span>' : ''}
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">10-Year Investment Pipeline</div>
          <div class="kpi-value">${formatCurrency(totalBudget10Year)}</div>
          <div class="kpi-note">Total addressable market</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">2026 Spend</div>
          <div class="kpi-value">${formatCurrency(totalBudget2026)}</div>
          <div class="kpi-note">Annual investment</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Opportunities</div>
          <div class="kpi-value">${formatNumber(data.isFiltered ? filteredOpportunities : totalOpportunities)}</div>
          <div class="kpi-note">${data.isFiltered ? `of ${totalOpportunities} total` : 'Active pipeline'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Key Clients</div>
          <div class="kpi-value">${formatNumber(data.isFiltered ? filteredClients : totalClients)}</div>
          <div class="kpi-note">${data.isFiltered ? `of ${totalClients} total` : 'Major organisations'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Sectors</div>
          <div class="kpi-value">${allData.sectors?.length || 5}</div>
          <div class="kpi-note">Infrastructure sectors</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Regions</div>
          <div class="kpi-value">${allData.regions?.length || 12}</div>
          <div class="kpi-note">UK regions covered</div>
        </div>
      </div>
    </section>

    <!-- Sectors Overview -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Sectors</h2>
        <a href="#sectors" class="btn">View All Sectors</a>
      </div>
      <div class="sector-grid">
        ${renderSectorCards(allData.sectors, allData.opportunities)}
      </div>
    </section>

    <!-- Top Regions -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Top Regions by Investment</h2>
        <a href="#regions" class="btn">Explore All Regions</a>
      </div>
      <div class="budget-rankings">
        ${renderTopRegions(allData.regions, 8)}
      </div>
    </section>

    <!-- Pipeline Quick Stats -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Pipeline Overview</h2>
        <a href="#pipeline" class="btn">View Pipeline</a>
      </div>
      <div class="kpi-grid">
        ${renderPipelineStats(allData.opportunities)}
      </div>
    </section>

    <!-- Recent Opportunities -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">High-Priority Opportunities</h2>
        <a href="#pipeline" class="btn">View All</a>
      </div>
      <div class="opportunity-list">
        ${renderTopOpportunities(data.opportunities, 5)}
      </div>
    </section>
  `;
}

function calculateTotalBudget(clients, key) {
  if (!clients || !clients.length) return 0;
  return clients.reduce((sum, client) => sum + (client[key] || 0), 0);
}

function renderSectorCards(sectors, opportunities) {
  if (!sectors || !sectors.length) {
    return '<p class="text-muted">No sector data available</p>';
  }

  return sectors.map(sector => {
    const sectorOpps = opportunities?.filter(o => o.sector === sector.id) || [];
    const color = getSectorColor(sector.id);

    return `
      <a href="#sectors/${sector.id}" class="card card-clickable sector-card" data-sector="${sector.id}">
        <div class="card-title">${sector.name}</div>
        <div class="sector-metrics">
          <span class="badge">${formatCurrency(sector.budget10Year || 0)}</span>
          <span class="badge">${sectorOpps.length} opps</span>
        </div>
      </a>
    `;
  }).join('');
}

function renderTopRegions(regions, limit = 5) {
  if (!regions || !regions.length) {
    return '<p class="text-muted">No region data available</p>';
  }

  const sorted = [...regions]
    .sort((a, b) => (b.budget10Year || 0) - (a.budget10Year || 0))
    .slice(0, limit);

  const maxBudget = sorted[0]?.budget10Year || 1;

  return sorted.map((region, index) => {
    const positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'other';
    const percentage = ((region.budget10Year || 0) / maxBudget * 100).toFixed(0);

    return `
      <a href="#regions/${region.id}" class="ranking-item-bar">
        <span class="ranking-position ${positionClass}">${index + 1}</span>
        <div class="ranking-content">
          <div class="ranking-header">
            <span class="ranking-name">${region.name}</span>
            <span class="ranking-value">${formatCurrency(region.budget10Year || 0)}</span>
          </div>
          <div class="ranking-bar">
            <div class="ranking-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function renderTopOpportunities(opportunities, limit = 5) {
  if (!opportunities || !opportunities.length) {
    return '<p class="text-muted">No opportunities match the current filters</p>';
  }

  // Sort by value and get high priority
  const topOpps = [...opportunities]
    .filter(o => o.bidRating === 'high' || o.bidRating === 'High')
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, limit);

  if (!topOpps.length) {
    // Fall back to any opportunities
    return [...opportunities]
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, limit)
      .map(renderOpportunityCard)
      .join('');
  }

  return topOpps.map(renderOpportunityCard).join('');
}

// Status color config
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

function renderPipelineStats(opportunities) {
  if (!opportunities || !opportunities.length) {
    return '<p class="text-muted">No opportunity data available</p>';
  }

  const inProcurement = opportunities.filter(o => o.status === 'procurement');
  const preProcurement = opportunities.filter(o => o.status === 'pre-procurement');
  const planning = opportunities.filter(o => o.status === 'planning');
  const inDelivery = opportunities.filter(o => o.status === 'delivery');

  const upcomingDeadlines = opportunities.filter(o => {
    if (!o.bidDeadline) return false;
    const deadline = new Date(o.bidDeadline);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return deadline >= now && deadline <= thirtyDays;
  });

  const procurementValue = inProcurement.reduce((sum, o) => sum + (o.value || 0), 0);

  return `
    <div class="kpi-card">
      <div class="kpi-label">In Procurement</div>
      <div class="kpi-value" style="color: #F59E0B">${inProcurement.length}</div>
      <div class="kpi-note">${formatCurrency(procurementValue)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Pre-Procurement</div>
      <div class="kpi-value" style="color: #8B5CF6">${preProcurement.length}</div>
      <div class="kpi-note">Preparing to bid</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">In Planning</div>
      <div class="kpi-value" style="color: #6B7280">${planning.length}</div>
      <div class="kpi-note">Future pipeline</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Upcoming Deadlines</div>
      <div class="kpi-value" style="color: #EF4444">${upcomingDeadlines.length}</div>
      <div class="kpi-note">Next 30 days</div>
    </div>
  `;
}

function renderOpportunityCard(opp) {
  const ratingClass = (opp.bidRating || '').toLowerCase() === 'high' ? 'badge-high' :
                      (opp.bidRating || '').toLowerCase() === 'medium' ? 'badge-medium' : 'badge-low';

  const statusColor = STATUS_COLORS[opp.status] || '#888888';
  const statusLabel = STATUS_LABELS[opp.status] || opp.status || 'Unknown';

  // Format deadline if available
  const deadlineText = opp.bidDeadline
    ? `Due: ${new Date(opp.bidDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : '';

  return `
    <div class="card opportunity-card">
      <div class="opportunity-header">
        <div>
          <div class="opportunity-title">${opp.title}</div>
          <div class="opportunity-client">${opp.client || 'Client TBC'}</div>
        </div>
        <span class="badge ${ratingClass}">${opp.bidRating || 'TBC'}</span>
      </div>
      <div class="opportunity-meta">
        <span class="badge" style="background: ${statusColor}20; color: ${statusColor}; border-color: ${statusColor}">${statusLabel}</span>
        ${opp.procurementStage ? `<span class="badge">${opp.procurementStage}</span>` : ''}
        <span class="badge">${opp.sector || 'Unknown'}</span>
        <span class="opportunity-value">${formatCurrency(opp.value)}</span>
      </div>
      ${deadlineText ? `<div class="opportunity-deadline">${deadlineText}</div>` : ''}
    </div>
  `;
}
