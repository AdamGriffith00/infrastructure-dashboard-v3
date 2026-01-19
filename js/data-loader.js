/**
 * Data Loader
 * Fetches and caches JSON data files
 */

export class DataLoader {
  constructor() {
    this.data = {
      config: null,
      regions: [],
      sectors: [],
      disciplines: [],
      clients: [],
      opportunities: [],
      budgets: [],
      projects: [],
      cheatsheets: {}
    };

    this.lastUpdated = null;
    this.loaded = false;
  }

  async loadAll() {
    try {
      // Load all data files in parallel
      const [
        config,
        regions,
        sectors,
        disciplines,
        clients,
        opportunities,
        budgets,
        projects
      ] = await Promise.all([
        this.loadJSON('data/config.json'),
        this.loadJSON('data/regions.json'),
        this.loadJSON('data/sectors.json'),
        this.loadJSON('data/disciplines.json'),
        this.loadJSON('data/clients.json'),
        this.loadJSON('data/opportunities.json'),
        this.loadJSON('data/budgets.json'),
        this.loadJSON('data/projects.json').catch(() => ({ projects: [] })) // Optional
      ]);

      // Store data
      this.data.config = config;
      this.data.regions = regions.regions || [];
      this.data.sectors = sectors.sectors || [];
      this.data.disciplines = disciplines.disciplines || [];
      this.data.clients = clients.clients || [];
      this.data.opportunities = opportunities.opportunities || [];
      this.data.budgets = budgets.allocations || [];
      this.data.projects = projects.projects || [];

      // Get last updated from config or most recent file
      this.lastUpdated = config.lastUpdated || new Date().toISOString().split('T')[0];

      // Load cheat sheets (optional, load on demand)
      this.data.cheatsheets = {};

      this.loaded = true;
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  async loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      throw error;
    }
  }

  async loadCheatsheet(sectorId) {
    if (this.data.cheatsheets[sectorId]) {
      return this.data.cheatsheets[sectorId];
    }

    try {
      const cheatsheet = await this.loadJSON(`data/cheatsheets/${sectorId}.json`);
      this.data.cheatsheets[sectorId] = cheatsheet;
      return cheatsheet;
    } catch (error) {
      console.warn(`Cheatsheet for ${sectorId} not found`);
      return null;
    }
  }

  getData() {
    return this.data;
  }

  getLastUpdated() {
    return this.lastUpdated;
  }

  // Calculate totals
  getTotalBudget(timeframe = '2026') {
    const key = timeframe === '10year' ? 'budget10Year' : 'budget2026';
    return this.data.clients.reduce((sum, client) => sum + (client[key] || 0), 0);
  }

  getTotalOpportunities() {
    return this.data.opportunities.length;
  }

  // Get data by ID
  getRegion(id) {
    return this.data.regions.find(r => r.id === id);
  }

  getSector(id) {
    return this.data.sectors.find(s => s.id === id);
  }

  getDiscipline(id) {
    return this.data.disciplines.find(d => d.id === id);
  }

  getClient(id) {
    return this.data.clients.find(c => c.id === id);
  }

  // Get clients by region
  getClientsByRegion(regionId) {
    return this.data.clients.filter(c =>
      c.regions.includes(regionId) || c.regions.includes('national')
    );
  }

  // Get clients by sector
  getClientsBySector(sectorId) {
    return this.data.clients.filter(c => c.sector === sectorId);
  }

  // Get opportunities by region
  getOpportunitiesByRegion(regionId) {
    return this.data.opportunities.filter(o => o.region === regionId);
  }

  // Get opportunities by sector
  getOpportunitiesBySector(sectorId) {
    return this.data.opportunities.filter(o => o.sector === sectorId);
  }

  // Get budget allocations
  getBudgetsByRegion(regionId) {
    return this.data.budgets.filter(b => b.region === regionId);
  }

  getBudgetsBySector(sectorId) {
    return this.data.budgets.filter(b => b.sector === sectorId);
  }

  // Calculate regional totals
  getRegionalTotals() {
    const totals = {};

    this.data.regions.forEach(region => {
      totals[region.id] = {
        ...region,
        clientCount: this.getClientsByRegion(region.id).length,
        opportunityCount: this.getOpportunitiesByRegion(region.id).length
      };
    });

    return totals;
  }

  // Calculate sector totals
  getSectorTotals() {
    const totals = {};

    this.data.sectors.forEach(sector => {
      totals[sector.id] = {
        ...sector,
        clientCount: this.getClientsBySector(sector.id).length,
        opportunityCount: this.getOpportunitiesBySector(sector.id).length
      };
    });

    return totals;
  }

  // Save projects (for Live Projects feature)
  async saveProjects(projects) {
    this.data.projects = projects;
    // In a real implementation, this would save to file
    // For now, we'll use localStorage as fallback
    try {
      localStorage.setItem('dashboard_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not save projects to localStorage');
    }
  }

  // Load projects from localStorage if file not available
  loadProjectsFromStorage() {
    try {
      const stored = localStorage.getItem('dashboard_projects');
      if (stored) {
        this.data.projects = JSON.parse(stored);
        return this.data.projects;
      }
    } catch (e) {
      console.warn('Could not load projects from localStorage');
    }
    return [];
  }
}
