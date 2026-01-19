/**
 * Simple Hash-based Router
 * Handles navigation between views without page reloads
 */

export class Router {
  constructor(onRouteChange) {
    this.onRouteChange = onRouteChange;
    this.currentRoute = 'overall';
    this.currentParams = {};

    // Valid routes
    this.routes = [
      'overall',
      'budget',
      'sectors',
      'regions',
      'disciplines',
      'projects',
      'sources',
      'pipeline'
    ];
  }

  init() {
    // Handle hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Handle initial route
    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'overall';
    const [route, ...paramParts] = hash.split('/');

    // Validate route
    const validRoute = this.routes.includes(route) ? route : 'overall';

    // Parse params (e.g., #sectors/rail becomes { id: 'rail' })
    const params = {};
    if (paramParts.length > 0) {
      params.id = paramParts[0];
    }

    this.currentRoute = validRoute;
    this.currentParams = params;

    // Notify app of route change
    if (this.onRouteChange) {
      this.onRouteChange(validRoute, params);
    }
  }

  navigate(route, params = {}) {
    let hash = route;
    if (params.id) {
      hash += `/${params.id}`;
    }
    window.location.hash = hash;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getCurrentParams() {
    return this.currentParams;
  }
}
