/**
 * Intelligence Dashboard View
 * AI-powered bid insights, win probability, and competitor analysis
 */

import { formatCurrency } from '../utils/formatters.js';
import {
  calculateBidScore,
  scoreAllOpportunities,
  getPipelineIntelligence,
  getSectorStrengths,
  getAllCompetitors
} from '../utils/intelligence.js';
import { openExplorer } from '../components/opportunity-explorer.js';
import { getInfoButtonHTML, setupInfoPopup } from '../components/data-info.js';

export function renderIntelligenceView(container, { data, allData, filters }) {
  const opportunities = allData.opportunities || [];
  const clients = allData.clients || [];

  // Get existing client names for relationship scoring
  const existingClients = clients.map(c => c.name);

  // Get intelligence analysis
  const intelligence = getPipelineIntelligence(opportunities, { existingClients });
  const sectorStrengths = getSectorStrengths();
  const competitors = getAllCompetitors();

  container.innerHTML = `
    <div class="view-header">
      <h1 class="view-title">Bid Intelligence ${getInfoButtonHTML()}</h1>
      <p class="view-subtitle">AI-powered insights, win probability analysis, and competitive positioning</p>
    </div>

    <!-- Intelligence Summary KPIs -->
    <section class="section">
      <div class="kpi-grid">
        <div class="kpi-card kpi-highlight-green">
          <div class="kpi-label">Strong Pursuits</div>
          <div class="kpi-value">${intelligence.summary.strongPursuits}</div>
          <div class="kpi-note">${formatCurrency(intelligence.totalValue.strongPursuits)}</div>
        </div>
        <div class="kpi-card kpi-highlight-yellow">
          <div class="kpi-label">Pursue</div>
          <div class="kpi-value">${intelligence.summary.pursuits}</div>
          <div class="kpi-note">${formatCurrency(intelligence.totalValue.pursuits)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Selective</div>
          <div class="kpi-value">${intelligence.summary.selective}</div>
          <div class="kpi-note">${formatCurrency(intelligence.totalValue.selective)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Win Probability</div>
          <div class="kpi-value">${intelligence.avgWinProbability.strongPursuits}%</div>
          <div class="kpi-note">Strong pursuits</div>
        </div>
      </div>
    </section>

    <!-- Top Opportunities -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Top Recommended Opportunities</h2>
      </div>
      <div class="intel-cards-grid">
        ${renderTopOpportunityCards(intelligence.topOpportunities)}
      </div>
    </section>

    <!-- Scored Pipeline -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Full Pipeline Intelligence</h2>
        <div class="intel-filters">
          <select id="intel-filter" class="input" style="width: auto;">
            <option value="all">All Opportunities</option>
            <option value="strong">Strong Pursuits (80+)</option>
            <option value="pursue">Pursue (65-79)</option>
            <option value="selective">Selective (50-64)</option>
            <option value="low">Low Priority (&lt;50)</option>
          </select>
        </div>
      </div>
      <div id="intel-table-container">
        ${renderIntelligenceTable(intelligence.opportunities)}
      </div>
    </section>

    <!-- Sector Strengths -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Sector Capabilities</h2>
      </div>
      <div class="sector-strength-grid">
        ${renderSectorStrengths(sectorStrengths)}
      </div>
    </section>

    <!-- Competitor Landscape -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Competitive Landscape</h2>
      </div>
      <div class="competitor-grid">
        ${renderCompetitorCards(competitors)}
      </div>
    </section>
  `;

  // Setup info popup
  setupInfoPopup(container, {
    title: 'Bid Intelligence',
    sources: [
      { name: 'Opportunities', file: 'opportunities.json', description: `pipeline opportunities scored for bid/no-bid`, count: opportunities.length },
      { name: 'Client Data', file: 'clients.json', description: `clients for relationship scoring`, count: clients.length }
    ],
    lastUpdated: allData.lastUpdated || '17 January 2026'
  });

  // Setup event listeners
  setupIntelligenceListeners(container, intelligence);
}

function renderTopOpportunityCards(opportunities) {
  if (!opportunities.length) {
    return '<p class="text-muted">No strong pursuit opportunities identified</p>';
  }

  return opportunities.map(opp => {
    const intel = opp.intelligence;
    const rec = intel.recommendation;

    return `
      <div class="intel-card">
        <div class="intel-card-header">
          <div class="intel-score-badge" style="background: ${rec.color}">
            ${intel.totalScore}
          </div>
          <div class="intel-card-title">
            <h3>${opp.title}</h3>
            <span class="intel-card-meta">${opp.sector} | ${opp.region}</span>
          </div>
        </div>

        <div class="intel-card-body">
          <div class="intel-metrics">
            <div class="intel-metric">
              <span class="intel-metric-label">Value</span>
              <span class="intel-metric-value">${formatCurrency(opp.value)}</span>
            </div>
            <div class="intel-metric">
              <span class="intel-metric-label">Win Probability</span>
              <span class="intel-metric-value">${intel.winProbability}%</span>
            </div>
          </div>

          <div class="intel-recommendation" style="border-color: ${rec.color}">
            <span class="intel-rec-label" style="color: ${rec.color}">${rec.label}</span>
            <p class="intel-rec-text">${rec.reasoning}</p>
          </div>

          <div class="intel-scores">
            ${renderScoreBar('Sector Fit', intel.scores.sectorFit)}
            ${renderScoreBar('Region Fit', intel.scores.regionFit)}
            ${renderScoreBar('Value Fit', intel.scores.valueFit)}
            ${renderScoreBar('Competition', intel.scores.competitionLevel)}
          </div>

          <div class="intel-insights">
            ${intel.strategicInsights.slice(0, 3).map(insight => `
              <div class="intel-insight ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: var(--space-md); text-align: right;">
            <button class="btn-explore" data-opp-id="${opp.id}">
              <span class="btn-explore-icon">🔍</span>
              Explore
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderScoreBar(label, score) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return `
    <div class="score-bar-item">
      <div class="score-bar-header">
        <span class="score-bar-label">${label}</span>
        <span class="score-bar-value">${score}</span>
      </div>
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${score}%; background: ${color}"></div>
      </div>
    </div>
  `;
}

function renderIntelligenceTable(opportunities) {
  if (!opportunities.length) {
    return '<p class="text-muted">No opportunities to display</p>';
  }

  return `
    <table class="sortable-table intel-table">
      <thead>
        <tr>
          <th>Score</th>
          <th>Opportunity</th>
          <th>Value</th>
          <th>Win Prob</th>
          <th>Recommendation</th>
          <th>Key Factor</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${opportunities.map(opp => {
          const intel = opp.intelligence;
          const rec = intel.recommendation;
          const topInsight = intel.strategicInsights[0];

          return `
            <tr data-score="${intel.totalScore}" data-opp-id="${opp.id}">
              <td>
                <span class="intel-score-cell" style="background: ${rec.color}">${intel.totalScore}</span>
              </td>
              <td>
                <div class="cell-title">${opp.title}</div>
                <div class="cell-subtitle">${opp.sector} | ${opp.region}</div>
              </td>
              <td class="text-right">${formatCurrency(opp.value)}</td>
              <td class="text-center">
                <span class="win-prob-badge">${intel.winProbability}%</span>
              </td>
              <td>
                <span class="rec-badge" style="background: ${rec.color}20; color: ${rec.color}; border-color: ${rec.color}">
                  ${rec.label}
                </span>
              </td>
              <td>
                <span class="insight-mini ${topInsight?.type || ''}">${topInsight?.text || '-'}</span>
              </td>
              <td>
                <button class="btn-explore" data-opp-id="${opp.id}">
                  <span class="btn-explore-icon">🔍</span>
                  Explore
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderSectorStrengths(sectors) {
  return sectors.map(sector => {
    const levelColor = {
      'expert': '#10B981',
      'strong': '#F59E0B',
      'moderate': '#6B7280'
    }[sector.level] || '#6B7280';

    const competitorCount = sector.competitors.length;
    const strongCompetitors = sector.competitors.filter(c => c.strength === 'strong').length;

    return `
      <div class="sector-strength-card">
        <div class="sector-strength-header">
          <h3 class="sector-name">${capitalise(sector.sector)}</h3>
          <span class="sector-level-badge" style="background: ${levelColor}">${capitalise(sector.level)}</span>
        </div>
        <div class="sector-strength-stats">
          <div class="sector-stat">
            <span class="sector-stat-value">${Math.round(sector.winRate * 100)}%</span>
            <span class="sector-stat-label">Win Rate</span>
          </div>
          <div class="sector-stat">
            <span class="sector-stat-value">${competitorCount}</span>
            <span class="sector-stat-label">Competitors</span>
          </div>
          <div class="sector-stat">
            <span class="sector-stat-value">${strongCompetitors}</span>
            <span class="sector-stat-label">Strong Rivals</span>
          </div>
        </div>
        <div class="sector-competitors">
          <span class="competitors-label">Key Threats:</span>
          ${sector.competitors.filter(c => c.strength === 'strong').slice(0, 2).map(c =>
            `<span class="competitor-tag">${c.name}</span>`
          ).join('') || '<span class="text-muted">None identified</span>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderCompetitorCards(competitors) {
  return competitors.slice(0, 8).map(comp => {
    const sectorList = comp.sectors.map(s => capitalise(s.sector)).join(', ');

    return `
      <div class="competitor-card">
        <h3 class="competitor-name">${comp.name}</h3>
        <div class="competitor-sectors">${sectorList}</div>
        <div class="competitor-detail">
          <span class="competitor-sectors-count">${comp.sectors.length} sectors</span>
          <span class="competitor-strength ${comp.overallStrength}">${capitalise(comp.overallStrength)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function setupIntelligenceListeners(container, intelligence) {
  const filterSelect = container.querySelector('#intel-filter');
  const tableContainer = container.querySelector('#intel-table-container');

  if (filterSelect && tableContainer) {
    filterSelect.addEventListener('change', () => {
      const filter = filterSelect.value;
      let filtered = intelligence.opportunities;

      switch (filter) {
        case 'strong':
          filtered = intelligence.opportunities.filter(o => o.intelligence.totalScore >= 80);
          break;
        case 'pursue':
          filtered = intelligence.opportunities.filter(o =>
            o.intelligence.totalScore >= 65 && o.intelligence.totalScore < 80
          );
          break;
        case 'selective':
          filtered = intelligence.opportunities.filter(o =>
            o.intelligence.totalScore >= 50 && o.intelligence.totalScore < 65
          );
          break;
        case 'low':
          filtered = intelligence.opportunities.filter(o => o.intelligence.totalScore < 50);
          break;
        default:
          filtered = intelligence.opportunities;
      }

      tableContainer.innerHTML = renderIntelligenceTable(filtered);
      // Re-attach explore button listeners after re-render
      attachExploreListeners(container, intelligence.opportunities);
    });
  }

  // Attach explore button click handlers
  attachExploreListeners(container, intelligence.opportunities);
}

function attachExploreListeners(container, opportunities) {
  container.querySelectorAll('.btn-explore').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const oppId = btn.dataset.oppId;
      const opportunity = opportunities.find(o => o.id === oppId);
      if (opportunity) {
        openExplorer(opportunity);
      }
    });
  });
}
