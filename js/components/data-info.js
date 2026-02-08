/**
 * Data Info Component
 * Reusable info button + modal showing data sources for each view
 */

/**
 * Returns HTML for a small (i) info button to embed in view headers
 */
export function getInfoButtonHTML() {
  return `<button class="info-btn" title="View data sources" aria-label="Data sources info">i</button>`;
}

/**
 * Attaches click handler and injects info modal into the container
 * @param {HTMLElement} container - The view container
 * @param {Object} config - { title, sources: [{ name, file, description, count }] }
 */
export function setupInfoPopup(container, config) {
  const btn = container.querySelector('.info-btn');
  if (!btn) return;

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
          <div class="info-modal-body">
            ${config.sources.map(src => `
              <div class="info-source-item">
                <div class="info-source-file">${src.file}</div>
                <div class="info-source-desc">
                  ${src.count != null ? `<strong>${src.count.toLocaleString()}</strong> ` : ''}${src.description}
                </div>
              </div>
            `).join('')}
          </div>
          ${config.lastUpdated ? `<div class="info-modal-footer">Last updated: ${config.lastUpdated}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  // Inject modal
  container.insertAdjacentHTML('beforeend', modalHTML);
  const overlay = document.getElementById(modalId);
  const modal = overlay.querySelector('.info-modal');
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
  const escHandler = (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      overlay.classList.remove('visible');
    }
  };
  document.addEventListener('keydown', escHandler);
}
