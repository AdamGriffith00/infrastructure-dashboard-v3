/**
 * Infrastructure Dashboard - Main Application
 * Single-page application bootstrap
 */

import { Router } from './router.js';
import { State } from './state.js';
import { DataLoader } from './data-loader.js';
import { renderHeader } from './components/header.js';
import { renderNav } from './components/navigation.js';
import { renderFilters } from './components/filters.js';
import { renderFooter } from './components/footer.js';

// Import views
import { renderRegionsView } from './views/regions.js';
import { renderProjectsView } from './views/projects.js';
import { renderSourcesView } from './views/sources.js';
import { renderPipelineView } from './views/pipeline.js';
import { renderIntelligenceView } from './views/intelligence.js';
import { renderEventsIntelView } from './views/events-intel.js';

class App {
  constructor() {
    this.state = new State();
    this.dataLoader = new DataLoader();
    this.router = new Router(this.handleRouteChange.bind(this));

    // View renderers
    this.views = {
      'regions': renderRegionsView,
      'projects': renderProjectsView,
      'sources': renderSourcesView,
      'pipeline': renderPipelineView,
      'intelligence': renderIntelligenceView,
      'events-intel': renderEventsIntelView
    };
  }

  async init() {
    try {
      // Show loading state
      this.showLoading();

      // Load all data
      await this.dataLoader.loadAll();

      // Store data in state
      this.state.set('data', this.dataLoader.getData());
      this.state.set('lastUpdated', this.dataLoader.getLastUpdated());

      // Render app shell
      this.renderShell();

      // Initialize router (will trigger initial route)
      this.router.init();

      // Listen for filter changes
      this.state.subscribe('filters', () => this.refreshCurrentView());

      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to load dashboard data. Please try refreshing the page.');
    }
  }

  showLoading() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="flex items-center justify-center" style="min-height: 100vh;">
        <div class="text-center">
          <div class="spinner" style="margin: 0 auto 16px;"></div>
          <p class="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    `;
  }

  showError(message) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="flex items-center justify-center" style="min-height: 100vh;">
        <div class="card text-center" style="max-width: 400px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">!</div>
          <h2 style="margin-bottom: 8px;">Error</h2>
          <p class="text-muted">${message}</p>
          <button class="btn btn-primary mt-md" onclick="location.reload()">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }

  renderShell() {
    const app = document.getElementById('app');
    const data = this.state.get('data');
    const lastUpdated = this.state.get('lastUpdated');

    app.innerHTML = `
      <div class="app">
        <header class="header" id="header"></header>
        <nav class="nav" id="nav"></nav>
        <div class="filters" id="filters"></div>
        <main class="main" id="main">
          <div class="container" id="view-container"></div>
        </main>
        <footer class="footer" id="footer"></footer>
      </div>
    `;

    // Render shell components
    renderHeader(document.getElementById('header'), { lastUpdated });
    renderNav(document.getElementById('nav'), this.router.getCurrentRoute());
    renderFilters(document.getElementById('filters'), {
      regions: data.regions,
      sectors: data.sectors,
      disciplines: data.disciplines,
      currentFilters: this.state.get('filters'),
      onFilterChange: (filters) => this.state.set('filters', filters)
    });
    renderFooter(document.getElementById('footer'));
  }

  async handleRouteChange(route, params) {
    // Update nav active state
    renderNav(document.getElementById('nav'), route);

    // Render the appropriate view
    await this.renderView(route, params);
  }

  async renderView(route, params = {}) {
    const container = document.getElementById('view-container');
    const viewRenderer = this.views[route] || this.views['regions'];
    const data = this.state.get('data');
    const filters = this.state.get('filters');

    // Filter data based on current filters
    const filteredData = this.applyFilters(data, filters);

    // Support async view renderers
    await viewRenderer(container, {
      data: filteredData,
      allData: data,
      filters,
      params,
      state: this.state
    });
  }

  async refreshCurrentView() {
    const route = this.router.getCurrentRoute();
    const params = this.router.getCurrentParams();
    await this.renderView(route, params);
  }

  applyFilters(data, filters) {
    if (!filters) return data;

    let result = { ...data };

    // Filter opportunities
    if (data.opportunities) {
      result.opportunities = data.opportunities.filter(opp => {
        if (filters.region && filters.region !== 'all' && opp.region !== filters.region) {
          return false;
        }
        if (filters.sector && filters.sector !== 'all' && opp.sector !== filters.sector) {
          return false;
        }
        if (filters.discipline && filters.discipline !== 'all' && opp.discipline !== filters.discipline) {
          return false;
        }
        return true;
      });
    }

    // Filter clients
    if (data.clients) {
      result.clients = data.clients.filter(client => {
        if (filters.region && filters.region !== 'all') {
          if (!client.regions.includes(filters.region) && !client.regions.includes('national')) {
            return false;
          }
        }
        if (filters.sector && filters.sector !== 'all' && client.sector !== filters.sector) {
          return false;
        }
        return true;
      });
    }

    // Add filtered flag for UI awareness
    result.isFiltered = !!(filters.region || filters.sector || filters.discipline);
    result.activeFilters = filters;

    return result;
  }
}

// Password gate
const ACCESS_HASH = 'f08ddba4';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).slice(0, 8);
}

function showLoginScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <h1 class="login-title">UK Infrastructure Dashboard</h1>
        <p class="login-subtitle">Enter your access code to continue</p>
        <form id="login-form" class="login-form">
          <input type="password" id="login-password" class="login-input" placeholder="Access code" autocomplete="off" autofocus>
          <button type="submit" class="login-btn">Enter</button>
        </form>
        <p class="login-error" id="login-error"></p>
      </div>
    </div>
    <style>
      .login-screen {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-darker);
      }
      .login-card {
        background: var(--bg-card);
        border: 1px solid var(--border-dark);
        border-radius: 12px;
        padding: 48px 40px;
        max-width: 400px;
        width: 90%;
        text-align: center;
      }
      .login-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gleeds-yellow);
        margin-bottom: 8px;
      }
      .login-subtitle {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-bottom: 32px;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .login-input {
        background: var(--bg-input);
        border: 1px solid var(--border-dark);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 1rem;
        color: var(--text-primary);
        text-align: center;
        letter-spacing: 2px;
        outline: none;
        transition: border-color 0.2s;
      }
      .login-input:focus {
        border-color: var(--gleeds-yellow);
      }
      .login-btn {
        background: var(--gleeds-yellow);
        color: var(--text-on-yellow);
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .login-btn:hover {
        opacity: 0.9;
      }
      .login-error {
        color: var(--status-low);
        font-size: 0.85rem;
        margin-top: 16px;
        min-height: 1.2em;
      }
    </style>
  `;

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('login-password').value;
    if (simpleHash(password) === ACCESS_HASH) {
      sessionStorage.setItem('dashboard_auth', 'true');
      const dashApp = new App();
      dashApp.init();
    } else {
      document.getElementById('login-error').textContent = 'Incorrect access code';
      document.getElementById('login-password').value = '';
      document.getElementById('login-password').focus();
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('dashboard_auth') === 'true') {
    const app = new App();
    app.init();
  } else {
    showLoginScreen();
  }
});

// Export for debugging
window.DashboardApp = App;
