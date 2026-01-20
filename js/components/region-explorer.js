/**
 * Region Explorer Component
 * Interactive Q&A modal for evaluating regional presence and investment
 */

import { REGION_ASSESSMENT_SECTIONS, getRegionAssessmentResult } from '../utils/region-assessment.js';
import { formatCurrency } from '../utils/formatters.js';

// Store current state
let currentRegion = null;
let currentRegionData = null;
let currentAnswers = {};
let currentSection = 0;
let assessmentComplete = false;

/**
 * Open the region explorer modal
 */
export function openRegionExplorer(region, regionData = {}) {
  currentRegion = region;
  currentRegionData = regionData;
  currentAnswers = {};
  currentSection = 0;
  assessmentComplete = false;

  // Create modal if it doesn't exist
  let modal = document.getElementById('region-explorer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'region-explorer-modal';
    modal.className = 'explorer-modal';
    document.body.appendChild(modal);
  }

  // Render the modal
  modal.innerHTML = `
    <div class="explorer-overlay" onclick="window.closeRegionExplorer()"></div>
    <div class="explorer-container">
      <div class="explorer-header">
        <div class="explorer-header-content">
          <h2>Region Explorer</h2>
          <p class="text-muted">Evaluate regional presence and investment potential</p>
        </div>
        <button class="explorer-close" onclick="window.closeRegionExplorer()">×</button>
      </div>

      <div class="explorer-body">
        <div class="explorer-sidebar">
          ${renderRegionSummary(region, regionData)}
          ${renderProgressNav()}
        </div>

        <div class="explorer-main" id="region-explorer-main">
          ${renderWelcomeScreen(region, regionData)}
        </div>
      </div>
    </div>
  `;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Setup event listeners
  setupRegionExplorerListeners();
}

/**
 * Close the region explorer modal
 */
export function closeRegionExplorer() {
  const modal = document.getElementById('region-explorer-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Make functions globally available
window.closeRegionExplorer = closeRegionExplorer;
window.startRegionAssessment = startRegionAssessment;
window.nextRegionSection = nextRegionSection;
window.prevRegionSection = prevRegionSection;
window.selectRegionAnswer = selectRegionAnswer;
window.showRegionResults = showRegionResults;
window.jumpToRegionSection = jumpToRegionSection;

/**
 * Render region summary sidebar
 */
function renderRegionSummary(region, regionData) {
  const opportunities = regionData.opportunities || [];
  const clients = regionData.clients || [];
  const totalPipelineValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);

  return `
    <div class="explorer-opportunity-card">
      <h3>${region.name}</h3>
      <div class="explorer-meta">
        <span class="explorer-meta-item">
          <strong>10-Year Budget:</strong> ${formatCurrency(region.budget10Year || 0)}
        </span>
        <span class="explorer-meta-item">
          <strong>2026 Spend:</strong> ${formatCurrency(region.budget2026 || 0)}
        </span>
        <span class="explorer-meta-item">
          <strong>Opportunities:</strong> ${opportunities.length}
        </span>
        <span class="explorer-meta-item">
          <strong>Pipeline Value:</strong> ${formatCurrency(totalPipelineValue)}
        </span>
        <span class="explorer-meta-item">
          <strong>Key Clients:</strong> ${clients.length}
        </span>
      </div>
      <div class="explorer-initial-score" style="background: var(--bg-darker);">
        <div class="explorer-score-label">Strategic Focus</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: var(--space-sm) 0 0 0;">
          ${region.strategicFocus || 'Infrastructure investment opportunities'}
        </p>
      </div>
    </div>
  `;
}

/**
 * Render progress navigation
 */
function renderProgressNav() {
  return `
    <div class="explorer-progress-nav" id="region-explorer-progress-nav">
      <div class="progress-item ${currentSection === -1 ? 'active' : ''}" data-section="-1">
        <span class="progress-icon">🏠</span>
        <span class="progress-label">Overview</span>
      </div>
      ${REGION_ASSESSMENT_SECTIONS.map((section, index) => `
        <div class="progress-item ${currentSection === index ? 'active' : ''} ${currentAnswers[section.questions[0]?.id] !== undefined ? 'completed' : ''}"
             data-section="${index}"
             onclick="window.jumpToRegionSection(${index})">
          <span class="progress-icon">${section.icon}</span>
          <span class="progress-label">${section.title}</span>
        </div>
      `).join('')}
      <div class="progress-item ${assessmentComplete ? 'active' : ''}" data-section="results">
        <span class="progress-icon">📊</span>
        <span class="progress-label">Results</span>
      </div>
    </div>
  `;
}

/**
 * Render welcome/overview screen
 */
function renderWelcomeScreen(region, regionData) {
  const opportunities = regionData.opportunities || [];
  const clients = regionData.clients || [];

  // Calculate some quick stats
  const highValueOpps = opportunities.filter(o => (o.value || 0) > 10000000).length;
  const inProcurement = opportunities.filter(o => o.status === 'procurement').length;

  return `
    <div class="explorer-welcome">
      <div class="explorer-welcome-header">
        <h3>Evaluate ${region.name}</h3>
        <p>This assessment will help you determine whether to invest more in this region and how to approach growth.</p>
      </div>

      <div class="explorer-ai-analysis">
        <h4>Regional Overview</h4>
        <div class="ai-analysis-grid">
          <div class="ai-analysis-item">
            <span class="ai-label">Budget Scale</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${Math.min((region.budget10Year || 0) / 500000000 * 100, 100)}%"></div>
            </div>
            <span class="ai-value">${formatCurrency(region.budget10Year || 0)}</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">Pipeline</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${Math.min(opportunities.length * 10, 100)}%"></div>
            </div>
            <span class="ai-value">${opportunities.length} opps</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">Key Clients</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${Math.min(clients.length * 10, 100)}%"></div>
            </div>
            <span class="ai-value">${clients.length}</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">High Value</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${Math.min(highValueOpps * 20, 100)}%"></div>
            </div>
            <span class="ai-value">${highValueOpps} opps</span>
          </div>
        </div>
        ${region.growthAreas ? `
          <p class="ai-insight"><strong>Growth Areas:</strong> ${region.growthAreas}</p>
        ` : ''}
      </div>

      <div class="explorer-what-next">
        <h4>What We'll Assess</h4>
        <div class="assessment-preview">
          ${REGION_ASSESSMENT_SECTIONS.map(section => `
            <div class="preview-item">
              <span class="preview-icon">${section.icon}</span>
              <span class="preview-title">${section.title}</span>
              <span class="preview-count">${section.questions.length} questions</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="explorer-actions">
        <button class="btn btn-primary btn-lg" onclick="window.startRegionAssessment()">
          Start Assessment
        </button>
      </div>
    </div>
  `;
}

/**
 * Start the assessment
 */
function startRegionAssessment() {
  currentSection = 0;
  renderCurrentSection();
}

/**
 * Jump to a specific section
 */
function jumpToRegionSection(index) {
  if (index >= 0 && index < REGION_ASSESSMENT_SECTIONS.length) {
    currentSection = index;
    renderCurrentSection();
  }
}

/**
 * Render current section questions
 */
function renderCurrentSection() {
  const section = REGION_ASSESSMENT_SECTIONS[currentSection];
  const main = document.getElementById('region-explorer-main');

  main.innerHTML = `
    <div class="explorer-section">
      <div class="section-header">
        <span class="section-icon">${section.icon}</span>
        <h3>${section.title}</h3>
        <span class="section-progress">${currentSection + 1} of ${REGION_ASSESSMENT_SECTIONS.length}</span>
      </div>

      <div class="section-questions">
        ${section.questions.map((question, qIndex) => `
          <div class="question-card" id="question-${question.id}">
            <div class="question-text">
              <span class="question-number">${qIndex + 1}.</span>
              ${question.question}
            </div>
            <div class="question-options">
              ${question.options.map(option => `
                <label class="option-label ${currentAnswers[question.id] === option.value ? 'selected' : ''}"
                       onclick="window.selectRegionAnswer('${question.id}', ${option.value})">
                  <input type="radio"
                         name="${question.id}"
                         value="${option.value}"
                         ${currentAnswers[question.id] === option.value ? 'checked' : ''}>
                  <span class="option-indicator"></span>
                  <span class="option-text">${option.label}</span>
                </label>
              `).join('')}
            </div>
            ${currentAnswers[question.id] !== undefined ? `
              <div class="question-insight">
                <span class="insight-icon">💡</span>
                ${question.insight}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section-nav">
        <button class="btn btn-secondary" onclick="window.prevRegionSection()" ${currentSection === 0 ? 'disabled' : ''}>
          ← Previous
        </button>
        <div class="section-dots">
          ${REGION_ASSESSMENT_SECTIONS.map((_, i) => `
            <span class="dot ${i === currentSection ? 'active' : ''} ${i < currentSection ? 'completed' : ''}"></span>
          `).join('')}
        </div>
        ${currentSection < REGION_ASSESSMENT_SECTIONS.length - 1 ? `
          <button class="btn btn-primary" onclick="window.nextRegionSection()">
            Next →
          </button>
        ` : `
          <button class="btn btn-primary" onclick="window.showRegionResults()">
            View Results →
          </button>
        `}
      </div>
    </div>
  `;

  updateProgressNav();
}

/**
 * Select an answer
 */
function selectRegionAnswer(questionId, value) {
  currentAnswers[questionId] = value;
  renderCurrentSection();
}

/**
 * Go to next section
 */
function nextRegionSection() {
  if (currentSection < REGION_ASSESSMENT_SECTIONS.length - 1) {
    currentSection++;
    renderCurrentSection();
    scrollToTop();
  }
}

/**
 * Go to previous section
 */
function prevRegionSection() {
  if (currentSection > 0) {
    currentSection--;
    renderCurrentSection();
    scrollToTop();
  } else {
    currentSection = -1;
    document.getElementById('region-explorer-main').innerHTML = renderWelcomeScreen(currentRegion, currentRegionData);
    updateProgressNav();
  }
}

/**
 * Show assessment results
 */
function showRegionResults() {
  assessmentComplete = true;
  const result = getRegionAssessmentResult(currentAnswers, currentRegion, currentRegionData);
  const main = document.getElementById('region-explorer-main');

  main.innerHTML = `
    <div class="explorer-results">
      <div class="results-header">
        <h3>Regional Assessment Complete</h3>
        <p class="text-muted">Investment recommendation for ${currentRegion.name}</p>
      </div>

      <div class="results-recommendation" style="border-color: ${result.recommendation.color}; background: ${result.recommendation.color}15;">
        <div class="rec-decision" style="color: ${result.recommendation.color}">${result.recommendation.decision}</div>
        <div class="rec-confidence">Confidence: ${result.recommendation.confidence}</div>
        <p class="rec-summary">${result.recommendation.summary}</p>
      </div>

      <div class="results-score-overview">
        <div class="score-circle ${getScoreClass(result.score)}">
          <span class="score-number">${result.score}</span>
          <span class="score-label">Overall</span>
        </div>
        <div class="section-scores">
          ${Object.entries(result.sectionScores).map(([key, section]) => `
            <div class="section-score-item">
              <span class="section-score-icon">${section.icon}</span>
              <span class="section-score-title">${section.title}</span>
              <div class="section-score-bar">
                <div class="section-score-fill ${getScoreClass(section.score)}" style="width: ${section.score}%"></div>
              </div>
              <span class="section-score-value">${section.score}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${result.strengths.length > 0 ? `
        <div class="results-section">
          <h4>Regional Strengths</h4>
          <div class="strengths-list">
            ${result.strengths.slice(0, 4).map(s => `
              <div class="strength-item">
                <span class="strength-icon">✓</span>
                <span class="strength-text">${s.answer}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${result.weaknesses.length > 0 ? `
        <div class="results-section">
          <h4>Gaps to Address</h4>
          <div class="weaknesses-list">
            ${result.weaknesses.slice(0, 4).map(w => `
              <div class="weakness-item">
                <span class="weakness-icon">!</span>
                <div class="weakness-content">
                  <span class="weakness-text">${w.question}</span>
                  <span class="weakness-insight">${w.insight}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="results-section">
        <h4>Growth Strategy: ${result.strategy.theme}</h4>
        <div class="win-strategy-card">
          <div class="strategy-messages">
            <strong>Strategic Objectives:</strong>
            <ul>
              ${result.strategy.objectives.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>
          <div class="strategy-differentiators">
            <strong>Quick Wins (0-3 months):</strong>
            <ul>
              ${result.strategy.quickWins.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
          <div class="strategy-differentiators">
            <strong>Long-term Plays (6-18 months):</strong>
            <ul>
              ${result.strategy.longTermPlays.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="results-section">
        <h4>Action Plan</h4>
        <div class="action-plan">
          ${result.actionPlan.actions.length > 0 ? `
            <div class="actions-list">
              ${result.actionPlan.actions.map(action => `
                <div class="action-item priority-${action.priority}">
                  <span class="action-priority">${action.priority.toUpperCase()}</span>
                  <div class="action-content">
                    <span class="action-text">${action.action}</span>
                    <span class="action-meta">${action.owner} • ${action.timeframe} • Investment: ${action.investment}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-muted">Strong position - focus on maintaining momentum</p>'}

          ${result.actionPlan.investments.length > 0 ? `
            <div class="investment-recommendation" style="margin-top: var(--space-lg); padding: var(--space-lg); background: var(--bg-darker); border-radius: var(--radius-md);">
              <h5 style="color: var(--gleeds-yellow); margin: 0 0 var(--space-sm) 0;">Investment Recommendation</h5>
              ${result.actionPlan.investments.map(inv => `
                <div>
                  <strong>${inv.type}</strong> (${inv.level} investment)
                  <p style="margin: var(--space-xs) 0; color: var(--text-secondary);">${inv.description}</p>
                  <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Expected ROI: ${inv.expectedROI}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="results-actions">
        <button class="btn btn-secondary" onclick="window.startRegionAssessment()">
          Retake Assessment
        </button>
        <button class="btn btn-primary" onclick="window.closeRegionExplorer()">
          Done
        </button>
      </div>
    </div>
  `;

  updateProgressNav();
  scrollToTop();
}

/**
 * Update progress navigation
 */
function updateProgressNav() {
  const nav = document.getElementById('region-explorer-progress-nav');
  if (nav) {
    nav.innerHTML = `
      <div class="progress-item ${currentSection === -1 ? 'active' : 'completed'}" onclick="window.prevRegionSection()">
        <span class="progress-icon">🏠</span>
        <span class="progress-label">Overview</span>
      </div>
      ${REGION_ASSESSMENT_SECTIONS.map((section, index) => {
        const sectionAnswered = section.questions.some(q => currentAnswers[q.id] !== undefined);
        return `
          <div class="progress-item ${currentSection === index ? 'active' : ''} ${sectionAnswered ? 'completed' : ''}"
               onclick="window.jumpToRegionSection(${index})">
            <span class="progress-icon">${section.icon}</span>
            <span class="progress-label">${section.title}</span>
          </div>
        `;
      }).join('')}
      <div class="progress-item ${assessmentComplete ? 'active' : ''}" ${assessmentComplete ? 'onclick="window.showRegionResults()"' : ''}>
        <span class="progress-icon">📊</span>
        <span class="progress-label">Results</span>
      </div>
    `;
  }
}

/**
 * Setup event listeners
 */
function setupRegionExplorerListeners() {
  document.addEventListener('keydown', function handleEscape(e) {
    if (e.key === 'Escape') {
      closeRegionExplorer();
      document.removeEventListener('keydown', handleEscape);
    }
  });
}

/**
 * Helper to scroll main content to top
 */
function scrollToTop() {
  const main = document.getElementById('region-explorer-main');
  if (main) {
    main.scrollTop = 0;
  }
}

/**
 * Get score class for styling
 */
function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 50) return 'score-medium';
  if (score >= 30) return 'score-low';
  return 'score-critical';
}
