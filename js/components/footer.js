/**
 * Footer Component
 */

export function renderFooter(container) {
  const year = new Date().getFullYear();

  container.innerHTML = `
    <p>Infrastructure Opportunities Dashboard v3.0 | Data sourced from government publications, regulatory announcements, and market intelligence</p>
  `;
}
