/**
 * Opportunity Explorer Component
 * Interactive Q&A modal for evaluating opportunities
 */

import { ASSESSMENT_SECTIONS, getAssessmentResult } from '../utils/assessment.js';
import { calculateBidScore } from '../utils/intelligence.js';
import { formatCurrency } from '../utils/formatters.js';

// Store current state
let currentOpportunity = null;
let currentAnswers = {};
let currentSection = 0;
let assessmentComplete = false;

/**
 * Open the explorer modal for an opportunity
 */
export function openExplorer(opportunity) {
  currentOpportunity = opportunity;
  currentAnswers = {};
  currentSection = 0;
  assessmentComplete = false;

  // Create modal if it doesn't exist
  let modal = document.getElementById('opportunity-explorer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opportunity-explorer-modal';
    modal.className = 'explorer-modal';
    document.body.appendChild(modal);
  }

  // Get initial intelligence score
  const intelligenceScore = calculateBidScore(opportunity);

  // Render the modal
  modal.innerHTML = `
    <div class="explorer-overlay" onclick="window.closeExplorer()"></div>
    <div class="explorer-container">
      <div class="explorer-header">
        <div class="explorer-header-content">
          <h2>Opportunity Explorer</h2>
          <p class="text-muted">Guided assessment to evaluate this opportunity</p>
        </div>
        <button class="explorer-close" onclick="window.closeExplorer()">×</button>
      </div>

      <div class="explorer-body">
        <div class="explorer-sidebar">
          ${renderOpportunitySummary(opportunity, intelligenceScore)}
          ${renderProgressNav()}
        </div>

        <div class="explorer-main" id="explorer-main">
          ${renderWelcomeScreen(opportunity, intelligenceScore)}
        </div>
      </div>
    </div>
  `;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Setup event listeners
  setupExplorerListeners();
}

/**
 * Close the explorer modal
 */
export function closeExplorer() {
  const modal = document.getElementById('opportunity-explorer-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Make functions globally available
window.closeExplorer = closeExplorer;
window.startAssessment = startAssessment;
window.nextSection = nextSection;
window.prevSection = prevSection;
window.selectAnswer = selectAnswer;
window.showResults = showResults;
window.jumpToSection = jumpToSection;

/**
 * Render opportunity summary sidebar
 */
function renderOpportunitySummary(opportunity, intelligenceScore) {
  return `
    <div class="explorer-opportunity-card">
      <h3>${opportunity.name || opportunity.title || 'Opportunity'}</h3>
      <div class="explorer-meta">
        <span class="explorer-meta-item">
          <strong>Client:</strong> ${opportunity.client || 'TBC'}
        </span>
        <span class="explorer-meta-item">
          <strong>Value:</strong> ${opportunity.value ? formatCurrency(opportunity.value) : 'TBC'}
        </span>
        <span class="explorer-meta-item">
          <strong>Sector:</strong> ${opportunity.sector || 'General'}
        </span>
        <span class="explorer-meta-item">
          <strong>Region:</strong> ${opportunity.region || 'National'}
        </span>
        ${opportunity.bidDeadline ? `
          <span class="explorer-meta-item">
            <strong>Deadline:</strong> ${new Date(opportunity.bidDeadline).toLocaleDateString()}
          </span>
        ` : ''}
      </div>
      <div class="explorer-initial-score">
        <div class="explorer-score-label">AI Score</div>
        <div class="explorer-score-value ${getScoreClass(intelligenceScore.totalScore)}">
          ${intelligenceScore.totalScore}
        </div>
        <div class="explorer-score-rec">${intelligenceScore.recommendation.action}</div>
      </div>
    </div>
  `;
}

/**
 * Render progress navigation
 */
function renderProgressNav() {
  return `
    <div class="explorer-progress-nav" id="explorer-progress-nav">
      <div class="progress-item ${currentSection === -1 ? 'active' : ''}" data-section="-1">
        <span class="progress-icon">🏠</span>
        <span class="progress-label">Overview</span>
      </div>
      ${ASSESSMENT_SECTIONS.map((section, index) => `
        <div class="progress-item ${currentSection === index ? 'active' : ''} ${currentAnswers[section.questions[0]?.id] !== undefined ? 'completed' : ''}"
             data-section="${index}"
             onclick="window.jumpToSection(${index})">
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
function renderWelcomeScreen(opportunity, intelligenceScore) {
  return `
    <div class="explorer-welcome">
      <div class="explorer-welcome-header">
        <h3>Ready to Explore This Opportunity?</h3>
        <p>This guided assessment will help you decide whether to pursue this opportunity and how to approach it.</p>
      </div>

      <div class="explorer-ai-analysis">
        <h4>Initial AI Analysis</h4>
        <div class="ai-analysis-grid">
          <div class="ai-analysis-item">
            <span class="ai-label">Sector Fit</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${intelligenceScore.scores.sectorFit}%"></div>
            </div>
            <span class="ai-value">${intelligenceScore.scores.sectorFit}%</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">Region Fit</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${intelligenceScore.scores.regionFit}%"></div>
            </div>
            <span class="ai-value">${intelligenceScore.scores.regionFit}%</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">Value Fit</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${intelligenceScore.scores.valueFit}%"></div>
            </div>
            <span class="ai-value">${intelligenceScore.scores.valueFit}%</span>
          </div>
          <div class="ai-analysis-item">
            <span class="ai-label">Competition</span>
            <div class="ai-bar">
              <div class="ai-bar-fill" style="width: ${intelligenceScore.scores.competitionLevel}%"></div>
            </div>
            <span class="ai-value">${intelligenceScore.scores.competitionLevel}%</span>
          </div>
        </div>
        <p class="ai-insight">${intelligenceScore.strategicInsights[0] || 'Complete the assessment for deeper insights.'}</p>
      </div>

      <div class="explorer-what-next">
        <h4>What We'll Cover</h4>
        <div class="assessment-preview">
          ${ASSESSMENT_SECTIONS.map(section => `
            <div class="preview-item">
              <span class="preview-icon">${section.icon}</span>
              <span class="preview-title">${section.title}</span>
              <span class="preview-count">${section.questions.length} questions</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="explorer-actions">
        <button class="btn btn-primary btn-lg" onclick="window.startAssessment()">
          Start Assessment
        </button>
      </div>
    </div>
  `;
}

/**
 * Start the assessment
 */
function startAssessment() {
  currentSection = 0;
  renderCurrentSection();
}

/**
 * Jump to a specific section
 */
function jumpToSection(index) {
  if (index >= 0 && index < ASSESSMENT_SECTIONS.length) {
    currentSection = index;
    renderCurrentSection();
  }
}

/**
 * Render current section questions
 */
function renderCurrentSection() {
  const section = ASSESSMENT_SECTIONS[currentSection];
  const main = document.getElementById('explorer-main');

  main.innerHTML = `
    <div class="explorer-section">
      <div class="section-header">
        <span class="section-icon">${section.icon}</span>
        <h3>${section.title}</h3>
        <span class="section-progress">${currentSection + 1} of ${ASSESSMENT_SECTIONS.length}</span>
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
                       onclick="window.selectAnswer('${question.id}', ${option.value})">
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
        <button class="btn btn-secondary" onclick="window.prevSection()" ${currentSection === 0 ? 'disabled' : ''}>
          ← Previous
        </button>
        <div class="section-dots">
          ${ASSESSMENT_SECTIONS.map((_, i) => `
            <span class="dot ${i === currentSection ? 'active' : ''} ${i < currentSection ? 'completed' : ''}"></span>
          `).join('')}
        </div>
        ${currentSection < ASSESSMENT_SECTIONS.length - 1 ? `
          <button class="btn btn-primary" onclick="window.nextSection()">
            Next →
          </button>
        ` : `
          <button class="btn btn-primary" onclick="window.showResults()">
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
function selectAnswer(questionId, value) {
  currentAnswers[questionId] = value;

  // Re-render to show insight and update selection
  renderCurrentSection();
}

/**
 * Go to next section
 */
function nextSection() {
  if (currentSection < ASSESSMENT_SECTIONS.length - 1) {
    currentSection++;
    renderCurrentSection();
    scrollToTop();
  }
}

/**
 * Go to previous section
 */
function prevSection() {
  if (currentSection > 0) {
    currentSection--;
    renderCurrentSection();
    scrollToTop();
  } else {
    // Go back to welcome screen
    currentSection = -1;
    const intelligenceScore = calculateBidScore(currentOpportunity);
    document.getElementById('explorer-main').innerHTML = renderWelcomeScreen(currentOpportunity, intelligenceScore);
    updateProgressNav();
  }
}

/**
 * Show assessment results
 */
function showResults() {
  assessmentComplete = true;
  const result = getAssessmentResult(currentAnswers, currentOpportunity);
  const main = document.getElementById('explorer-main');

  main.innerHTML = `
    <div class="explorer-results">
      <div class="results-header">
        <h3>Assessment Complete</h3>
        <p class="text-muted">Here's our recommendation based on your assessment</p>
      </div>

      <div class="results-recommendation ${result.recommendation.color}">
        <div class="rec-decision">${result.recommendation.decision}</div>
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
          <h4>Key Strengths</h4>
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
          <h4>Areas to Address</h4>
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
        <h4>Win Strategy</h4>
        <div class="win-strategy-card">
          <div class="strategy-theme">${result.winStrategy.theme}</div>
          <div class="strategy-messages">
            <strong>Key Messages:</strong>
            <ul>
              ${result.winStrategy.keyMessages.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
          ${result.winStrategy.differentiators.length > 0 ? `
            <div class="strategy-differentiators">
              <strong>Differentiators to Emphasise:</strong>
              <ul>
                ${result.winStrategy.differentiators.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
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
                    <span class="action-meta">${action.owner} • ${action.timeframe}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${result.actionPlan.timeline.length > 0 ? `
            <div class="timeline">
              <h5>Suggested Timeline</h5>
              <div class="timeline-items">
                ${result.actionPlan.timeline.map(phase => `
                  <div class="timeline-item">
                    <span class="timeline-phase">${phase.phase}</span>
                    <ul class="timeline-activities">
                      ${phase.activities.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="results-actions">
        <button class="btn btn-secondary" onclick="window.startAssessment()">
          Retake Assessment
        </button>
        <button class="btn btn-primary" onclick="window.closeExplorer()">
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
  const nav = document.getElementById('explorer-progress-nav');
  if (nav) {
    nav.innerHTML = `
      <div class="progress-item ${currentSection === -1 ? 'active' : 'completed'}" onclick="window.prevSection()">
        <span class="progress-icon">🏠</span>
        <span class="progress-label">Overview</span>
      </div>
      ${ASSESSMENT_SECTIONS.map((section, index) => {
        const sectionAnswered = section.questions.some(q => currentAnswers[q.id] !== undefined);
        return `
          <div class="progress-item ${currentSection === index ? 'active' : ''} ${sectionAnswered ? 'completed' : ''}"
               onclick="window.jumpToSection(${index})">
            <span class="progress-icon">${section.icon}</span>
            <span class="progress-label">${section.title}</span>
          </div>
        `;
      }).join('')}
      <div class="progress-item ${assessmentComplete ? 'active' : ''}" ${assessmentComplete ? 'onclick="window.showResults()"' : ''}>
        <span class="progress-icon">📊</span>
        <span class="progress-label">Results</span>
      </div>
    `;
  }
}

/**
 * Setup event listeners
 */
function setupExplorerListeners() {
  // Close on escape key
  document.addEventListener('keydown', function handleEscape(e) {
    if (e.key === 'Escape') {
      closeExplorer();
      document.removeEventListener('keydown', handleEscape);
    }
  });
}

/**
 * Helper to scroll main content to top
 */
function scrollToTop() {
  const main = document.getElementById('explorer-main');
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
