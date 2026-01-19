/**
 * Header Component
 */

export function renderHeader(container, { lastUpdated, onSearch }) {
  const formattedDate = formatDate(lastUpdated);

  container.innerHTML = `
    <div class="header-top">
      <div class="header-brand">
        <img src="https://images.seeklogo.com/logo-png/6/1/gleeds-logo-png_seeklogo-61171.png" alt="Gleeds" class="header-logo" />
      </div>
      <h1 class="header-title">UK Infrastructure Dashboard</h1>
    </div>
    <p class="header-subtitle">Addressable Market Analysis by Region, Sector & Discipline</p>
    <div class="header-meta">
      <span class="last-updated">Last Updated: ${formattedDate}</span>
      <div class="search-input" style="min-width: 280px;">
        <input
          type="search"
          class="input"
          placeholder="Search opportunities, clients, regions..."
          id="global-search"
          style="padding-left: 40px;"
        />
      </div>
    </div>
  `;

  // Add search functionality
  const searchInput = container.querySelector('#global-search');
  if (searchInput && onSearch) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onSearch(e.target.value);
      }, 300);
    });
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
