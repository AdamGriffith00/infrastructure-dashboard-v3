/**
 * Navigation Component
 */

const navItems = [
  { id: 'overall', label: 'Overall', icon: '' },
  { id: 'budget', label: 'Budget Summary', icon: '' },
  { id: 'pipeline', label: 'Pipeline', icon: '' },
  { id: 'intelligence', label: 'Bid Intelligence', icon: '' },
  { id: 'events-intel', label: 'Events & Intel', icon: '' },
  { id: 'sectors', label: 'Sectors', icon: '' },
  { id: 'regions', label: 'Regions', icon: '' },
  { id: 'disciplines', label: 'Disciplines', icon: '' },
  { id: 'projects', label: 'Live Projects', icon: '' },
  { id: 'sources', label: 'Data Sources', icon: '' }
];

export function renderNav(container, currentRoute) {
  container.innerHTML = navItems.map(item => `
    <a
      href="#${item.id}"
      class="main-tab ${currentRoute === item.id ? 'active' : ''}"
      data-route="${item.id}"
    >
      ${item.label}
    </a>
  `).join('');
}
