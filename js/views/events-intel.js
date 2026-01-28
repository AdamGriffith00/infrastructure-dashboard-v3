/**
 * Events & Client Intelligence View
 * Calendar of events and client intelligence for winning work
 */

import { formatCurrency, formatDate, getSectorColor } from '../utils/formatters.js';

// Sector color mapping for events (user requested rail = red)
const EVENT_SECTOR_COLORS = {
  'rail': '#E53935',        // Red
  'highways': '#1E88E5',    // Blue
  'aviation': '#8E24AA',    // Purple
  'maritime': '#00ACC1',    // Cyan
  'utilities': '#FB8C00',   // Orange
  'water': '#43A047',       // Green
  'energy': '#FDD835',      // Yellow
  'multi-sector': '#78909C' // Grey
};

// Industry events database
const INDUSTRY_EVENTS = [
  // Rail Events
  { id: 'evt-001', name: 'Rail Live 2026', sector: 'rail', date: '2026-06-17', endDate: '2026-06-18', location: 'Warwickshire', type: 'Exhibition', priority: 10, attendees: ['Network Rail', 'HS2', 'TOCs'], url: 'https://rail-live.com', cost: 495, description: 'UK\'s premier rail industry exhibition with live demonstrations' },
  { id: 'evt-002', name: 'Railtex 2026', sector: 'rail', date: '2026-05-12', endDate: '2026-05-14', location: 'Birmingham NEC', type: 'Exhibition', priority: 9, attendees: ['Network Rail', 'Rolling Stock Manufacturers'], url: 'https://railtex.co.uk', cost: 350, description: 'Rolling stock and rail technology exhibition' },
  { id: 'evt-003', name: 'TransCityRail North', sector: 'rail', date: '2026-11-05', location: 'Manchester', type: 'Conference', priority: 9, attendees: ['TfN', 'Network Rail NW&C', 'TfGM'], url: 'https://transcityrail.com', cost: 295, description: 'Northern rail connectivity conference' },
  { id: 'evt-004', name: 'Network Rail CP7 Supplier Day - Eastern', sector: 'rail', date: '2026-03-12', location: 'York', type: 'Supplier Day', priority: 10, attendees: ['Network Rail Eastern'], url: null, cost: 0, description: 'Eastern region framework engagement' },
  { id: 'evt-005', name: 'Network Rail CP7 Supplier Day - NW&C', sector: 'rail', date: '2026-04-08', location: 'Manchester', type: 'Supplier Day', priority: 10, attendees: ['Network Rail NW&C'], url: null, cost: 0, description: 'North West & Central framework engagement' },

  // Water Events
  { id: 'evt-006', name: 'WWT Water Industry Expo 2026', sector: 'water', date: '2026-09-15', endDate: '2026-09-16', location: 'Birmingham NEC', type: 'Exhibition', priority: 9, attendees: ['Thames Water', 'United Utilities', 'Severn Trent', 'Anglian Water'], url: 'https://wwt-expo.com', cost: 395, description: 'Water industry technology and innovation showcase' },
  { id: 'evt-007', name: 'Thames Water AMP8 Supplier Briefing', sector: 'water', date: '2026-02-20', location: 'Reading', type: 'Supplier Day', priority: 10, attendees: ['Thames Water'], url: null, cost: 0, description: 'AMP8 programme supplier engagement session' },
  { id: 'evt-008', name: 'United Utilities AMP8 Market Engagement', sector: 'water', date: '2026-03-05', location: 'Warrington', type: 'Supplier Day', priority: 10, attendees: ['United Utilities'], url: null, cost: 0, description: 'UU capital programme market engagement' },
  { id: 'evt-009', name: 'UK Water Industry Conference', sector: 'water', date: '2026-03-25', location: 'London', type: 'Conference', priority: 8, attendees: ['Ofwat', 'Water UK', 'All Water Companies'], url: 'https://water-uk.org', cost: 595, description: 'Strategic water industry conference' },

  // Highways Events
  { id: 'evt-010', name: 'Highways UK 2026', sector: 'highways', date: '2026-11-18', endDate: '2026-11-19', location: 'Birmingham NEC', type: 'Exhibition', priority: 9, attendees: ['National Highways', 'Local Authorities', 'DfT'], url: 'https://highways-uk.com', cost: 395, description: 'Highways and traffic management exhibition' },
  { id: 'evt-011', name: 'National Highways RIS3 Industry Day', sector: 'highways', date: '2026-04-22', location: 'Birmingham', type: 'Supplier Day', priority: 10, attendees: ['National Highways'], url: null, cost: 0, description: 'RIS3 programme engagement and framework briefing' },
  { id: 'evt-012', name: 'CIHT Annual Conference', sector: 'highways', date: '2026-06-10', location: 'London', type: 'Conference', priority: 7, attendees: ['Highways Professionals'], url: 'https://ciht.org.uk', cost: 450, description: 'Chartered Institution of Highways & Transportation annual event' },

  // Aviation Events
  { id: 'evt-013', name: 'AOA Annual Conference 2026', sector: 'aviation', date: '2026-11-24', location: 'London', type: 'Conference', priority: 9, attendees: ['Heathrow', 'Gatwick', 'Manchester Airports Group', 'CAA'], url: 'https://aoa.org.uk', cost: 695, description: 'Airport Operators Association strategic conference' },
  { id: 'evt-014', name: 'Heathrow Expansion Supplier Day', sector: 'aviation', date: '2026-05-14', location: 'Heathrow', type: 'Supplier Day', priority: 10, attendees: ['Heathrow Airport'], url: null, cost: 0, description: 'Third runway programme supplier engagement' },
  { id: 'evt-015', name: 'Gatwick Northern Runway Industry Day', sector: 'aviation', date: '2026-04-30', location: 'Gatwick', type: 'Supplier Day', priority: 10, attendees: ['Gatwick Airport'], url: null, cost: 0, description: 'Northern runway programme market engagement' },

  // Maritime Events
  { id: 'evt-016', name: 'UK Ports Conference 2026', sector: 'maritime', date: '2026-10-08', location: 'London', type: 'Conference', priority: 8, attendees: ['Peel Ports', 'ABP', 'DP World', 'Forth Ports'], url: 'https://ukports.org', cost: 495, description: 'British Ports Association annual conference' },
  { id: 'evt-017', name: 'Seawork 2026', sector: 'maritime', date: '2026-06-24', endDate: '2026-06-26', location: 'Southampton', type: 'Exhibition', priority: 8, attendees: ['Port Operators', 'Marine Industry'], url: 'https://seawork.com', cost: 350, description: 'Commercial marine and workboat exhibition' },
  { id: 'evt-018', name: 'Peel Ports Liverpool Freeport Event', sector: 'maritime', date: '2026-03-18', location: 'Liverpool', type: 'Supplier Day', priority: 9, attendees: ['Peel Ports'], url: null, cost: 0, description: 'Liverpool2 and Freeport investment briefing' },

  // Energy/Utilities Events
  { id: 'evt-019', name: 'All-Energy 2026', sector: 'energy', date: '2026-05-06', endDate: '2026-05-07', location: 'Glasgow SEC', type: 'Exhibition', priority: 8, attendees: ['SSE', 'ScottishPower', 'National Grid'], url: 'https://all-energy.co.uk', cost: 0, description: 'Renewable energy exhibition and conference' },
  { id: 'evt-020', name: 'Nuclear New Build Conference', sector: 'energy', date: '2026-09-22', location: 'Bristol', type: 'Conference', priority: 9, attendees: ['EDF', 'Hinkley Point C', 'Sizewell C'], url: null, cost: 550, description: 'Nuclear new build industry conference' },
  { id: 'evt-021', name: 'Offshore Wind Conference', sector: 'energy', date: '2026-06-03', location: 'Aberdeen', type: 'Conference', priority: 8, attendees: ['ScotWind Developers', 'Crown Estate Scotland'], url: null, cost: 450, description: 'ScotWind and offshore wind industry event' },

  // Multi-sector Events
  { id: 'evt-022', name: 'UK Infrastructure Show 2026', sector: 'multi-sector', date: '2026-04-15', location: 'London ExCeL', type: 'Exhibition', priority: 9, attendees: ['IPA', 'DfT', 'Major Project Sponsors'], url: 'https://ukinfrastructureshow.com', cost: 495, description: 'Cross-sector infrastructure exhibition' },
  { id: 'evt-023', name: 'Infrastructure Intelligence Summit', sector: 'multi-sector', date: '2026-02-12', location: 'London', type: 'Conference', priority: 8, attendees: ['Industry Leaders', 'Government'], url: 'https://infrastructure-intelligence.com', cost: 395, description: 'Strategic infrastructure leadership summit' },
  { id: 'evt-024', name: 'RICS Infrastructure Conference', sector: 'multi-sector', date: '2026-10-22', location: 'London', type: 'Conference', priority: 7, attendees: ['RICS Members', 'Surveyors'], url: 'https://rics.org', cost: 350, description: 'RICS infrastructure and construction conference' }
];

// Client intelligence database with contact patterns
const CLIENT_INTELLIGENCE = {
  'network-rail': {
    name: 'Network Rail',
    emailFormat: 'firstname.lastname@networkrail.co.uk',
    linkedinPattern: 'https://linkedin.com/company/network-rail',
    keyRoles: ['Commercial Director', 'Programme Director', 'Route Director', 'Capital Delivery Director'],
    procurementPortal: 'https://www.networkrail.co.uk/who-we-are/doing-business-with-network-rail/',
    tenderPortal: 'Find a Tender',
    intel: 'CP7 framework engagement ongoing. Focus on early contractor involvement. NEC4 standard.',
    relationshipTips: ['Attend regional supplier days', 'Build relationships with route commercial teams', 'Focus on GRIP process knowledge']
  },
  'hs2': {
    name: 'HS2 Ltd',
    emailFormat: 'firstname.lastname@hs2.org.uk',
    linkedinPattern: 'https://linkedin.com/company/hs2-ltd',
    keyRoles: ['Commercial Director', 'Phase Director', 'Delivery Director', 'Project Director'],
    procurementPortal: 'https://www.hs2.org.uk/building-hs2/suppliers/',
    tenderPortal: 'HS2 Supplier Portal',
    intel: 'Phase 1 main works ongoing. Opportunities in Phase 2a professional services. High security clearance requirements.',
    relationshipTips: ['Register on HS2 supplier portal', 'Tier 1 contractor introductions valuable', 'Emphasise mega-project experience']
  },
  'thames-water': {
    name: 'Thames Water',
    emailFormat: 'firstname.lastname@thameswater.co.uk',
    linkedinPattern: 'https://linkedin.com/company/thames-water',
    keyRoles: ['Head of Commercial', 'Programme Director', 'Director of Capital Delivery', 'Chief Engineer'],
    procurementPortal: 'https://www.thameswater.co.uk/about-us/working-with-us',
    tenderPortal: 'Thames Water Supplier Portal',
    intel: 'AMP8 programme starting 2025. Financial challenges - focus on efficiency and value. Competitive dialogue common.',
    relationshipTips: ['Demonstrate AMP experience', 'Focus on efficiency and cost certainty', 'Understand Ofwat regulatory context']
  },
  'united-utilities': {
    name: 'United Utilities',
    emailFormat: 'firstname.lastname@uuplc.co.uk',
    linkedinPattern: 'https://linkedin.com/company/united-utilities',
    keyRoles: ['Head of Capital Delivery', 'Commercial Manager', 'Programme Manager', 'Director of Asset Management'],
    procurementPortal: 'https://www.unitedutilities.com/corporate/about-us/our-suppliers/',
    tenderPortal: 'UU Supplier Portal',
    intel: 'AMP8 £13.7bn programme. Strong alliance model. Focus on northwest regional suppliers.',
    relationshipTips: ['Emphasise regional presence', 'Alliance experience valued', 'Attend Warrington events']
  },
  'national-highways': {
    name: 'National Highways',
    emailFormat: 'firstname.lastname@nationalhighways.co.uk',
    linkedinPattern: 'https://linkedin.com/company/national-highways',
    keyRoles: ['Regional Director', 'Commercial Director', 'SRO', 'Programme Director'],
    procurementPortal: 'https://nationalhighways.co.uk/suppliers/',
    tenderPortal: 'Find a Tender / NEPO Portal',
    intel: 'RIS3 2025-2030 investment. Regional delivery model. Strong focus on PSCM process.',
    relationshipTips: ['Understand PSCM procurement', 'Regional relationship building', 'Attend RIS3 industry days']
  },
  'heathrow': {
    name: 'Heathrow Airport',
    emailFormat: 'firstname.lastname@heathrow.com',
    linkedinPattern: 'https://linkedin.com/company/heathrow-airport',
    keyRoles: ['Expansion Programme Director', 'Capital Projects Director', 'Commercial Director', 'Head of Procurement'],
    procurementPortal: 'https://www.heathrow.com/company/partners-and-suppliers',
    tenderPortal: 'Heathrow Supplier Portal',
    intel: 'Third runway DCO process. Major expansion programme. Airside experience critical.',
    relationshipTips: ['Airport operational experience essential', 'Security clearance required', 'Emphasise CAA relationship']
  },
  'gatwick': {
    name: 'Gatwick Airport',
    emailFormat: 'firstname.lastname@gatwickairport.com',
    linkedinPattern: 'https://linkedin.com/company/gatwick-airport',
    keyRoles: ['Capital Projects Director', 'Commercial Manager', 'Programme Director'],
    procurementPortal: 'https://www.gatwickairport.com/business-community/suppliers/',
    tenderPortal: 'Gatwick Supplier Portal',
    intel: 'Northern runway DCO approved. Major capital programme launching. Live airport delivery experience valued.',
    relationshipTips: ['DCO experience valuable', 'Understand live airport constraints', 'Attend supplier briefings']
  },
  'tfl': {
    name: 'Transport for London',
    emailFormat: 'firstname.lastname@tfl.gov.uk',
    linkedinPattern: 'https://linkedin.com/company/transport-for-london',
    keyRoles: ['Director of Major Projects', 'Commercial Director', 'Head of Procurement', 'Programme Director'],
    procurementPortal: 'https://tfl.gov.uk/corporate/publications-and-reports/doing-business-with-tfl',
    tenderPortal: 'TfL Supplier Portal',
    intel: 'Framework-based procurement. Major rolling stock investment. Underground experience highly valued.',
    relationshipTips: ['Get on TfL frameworks', 'London Underground experience critical', 'Understand TfL commercial process']
  },
  'peel-ports': {
    name: 'Peel Ports Group',
    emailFormat: 'firstname.lastname@peelports.com',
    linkedinPattern: 'https://linkedin.com/company/peel-ports',
    keyRoles: ['Development Director', 'Commercial Director', 'Port Director', 'Head of Projects'],
    procurementPortal: 'https://www.peelports.com/',
    tenderPortal: 'Direct engagement',
    intel: 'Liverpool2 expansion. Freeport development. Strong relationship-based procurement.',
    relationshipTips: ['Relationship-driven client', 'Freeport knowledge valuable', 'Liverpool regional presence important']
  },
  'scottish-water': {
    name: 'Scottish Water',
    emailFormat: 'firstname.lastname@scottishwater.co.uk',
    linkedinPattern: 'https://linkedin.com/company/scottish-water',
    keyRoles: ['Capital Investment Director', 'Programme Manager', 'Commercial Manager', 'Alliance Director'],
    procurementPortal: 'https://www.scottishwater.co.uk/business-and-developers/procurement',
    tenderPortal: 'Public Contracts Scotland',
    intel: 'SR27 regulatory period approaching. Alliance delivery model. Scottish presence important.',
    relationshipTips: ['Understand WICS regulation', 'Scottish supply chain preference', 'Alliance experience valued']
  }
};

export function renderEventsIntelView(container, { data, allData, filters }) {
  const opportunities = data.opportunities || [];
  const clients = allData.clients || [];

  // Get events relevant to opportunities
  const relevantEvents = getRelevantEvents(opportunities);
  const upcomingEvents = getUpcomingEvents();
  const clientIntel = getClientIntelligence(opportunities, clients);

  // Calculate KPIs
  const totalEvents = upcomingEvents.length;
  const mustAttendEvents = upcomingEvents.filter(e => e.priority >= 9).length;
  const supplierDays = upcomingEvents.filter(e => e.type === 'Supplier Day').length;
  const uniqueClients = new Set(opportunities.map(o => o.client)).size;

  container.innerHTML = `
    <div class="events-intel-view">
      <div class="view-header">
        <h1 class="view-title">Events & Client Intelligence</h1>
        <p class="view-subtitle">Industry events calendar and client relationship intelligence to help win work</p>
      </div>

      <!-- KPI Grid -->
      <section class="section">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Upcoming Events</div>
            <div class="kpi-value">${totalEvents}</div>
            <div class="kpi-note">Next 12 months</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Must Attend</div>
            <div class="kpi-value">${mustAttendEvents}</div>
            <div class="kpi-note">Priority 9-10</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Supplier Days</div>
            <div class="kpi-value">${supplierDays}</div>
            <div class="kpi-note">Client engagement</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Target Clients</div>
            <div class="kpi-value">${uniqueClients}</div>
            <div class="kpi-note">From opportunities</div>
          </div>
        </div>
      </section>

      <!-- Sector Legend -->
      <section class="section">
        <div class="sector-legend">
          <span class="legend-label">Sector Colours:</span>
          ${Object.entries(EVENT_SECTOR_COLORS).map(([sector, color]) => `
            <span class="legend-item">
              <span class="legend-dot" style="background-color: ${color}"></span>
              ${sector.charAt(0).toUpperCase() + sector.slice(1)}
            </span>
          `).join('')}
        </div>
      </section>

      <!-- Events Calendar -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Events Calendar</h2>
          <div class="btn-group">
            <button class="btn btn-active" data-filter="all">All Events</button>
            <button class="btn" data-filter="supplier">Supplier Days</button>
            <button class="btn" data-filter="conference">Conferences</button>
            <button class="btn" data-filter="exhibition">Exhibitions</button>
          </div>
        </div>
        <div class="events-calendar" id="events-calendar">
          ${renderEventsCalendar(upcomingEvents)}
        </div>
      </section>

      <!-- Opportunity-Linked Events -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Events Linked to Active Opportunities</h2>
        </div>
        <div class="opportunity-events-grid">
          ${renderOpportunityEvents(opportunities, upcomingEvents)}
        </div>
      </section>

      <!-- Client Intelligence -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Client Intelligence</h2>
          <p class="section-subtitle">Contact patterns and relationship tips for target clients</p>
        </div>
        <div class="client-intel-grid" id="client-intel-grid">
          ${renderClientIntelligence(clientIntel)}
        </div>
      </section>

      <!-- Bid Deadlines Timeline -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Bid Deadlines & Event Alignment</h2>
        </div>
        <div class="deadlines-timeline">
          ${renderDeadlinesTimeline(opportunities, upcomingEvents)}
        </div>
      </section>
    </div>
  `;

  setupEventListeners(container);
}

function getUpcomingEvents() {
  const today = new Date();
  const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  return INDUSTRY_EVENTS
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= oneYearFromNow;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getRelevantEvents(opportunities) {
  const sectors = new Set(opportunities.map(o => o.sector));
  return INDUSTRY_EVENTS.filter(event =>
    sectors.has(event.sector) || event.sector === 'multi-sector'
  );
}

function getClientIntelligence(opportunities, clients) {
  const clientIds = new Set(opportunities.map(o => o.client));
  const intel = [];

  clientIds.forEach(clientId => {
    // Match client ID to intel database
    const intelKey = Object.keys(CLIENT_INTELLIGENCE).find(key =>
      clientId.toLowerCase().includes(key.replace('-', '')) ||
      key.includes(clientId.toLowerCase().split('-')[0])
    );

    if (intelKey) {
      const clientData = clients.find(c => c.id === clientId);
      intel.push({
        ...CLIENT_INTELLIGENCE[intelKey],
        clientId,
        clientData,
        opportunities: opportunities.filter(o => o.client === clientId)
      });
    } else {
      // Generic intel for unknown clients
      const clientData = clients.find(c => c.id === clientId);
      if (clientData) {
        intel.push({
          name: clientData.name,
          clientId,
          clientData,
          opportunities: opportunities.filter(o => o.client === clientId),
          emailFormat: 'firstname.lastname@[domain]',
          keyRoles: ['Commercial Director', 'Programme Director'],
          procurementPortal: 'Find a Tender',
          intel: 'Research required',
          relationshipTips: ['Research client structure', 'Identify key contacts', 'Monitor tender portal']
        });
      }
    }
  });

  return intel;
}

function renderEventsCalendar(events) {
  // Group by month
  const eventsByMonth = {};
  events.forEach(event => {
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = { name: monthName, events: [] };
    }
    eventsByMonth[monthKey].events.push(event);
  });

  return Object.entries(eventsByMonth).map(([key, month]) => `
    <div class="calendar-month">
      <h3 class="month-header">${month.name}</h3>
      <div class="month-events">
        ${month.events.map(event => `
          <div class="event-card" data-type="${event.type.toLowerCase().replace(' ', '-')}" data-sector="${event.sector}">
            <div class="event-date-badge" style="background-color: ${EVENT_SECTOR_COLORS[event.sector] || '#888'}">
              <span class="event-day">${new Date(event.date).getDate()}</span>
              <span class="event-month-abbr">${new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
            </div>
            <div class="event-details">
              <div class="event-name">${event.name}</div>
              <div class="event-meta">
                <span class="event-location">${event.location}</span>
                <span class="event-type-badge badge-${event.type.toLowerCase().replace(' ', '-')}">${event.type}</span>
                ${event.priority >= 9 ? '<span class="badge badge-high">Must Attend</span>' : ''}
              </div>
              <div class="event-description text-muted">${event.description}</div>
              <div class="event-attendees">
                <span class="attendees-label">Key attendees:</span>
                ${event.attendees.map(a => `<span class="attendee-tag">${a}</span>`).join('')}
              </div>
              <div class="event-actions">
                ${event.url ? `<a href="${event.url}" target="_blank" class="btn btn-sm">Register</a>` : ''}
                ${event.cost > 0 ? `<span class="event-cost">£${event.cost}</span>` : '<span class="event-cost free">Free</span>'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderOpportunityEvents(opportunities, events) {
  const activeOpps = opportunities.filter(o =>
    ['planning', 'pre-procurement', 'procurement'].includes(o.status)
  );

  if (activeOpps.length === 0) {
    return '<p class="text-muted">No active opportunities to match with events.</p>';
  }

  return activeOpps.slice(0, 10).map(opp => {
    const relevantEvents = events.filter(e =>
      e.sector === opp.sector ||
      e.attendees.some(a => opp.client.includes(a.toLowerCase().replace(' ', '-')))
    ).slice(0, 3);

    return `
      <div class="opp-event-card">
        <div class="opp-event-header" style="border-left-color: ${EVENT_SECTOR_COLORS[opp.sector] || '#888'}">
          <div class="opp-title">${opp.title}</div>
          <div class="opp-meta">
            <span class="badge badge-${opp.sector}">${opp.sector}</span>
            <span class="text-muted">${formatCurrency(opp.value)}</span>
            ${opp.bidDeadline ? `<span class="deadline-tag">Deadline: ${formatDate(opp.bidDeadline)}</span>` : ''}
          </div>
        </div>
        <div class="opp-related-events">
          ${relevantEvents.length > 0 ? relevantEvents.map(e => `
            <div class="mini-event">
              <span class="mini-event-dot" style="background-color: ${EVENT_SECTOR_COLORS[e.sector]}"></span>
              <span class="mini-event-date">${formatDate(e.date)}</span>
              <span class="mini-event-name">${e.name}</span>
              <span class="mini-event-type">${e.type}</span>
            </div>
          `).join('') : '<p class="text-muted">No directly related events found</p>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderClientIntelligence(clientIntel) {
  if (clientIntel.length === 0) {
    return '<p class="text-muted">No client intelligence available for current opportunities.</p>';
  }

  return clientIntel.map(client => `
    <div class="client-intel-card">
      <div class="client-intel-header">
        <h3 class="client-name">${client.name}</h3>
        <span class="opp-count">${client.opportunities?.length || 0} opportunities</span>
      </div>

      <div class="intel-section">
        <h4 class="intel-label">Contact Patterns</h4>
        <div class="contact-patterns">
          <div class="pattern-item">
            <span class="pattern-icon">@</span>
            <span class="pattern-value">${client.emailFormat || 'Unknown'}</span>
          </div>
          ${client.linkedinPattern ? `
            <div class="pattern-item">
              <span class="pattern-icon">in</span>
              <a href="${client.linkedinPattern}" target="_blank" class="pattern-value linkedin-link">LinkedIn Company Page</a>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="intel-section">
        <h4 class="intel-label">Key Roles to Target</h4>
        <div class="key-roles">
          ${(client.keyRoles || []).map(role => `<span class="role-tag">${role}</span>`).join('')}
        </div>
      </div>

      <div class="intel-section">
        <h4 class="intel-label">Procurement Portal</h4>
        <div class="portal-info">
          ${client.procurementPortal ? `
            <a href="${client.procurementPortal}" target="_blank" class="portal-link">${client.procurementPortal.replace('https://', '').split('/')[0]}</a>
          ` : '<span class="text-muted">Not available</span>'}
          ${client.tenderPortal ? `<span class="tender-portal">${client.tenderPortal}</span>` : ''}
        </div>
      </div>

      <div class="intel-section">
        <h4 class="intel-label">Intelligence</h4>
        <p class="intel-text">${client.intel || 'No intelligence available'}</p>
      </div>

      <div class="intel-section">
        <h4 class="intel-label">Relationship Tips</h4>
        <ul class="tips-list">
          ${(client.relationshipTips || []).map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>

      ${client.opportunities && client.opportunities.length > 0 ? `
        <div class="intel-section">
          <h4 class="intel-label">Active Opportunities</h4>
          <div class="client-opps">
            ${client.opportunities.slice(0, 3).map(opp => `
              <div class="mini-opp">
                <span class="mini-opp-title">${opp.title}</span>
                <span class="mini-opp-value">${formatCurrency(opp.value)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderDeadlinesTimeline(opportunities, events) {
  // Combine bid deadlines and events for the next 6 months
  const today = new Date();
  const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

  const items = [];

  // Add bid deadlines
  opportunities
    .filter(o => o.bidDeadline)
    .forEach(opp => {
      const deadline = new Date(opp.bidDeadline);
      if (deadline >= today && deadline <= sixMonthsFromNow) {
        items.push({
          date: opp.bidDeadline,
          type: 'deadline',
          title: opp.title,
          sector: opp.sector,
          value: opp.value,
          client: opp.client
        });
      }
    });

  // Add events
  events.forEach(event => {
    const eventDate = new Date(event.date);
    if (eventDate >= today && eventDate <= sixMonthsFromNow && event.priority >= 8) {
      items.push({
        date: event.date,
        type: 'event',
        title: event.name,
        sector: event.sector,
        eventType: event.type,
        location: event.location
      });
    }
  });

  // Sort by date
  items.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (items.length === 0) {
    return '<p class="text-muted">No deadlines or priority events in the next 6 months.</p>';
  }

  return `
    <div class="timeline">
      ${items.map((item, index) => `
        <div class="timeline-item ${item.type}">
          <div class="timeline-marker" style="background-color: ${EVENT_SECTOR_COLORS[item.sector] || '#888'}"></div>
          <div class="timeline-content">
            <div class="timeline-date">${formatDate(item.date)}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-meta">
              ${item.type === 'deadline' ? `
                <span class="badge badge-deadline">Bid Deadline</span>
                <span class="text-muted">${formatCurrency(item.value)}</span>
              ` : `
                <span class="badge badge-event">${item.eventType}</span>
                <span class="text-muted">${item.location}</span>
              `}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function setupEventListeners(container) {
  // Event type filter buttons
  container.querySelectorAll('.btn-group .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;

      // Update active state
      container.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('btn-active'));
      e.target.classList.add('btn-active');

      // Filter events
      const eventCards = container.querySelectorAll('.event-card');
      eventCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else {
          const cardType = card.dataset.type;
          card.style.display = cardType === filter ? 'flex' : 'none';
        }
      });
    });
  });
}
