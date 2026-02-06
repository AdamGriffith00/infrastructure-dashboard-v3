/**
 * Navigation Component
 */

const navItems = [
  { id: 'regions', label: 'Regions', icon: '' },
  { id: 'pipeline', label: 'Pipeline', icon: '' },
  { id: 'intelligence', label: 'Bid Intelligence', icon: '' },
  { id: 'events-intel', label: 'Events & Intel', icon: '' },
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
