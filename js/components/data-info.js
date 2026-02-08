/**
 * Data Info Component
 * Reusable info button + modal showing data provenance for each view
 * SLT-grade: shows real reports, publications, and regulatory determinations
 */

import { formatCurrency } from '../utils/formatters.js';

/**
 * Canonical URL mapping for known data sources.
 * Used across all views so links are consistent.
 */
export const SOURCE_LINKS = {
  'Ofwat PR24 Final Determination Dec 2024': 'https://www.ofwat.gov.uk/regulated-companies/price-review/2024-price-review/final-determinations/',
  'Network Rail CP7 Delivery Plan': 'https://www.networkrail.co.uk/who-we-are/publications-and-resources/our-delivery-plan-for-2024-2029/',
  'TfL Business Plan 2024/25': 'https://tfl.gov.uk/corporate/publications-and-reports/business-plan',
  'National Highways RIS3 Programme': 'https://nationalhighways.co.uk/our-roads/our-road-investment-strategy/',
  'Transport Scotland STPR2': 'https://www.transport.gov.scot/our-approach/strategy/strategic-transport-projects-review-2/',
  'Heathrow 2.0 Masterplan': 'https://www.heathrow.com/company/about-heathrow/expansion',
  'Gatwick Airport Masterplan 2024': 'https://www.gatwickairport.com/business-community/future-plans/',
  'HS2 Phase One Full Business Case': 'https://www.gov.uk/government/publications/hs2-phase-one-full-business-case',
  'CAA Airport Capacity Reports': 'https://www.caa.co.uk/data-and-analysis/',
  'BEIS Energy Security Strategy': 'https://www.gov.uk/government/publications/british-energy-security-strategy',
  'Ofgem RIIO-ED2 Final Determinations': 'https://www.ofgem.gov.uk/energy-policy-and-regulation/policy-and-regulatory-programmes/network-price-controls-2021-2028-riio-2/riio-ed2',
  'DfT Road Investment Strategy 3': 'https://www.gov.uk/government/publications/road-investment-strategy-3',
  'Welsh Government National Transport Delivery Plan': 'https://www.gov.wales/national-transport-delivery-plan-2022-2027',
  'Transport Scotland Rail Investment': 'https://www.transport.gov.scot/public-transport/rail/',
  'CRSTS Round 2 Allocations': 'https://www.gov.uk/government/publications/city-region-sustainable-transport-settlements',
  'UK Port Infrastructure Investment': 'https://www.gov.uk/government/collections/maritime-and-shipping-statistics',
  'Environment Agency Flood Programme': 'https://www.gov.uk/government/publications/programme-of-flood-and-coastal-erosion-risk-management-schemes',
};

/**
 * Returns HTML for a small (i) info button to embed in view headers
 */
export function getInfoButtonHTML() {
  return `<button class="info-btn" title="View data sources" aria-label="Data sources info">i</button>`;
}

/**
 * Builds a sorted array of report objects from client data.
 * Groups clients by their `source` field, sums budgets, counts clients,
 * and attaches URLs from SOURCE_LINKS.
 *
 * @param {Array} clients - Array of client objects with { source, budget10Year, name }
 * @returns {Array} - Sorted array of { name, value, clientCount, url }
 */
export function buildSourcesFromClients(clients) {
  const sourceMap = {};

  clients.forEach(c => {
    const src = c.source || 'Company reports';
    if (!sourceMap[src]) {
      sourceMap[src] = { name: src, value: 0, clientCount: 0, url: SOURCE_LINKS[src] || null };
    }
    sourceMap[src].value += c.budget10Year || 0;
    sourceMap[src].clientCount += 1;
  });

  return Object.values(sourceMap).sort((a, b) => b.value - a.value);
}

/**
 * Attaches click handler and injects info modal into the container
 *
 * @param {HTMLElement} container - The view container
 * @param {Object} config - {
 *   title: string,
 *   reports: [{ name, value, clientCount, url }],
 *   summary: string,
 *   lastUpdated: string,
 *   note: string (optional extra note shown below reports)
 * }
 */
export function setupInfoPopup(container, config) {
  const btn = container.querySelector('.info-btn');
  if (!btn) return;

  const totalValue = (config.reports || []).reduce((sum, r) => sum + (r.value || 0), 0);
  const summary = config.summary || `${(config.reports || []).length} sources \u00b7 ${formatCurrency(totalValue)} total pipeline`;

  // Build report rows
  const reportRows = (config.reports || []).map(report => {
    const nameHTML = report.url
      ? `<a href="${report.url}" target="_blank" rel="noopener" class="info-report-link">${report.name} \u2197</a>`
      : `<span class="info-report-name">${report.name}</span>`;

    const valueHTML = report.value
      ? `<span class="info-report-value">${formatCurrency(report.value)}</span>`
      : '';

    const countHTML = report.clientCount
      ? `<div class="info-report-count">${report.clientCount} client${report.clientCount !== 1 ? 's' : ''}</div>`
      : '';

    return `
      <div class="info-source-item">
        <div class="info-report-row">
          <div class="info-report-name-col">${nameHTML}</div>
          ${valueHTML}
        </div>
        ${countHTML}
      </div>
    `;
  }).join('');

  // Build modal HTML
  const modalId = 'info-modal-' + Date.now();
  const modalHTML = `
    <div class="info-modal-overlay" id="${modalId}">
      <div class="info-modal">
        <button class="info-modal-close" aria-label="Close">&times;</button>
        <div class="info-modal-content">
          <div class="info-modal-header">
            <span class="info-modal-icon">i</span>
            <h3>Data Sources &mdash; ${config.title}</h3>
          </div>
          <div class="info-modal-summary">${summary}</div>
          <div class="info-modal-body">
            ${reportRows}
          </div>
          ${config.note ? `<div class="info-modal-note">${config.note}</div>` : ''}
          ${config.lastUpdated ? `<div class="info-modal-footer">Last updated: ${config.lastUpdated}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  // Inject modal
  container.insertAdjacentHTML('beforeend', modalHTML);
  const overlay = document.getElementById(modalId);
  const closeBtn = overlay.querySelector('.info-modal-close');

  // Open
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.classList.add('visible');
  });

  // Close on X
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  // Close on click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('visible');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      overlay.classList.remove('visible');
    }
  });
}
