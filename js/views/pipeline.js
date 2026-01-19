/**
 * Pipeline/Timeline View
 * Visualizes opportunities by status, procurement stage, and timeline
 */

import { formatCurrency, formatDate, getSectorColor } from '../utils/formatters.js';

// Status definitions with colors and order
const STATUS_CONFIG = {
  'planning': { label: 'Planning', color: '#6B7280', order: 1 },
  'pre-procurement': { label: 'Pre-Procurement', color: '#8B5CF6', order: 2 },
  'procurement': { label: 'In Procurement', color: '#F59E0B', order: 3 },
  'delivery': { label: 'In Delivery', color: '#10B981', order: 4 },
  'complete': { label: 'Complete', color: '#3B82F6', order: 5 }
};

// Procurement stage definitions
const STAGE_CONFIG = {
  'Pipeline': { color: '#6B7280', order: 1 },
  'Market Engagement': { color: '#8B5CF6', order: 2 },
  'PIN Issued': { color: '#A78BFA', order: 3 },
  'Expression of Interest': { color: '#C4B5FD', order: 4 },
  'PQQ Preparation': { color: '#DDD6FE', order: 5 },
  'PQQ': { color: '#F59E0B', order: 6 },
  'ITT': { color: '#FBBF24', order: 7 },
  'Dialogue': { color: '#FCD34D', order: 8 },
  'Evaluation': { color: '#FDE68A', order: 9 },
  'Awarded': { color: '#10B981', order: 10 }
};

export function renderPipelineView(container, { data, allData, filters }) {
  const opportunities = allData.opportunities || [];

  // Group opportunities by status
  const byStatus = groupByStatus(opportunities);

  // Calculate stats
  const stats = calculatePipelineStats(opportunities);

  // Get upcoming deadlines (next 30 days)
  const upcomingDeadlines = getUpcomingDeadlines(opportunities);

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Pipeline & Timeline</h1>
      <p class="view-subtitle">Track opportunities through procurement stages and delivery timeline</p>
    </div>

    <!-- Pipeline KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Pipeline Value</div>
          <div class="kpi-value">${formatCurrency(stats.totalValue)}</div>
          <div class="kpi-note">${opportunities.length} opportunities</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">In Procurement</div>
          <div class="kpi-value">${formatCurrency(stats.inProcurement)}</div>
          <div class="kpi-note">${stats.inProcurementCount} active bids</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">High Priority</div>
          <div class="kpi-value">${stats.highPriorityCount}</div>
          <div class="kpi-note">${formatCurrency(stats.highPriorityValue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Upcoming Deadlines</div>
          <div class="kpi-value">${upcomingDeadlines.length}</div>
          <div class="kpi-note">Next 30 days</div>
        </div>
      </div>
    </section>

    <!-- Upcoming Deadlines Alert -->
    ${upcomingDeadlines.length > 0 ? `
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Upcoming Deadlines</h2>
        </div>
        <div class="deadline-list">
          ${renderDeadlines(upcomingDeadlines)}
        </div>
      </section>
    ` : ''}

    <!-- Pipeline Funnel -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Pipeline by Status</h2>
      </div>
      <div class="pipeline-funnel">
        ${renderPipelineFunnel(byStatus)}
      </div>
    </section>

    <!-- Timeline View -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Contract Timeline</h2>
        <div class="btn-group">
          <button class="btn btn-active" id="btn-timeline-all">All</button>
          <button class="btn" id="btn-timeline-2026">2026</button>
          <button class="btn" id="btn-timeline-2027">2027+</button>
        </div>
      </div>
      <div class="timeline-container" id="timeline-container">
        ${renderTimeline(opportunities, 'all')}
      </div>
    </section>

    <!-- Procurement Stage Breakdown -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Procurement Stage Breakdown</h2>
      </div>
      <div class="stage-grid">
        ${renderStageBreakdown(opportunities)}
      </div>
    </section>

    <!-- Detailed Opportunity List -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">All Opportunities</h2>
        <div class="pipeline-filters">
          <select id="filter-status" class="input" style="width: auto;">
            <option value="all">All Statuses</option>
            ${Object.entries(STATUS_CONFIG).map(([id, cfg]) =>
              `<option value="${id}">${cfg.label}</option>`
            ).join('')}
          </select>
          <select id="filter-sector" class="input" style="width: auto;">
            <option value="all">All Sectors</option>
            ${(allData.sectors || []).map(s =>
              `<option value="${s.id}">${s.name}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="opportunity-table" id="opportunity-table">
        ${renderOpportunityTable(opportunities)}
      </div>
    </section>
  `;

  // Add event listeners
  setupEventListeners(container, opportunities, allData);
}

function groupByStatus(opportunities) {
  const groups = {};
  Object.keys(STATUS_CONFIG).forEach(status => {
    groups[status] = opportunities.filter(o => o.status === status);
  });
  return groups;
}

function calculatePipelineStats(opportunities) {
  const totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);

  const inProcurementOpps = opportunities.filter(o => o.status === 'procurement');
  const inProcurement = inProcurementOpps.reduce((sum, o) => sum + (o.value || 0), 0);

  const highPriorityOpps = opportunities.filter(o =>
    (o.bidRating || '').toLowerCase() === 'high'
  );
  const highPriorityValue = highPriorityOpps.reduce((sum, o) => sum + (o.value || 0), 0);

  return {
    totalValue,
    inProcurement,
    inProcurementCount: inProcurementOpps.length,
    highPriorityCount: highPriorityOpps.length,
    highPriorityValue
  };
}

function getUpcomingDeadlines(opportunities) {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return opportunities
    .filter(o => {
      if (!o.bidDeadline) return false;
      const deadline = new Date(o.bidDeadline);
      return deadline >= now && deadline <= thirtyDaysLater;
    })
    .sort((a, b) => new Date(a.bidDeadline) - new Date(b.bidDeadline));
}

function renderDeadlines(deadlines) {
  return deadlines.map(opp => {
    const deadline = new Date(opp.bidDeadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const urgencyClass = daysUntil <= 7 ? 'urgent' : daysUntil <= 14 ? 'warning' : '';

    return `
      <div class="deadline-item ${urgencyClass}">
        <div class="deadline-date">
          <div class="deadline-day">${deadline.getDate()}</div>
          <div class="deadline-month">${deadline.toLocaleString('en-GB', { month: 'short' })}</div>
        </div>
        <div class="deadline-content">
          <div class="deadline-title">${opp.title}</div>
          <div class="deadline-meta">
            <span class="badge" style="background: ${getSectorColor(opp.sector)}20; color: ${getSectorColor(opp.sector)}; border-color: ${getSectorColor(opp.sector)}">${opp.sector}</span>
            <span>${opp.procurementStage}</span>
            <span class="deadline-value">${formatCurrency(opp.value)}</span>
          </div>
        </div>
        <div class="deadline-countdown ${urgencyClass}">
          ${daysUntil} day${daysUntil !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderPipelineFunnel(byStatus) {
  const statusOrder = Object.entries(STATUS_CONFIG)
    .sort((a, b) => a[1].order - b[1].order);

  const maxValue = Math.max(...Object.values(byStatus).map(arr =>
    arr.reduce((sum, o) => sum + (o.value || 0), 0)
  ));

  return statusOrder.map(([statusId, config]) => {
    const opps = byStatus[statusId] || [];
    const value = opps.reduce((sum, o) => sum + (o.value || 0), 0);
    const widthPercent = maxValue > 0 ? (value / maxValue * 100) : 0;

    return `
      <div class="funnel-stage">
        <div class="funnel-label">
          <span class="funnel-status" style="color: ${config.color}">${config.label}</span>
          <span class="funnel-count">${opps.length} opportunities</span>
        </div>
        <div class="funnel-bar-container">
          <div class="funnel-bar" style="width: ${Math.max(widthPercent, 5)}%; background: ${config.color}">
            <span class="funnel-value">${formatCurrency(value)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTimeline(opportunities, filter) {
  // Filter opportunities with contract dates
  let filtered = opportunities.filter(o => o.contractStart);

  if (filter === '2026') {
    filtered = filtered.filter(o => o.contractStart?.startsWith('2026'));
  } else if (filter === '2027') {
    filtered = filtered.filter(o => {
      const year = parseInt(o.contractStart?.split('-')[0] || '0');
      return year >= 2027;
    });
  }

  // Sort by contract start
  filtered.sort((a, b) => (a.contractStart || '').localeCompare(b.contractStart || ''));

  if (filtered.length === 0) {
    return '<p class="text-muted">No opportunities with contract dates in this period</p>';
  }

  // Group by quarter
  const byQuarter = {};
  filtered.forEach(opp => {
    const date = new Date(opp.contractStart + '-01');
    const quarter = `${date.getFullYear()} Q${Math.ceil((date.getMonth() + 1) / 3)}`;
    if (!byQuarter[quarter]) byQuarter[quarter] = [];
    byQuarter[quarter].push(opp);
  });

  return Object.entries(byQuarter).map(([quarter, opps]) => `
    <div class="timeline-quarter">
      <div class="timeline-quarter-header">${quarter}</div>
      <div class="timeline-items">
        ${opps.map(opp => {
          const statusConfig = STATUS_CONFIG[opp.status] || { color: '#888', label: opp.status };
          return `
            <div class="timeline-item">
              <div class="timeline-marker" style="background: ${statusConfig.color}"></div>
              <div class="timeline-card">
                <div class="timeline-card-header">
                  <span class="timeline-title">${opp.title}</span>
                  <span class="badge" style="background: ${statusConfig.color}20; color: ${statusConfig.color}; border-color: ${statusConfig.color}">${statusConfig.label}</span>
                </div>
                <div class="timeline-card-meta">
                  <span>${opp.contractStart} → ${opp.contractEnd || 'TBC'}</span>
                  <span>${opp.contractDuration ? `${opp.contractDuration} months` : ''}</span>
                </div>
                <div class="timeline-card-footer">
                  <span class="badge" style="background: ${getSectorColor(opp.sector)}20; color: ${getSectorColor(opp.sector)}; border-color: ${getSectorColor(opp.sector)}">${opp.sector}</span>
                  <span class="timeline-value">${formatCurrency(opp.value)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function renderStageBreakdown(opportunities) {
  // Group by procurement stage
  const byStage = {};
  opportunities.forEach(opp => {
    const stage = opp.procurementStage || 'Unknown';
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(opp);
  });

  // Sort by stage order
  const sortedStages = Object.entries(byStage).sort((a, b) => {
    const orderA = STAGE_CONFIG[a[0]]?.order || 99;
    const orderB = STAGE_CONFIG[b[0]]?.order || 99;
    return orderA - orderB;
  });

  return sortedStages.map(([stage, opps]) => {
    const config = STAGE_CONFIG[stage] || { color: '#888888' };
    const value = opps.reduce((sum, o) => sum + (o.value || 0), 0);

    return `
      <div class="stage-card" style="border-left: 4px solid ${config.color}">
        <div class="stage-header">
          <span class="stage-name">${stage}</span>
          <span class="stage-count">${opps.length}</span>
        </div>
        <div class="stage-value">${formatCurrency(value)}</div>
        <div class="stage-opps">
          ${opps.slice(0, 3).map(o => `
            <div class="stage-opp-item">
              <span class="stage-opp-title">${o.title.length > 40 ? o.title.slice(0, 40) + '...' : o.title}</span>
              <span class="stage-opp-value">${formatCurrency(o.value)}</span>
            </div>
          `).join('')}
          ${opps.length > 3 ? `<div class="stage-more">+${opps.length - 3} more</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderOpportunityTable(opportunities, statusFilter = 'all', sectorFilter = 'all') {
  let filtered = [...opportunities];

  if (statusFilter !== 'all') {
    filtered = filtered.filter(o => o.status === statusFilter);
  }
  if (sectorFilter !== 'all') {
    filtered = filtered.filter(o => o.sector === sectorFilter);
  }

  // Sort by bid deadline, then by value
  filtered.sort((a, b) => {
    if (a.bidDeadline && b.bidDeadline) {
      return new Date(a.bidDeadline) - new Date(b.bidDeadline);
    }
    if (a.bidDeadline) return -1;
    if (b.bidDeadline) return 1;
    return (b.value || 0) - (a.value || 0);
  });

  if (filtered.length === 0) {
    return '<p class="text-muted">No opportunities match the selected filters</p>';
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Opportunity</th>
          <th>Status</th>
          <th>Stage</th>
          <th>Value</th>
          <th>Deadline</th>
          <th>Contract Start</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(opp => {
          const statusConfig = STATUS_CONFIG[opp.status] || { color: '#888', label: opp.status };
          const ratingClass = (opp.bidRating || '').toLowerCase() === 'high' ? 'badge-high' :
                              (opp.bidRating || '').toLowerCase() === 'medium' ? 'badge-medium' : 'badge-low';

          return `
            <tr>
              <td>
                <div class="table-title">${opp.title}</div>
                <div class="table-subtitle">${opp.sector} | ${opp.region}</div>
              </td>
              <td>
                <span class="status-badge" style="background: ${statusConfig.color}20; color: ${statusConfig.color}; border-color: ${statusConfig.color}">
                  ${statusConfig.label}
                </span>
              </td>
              <td>${opp.procurementStage || '-'}</td>
              <td class="text-right">${formatCurrency(opp.value)}</td>
              <td>${opp.bidDeadline ? formatDate(opp.bidDeadline) : '-'}</td>
              <td>${opp.contractStart || '-'}</td>
              <td><span class="badge ${ratingClass}">${opp.bidRating || 'TBC'}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function setupEventListeners(container, opportunities, allData) {
  // Timeline filter buttons
  const btnAll = container.querySelector('#btn-timeline-all');
  const btn2026 = container.querySelector('#btn-timeline-2026');
  const btn2027 = container.querySelector('#btn-timeline-2027');
  const timelineContainer = container.querySelector('#timeline-container');

  if (btnAll && btn2026 && btn2027 && timelineContainer) {
    btnAll.addEventListener('click', () => {
      btnAll.classList.add('btn-active');
      btn2026.classList.remove('btn-active');
      btn2027.classList.remove('btn-active');
      timelineContainer.innerHTML = renderTimeline(opportunities, 'all');
    });

    btn2026.addEventListener('click', () => {
      btn2026.classList.add('btn-active');
      btnAll.classList.remove('btn-active');
      btn2027.classList.remove('btn-active');
      timelineContainer.innerHTML = renderTimeline(opportunities, '2026');
    });

    btn2027.addEventListener('click', () => {
      btn2027.classList.add('btn-active');
      btnAll.classList.remove('btn-active');
      btn2026.classList.remove('btn-active');
      timelineContainer.innerHTML = renderTimeline(opportunities, '2027');
    });
  }

  // Table filters
  const filterStatus = container.querySelector('#filter-status');
  const filterSector = container.querySelector('#filter-sector');
  const tableContainer = container.querySelector('#opportunity-table');

  function updateTable() {
    const statusVal = filterStatus?.value || 'all';
    const sectorVal = filterSector?.value || 'all';
    tableContainer.innerHTML = renderOpportunityTable(opportunities, statusVal, sectorVal);
  }

  if (filterStatus) filterStatus.addEventListener('change', updateTable);
  if (filterSector) filterSector.addEventListener('change', updateTable);
}
