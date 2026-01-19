/**
 * Simple State Management
 * Provides reactive state with subscription support
 */

export class State {
  constructor() {
    this.state = {
      data: null,
      lastUpdated: null,
      filters: {
        region: 'all',
        sector: 'all',
        discipline: 'all'
      },
      search: '',
      selectedRegion: null,
      selectedSector: null,
      selectedDiscipline: null
    };

    this.subscribers = new Map();
  }

  get(key) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // Notify subscribers
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        callback(value, oldValue);
      });
    }

    // Also notify 'all' subscribers
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(callback => {
        callback(this.state, key, value, oldValue);
      });
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(key).delete(callback);
    };
  }

  // Update filters
  setFilter(filterKey, value) {
    const filters = { ...this.state.filters, [filterKey]: value };
    this.set('filters', filters);
  }

  resetFilters() {
    this.set('filters', {
      region: 'all',
      sector: 'all',
      discipline: 'all'
    });
  }

  // Check if any filters are active
  hasActiveFilters() {
    const { region, sector, discipline } = this.state.filters;
    return region !== 'all' || sector !== 'all' || discipline !== 'all';
  }

  // Get active filter labels for display
  getActiveFilterLabels(data) {
    const labels = [];
    const { region, sector, discipline } = this.state.filters;

    if (region && region !== 'all' && data.regions) {
      const r = data.regions.find(r => r.id === region);
      if (r) labels.push({ type: 'region', id: region, label: r.name });
    }

    if (sector && sector !== 'all' && data.sectors) {
      const s = data.sectors.find(s => s.id === sector);
      if (s) labels.push({ type: 'sector', id: sector, label: s.name });
    }

    if (discipline && discipline !== 'all' && data.disciplines) {
      const d = data.disciplines.find(d => d.id === discipline);
      if (d) labels.push({ type: 'discipline', id: discipline, label: d.name });
    }

    return labels;
  }
}
