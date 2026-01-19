/**
 * Global Filters Component
 */

export function renderFilters(container, { regions, sectors, disciplines, currentFilters, onFilterChange }) {
  const filters = currentFilters || { region: 'all', sector: 'all', discipline: 'all' };

  container.innerHTML = `
    <div class="filter-group">
      <label class="filter-label" for="filter-region">Region:</label>
      <select id="filter-region" class="input filter-select">
        <option value="all">All Regions</option>
        ${(regions || []).map(r => `
          <option value="${r.id}" ${filters.region === r.id ? 'selected' : ''}>
            ${r.name}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label" for="filter-sector">Sector:</label>
      <select id="filter-sector" class="input filter-select">
        <option value="all">All Sectors</option>
        ${(sectors || []).map(s => `
          <option value="${s.id}" ${filters.sector === s.id ? 'selected' : ''}>
            ${s.name}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label" for="filter-discipline">Discipline:</label>
      <select id="filter-discipline" class="input filter-select">
        <option value="all">All Disciplines</option>
        ${(disciplines || []).map(d => `
          <option value="${d.id}" ${filters.discipline === d.id ? 'selected' : ''}>
            ${d.name}
          </option>
        `).join('')}
      </select>
    </div>

    <button class="btn filter-reset" id="filter-reset" ${!hasActiveFilters(filters) ? 'disabled' : ''}>
      Reset Filters
    </button>
  `;

  // Add event listeners
  const regionSelect = container.querySelector('#filter-region');
  const sectorSelect = container.querySelector('#filter-sector');
  const disciplineSelect = container.querySelector('#filter-discipline');
  const resetButton = container.querySelector('#filter-reset');

  const handleChange = () => {
    const newFilters = {
      region: regionSelect.value,
      sector: sectorSelect.value,
      discipline: disciplineSelect.value
    };

    // Update reset button state
    resetButton.disabled = !hasActiveFilters(newFilters);

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  regionSelect.addEventListener('change', handleChange);
  sectorSelect.addEventListener('change', handleChange);
  disciplineSelect.addEventListener('change', handleChange);

  resetButton.addEventListener('click', () => {
    regionSelect.value = 'all';
    sectorSelect.value = 'all';
    disciplineSelect.value = 'all';
    resetButton.disabled = true;

    if (onFilterChange) {
      onFilterChange({ region: 'all', sector: 'all', discipline: 'all' });
    }
  });
}

function hasActiveFilters(filters) {
  return filters.region !== 'all' ||
         filters.sector !== 'all' ||
         filters.discipline !== 'all';
}
