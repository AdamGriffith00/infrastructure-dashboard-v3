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

  // Multi-sector Events
  { id: 'evt-022', name: 'UK Infrastructure Show 2026', sector: 'multi-sector', date: '2026-04-15', location: 'London ExCeL', type: 'Exhibition', priority: 9, attendees: ['IPA', 'DfT', 'Major Project Sponsors'], url: 'https://ukinfrastructureshow.com', cost: 495, description: 'Cross-sector infrastructure exhibition' },
  { id: 'evt-023', name: 'Infrastructure Intelligence Summit', sector: 'multi-sector', date: '2026-02-12', location: 'London', type: 'Conference', priority: 8, attendees: ['Industry Leaders', 'Government'], url: 'https://infrastructure-intelligence.com', cost: 395, description: 'Strategic infrastructure leadership summit' },
  { id: 'evt-024', name: 'RICS Infrastructure Conference', sector: 'multi-sector', date: '2026-10-22', location: 'London', type: 'Conference', priority: 7, attendees: ['RICS Members', 'Surveyors'], url: 'https://rics.org', cost: 350, description: 'RICS infrastructure and construction conference' }
];

// Client intelligence database with contact patterns and known contacts
const CLIENT_INTELLIGENCE = {
  'network-rail': {
    name: 'Network Rail',
    emailFormat: 'firstname.lastname@networkrail.co.uk',
    linkedinPattern: 'https://linkedin.com/company/network-rail',
    keyRoles: ['Commercial Director', 'Programme Director', 'Route Director', 'Capital Delivery Director'],
    knownContacts: [
      { name: 'Andrew Haines', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/andrew-haines-cbe' },
      { name: 'Andy Haynes', title: 'Group Contracts & Procurement Director', linkedin: 'https://linkedin.com/in/andy-haynes' },
      { name: 'Jeremy Westlake', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Ed Akers', title: 'Director, Major Programme Sponsorship', linkedin: 'https://linkedin.com/in/ed-akers' },
      { name: 'Paul Rutter', title: 'Route Director, North West & Central', linkedin: 'https://linkedin.com/in/paul-rutter' },
      { name: 'Rob McIntosh', title: 'Route Director, Eastern', linkedin: 'https://linkedin.com/in/rob-mcintosh' }
    ],
    procurementPortal: 'https://www.networkrail.co.uk/who-we-are/doing-business-with-network-rail/',
    tenderPortal: 'Find a Tender',
    intel: 'CP7 framework engagement ongoing. Focus on early contractor involvement. NEC4 standard. £44bn investment 2024-2029.',
    relationshipTips: ['Attend regional supplier days', 'Build relationships with route commercial teams', 'Focus on GRIP process knowledge', 'CP7 emphasis on efficiency and reliability']
  },
  'hs2': {
    name: 'HS2 Ltd',
    emailFormat: 'firstname.lastname@hs2.org.uk',
    linkedinPattern: 'https://linkedin.com/company/hs2-ltd',
    keyRoles: ['Commercial Director', 'Phase Director', 'Delivery Director', 'Project Director'],
    knownContacts: [
      { name: 'Mark Wild', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/mark-wild' },
      { name: 'Alan Foster', title: 'Chief Financial Officer', linkedin: null },
      { name: 'David Emerson', title: 'Chief Operating Officer', linkedin: null },
      { name: 'Ruth Todd', title: 'Commercial Director', linkedin: 'https://linkedin.com/in/ruth-todd' },
      { name: 'Michael Bradley', title: 'Phase One Delivery Director', linkedin: null }
    ],
    procurementPortal: 'https://www.hs2.org.uk/building-hs2/suppliers/',
    tenderPortal: 'HS2 Supplier Portal',
    intel: 'Phase 1 main works ongoing to Euston. Phase 2a cancelled - focus on Phase 1 completion. High security clearance requirements.',
    relationshipTips: ['Register on HS2 supplier portal', 'Tier 1 contractor introductions valuable', 'Emphasise mega-project experience', 'Station fit-out opportunities emerging']
  },
  'thames-water': {
    name: 'Thames Water',
    emailFormat: 'firstname.lastname@thameswater.co.uk',
    linkedinPattern: 'https://linkedin.com/company/thames-water',
    keyRoles: ['Head of Commercial', 'Programme Director', 'Director of Capital Delivery', 'Chief Engineer'],
    knownContacts: [
      { name: 'Chris Weston', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/chris-weston' },
      { name: 'Julian Mayfield', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Julian Gething', title: 'Chief Restructuring Officer', linkedin: 'https://linkedin.com/in/julian-gething' },
      { name: 'Alastair Cochran', title: 'Chief Customer Officer', linkedin: null },
      { name: 'Mark Field', title: 'Director of Asset Strategy', linkedin: null }
    ],
    procurementPortal: 'https://www.thameswater.co.uk/about-us/working-with-us',
    tenderPortal: 'Thames Water Supplier Portal',
    intel: 'AMP8 £19.8bn programme. Financial challenges ongoing - restructuring underway. Focus on efficiency and value. Competitive dialogue common.',
    relationshipTips: ['Demonstrate AMP experience', 'Focus on efficiency and cost certainty', 'Understand Ofwat regulatory context', 'Financial stability being monitored']
  },
  'united-utilities': {
    name: 'United Utilities',
    emailFormat: 'firstname.lastname@uuplc.co.uk',
    linkedinPattern: 'https://linkedin.com/company/united-utilities',
    keyRoles: ['Head of Capital Delivery', 'Commercial Manager', 'Programme Manager', 'Director of Asset Management'],
    knownContacts: [
      { name: 'Louise Beardmore', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/louise-beardmore' },
      { name: 'Phil Aspin', title: 'Chief Financial Officer', linkedin: 'https://linkedin.com/in/phil-aspin' },
      { name: 'Matt Hemmings', title: 'Chief Operating Officer', linkedin: null },
      { name: 'James Bullock', title: 'Wholesale Market Director', linkedin: null },
      { name: 'Gaynor Kenyon', title: 'Communications Director', linkedin: 'https://linkedin.com/in/gaynor-kenyon' }
    ],
    procurementPortal: 'https://www.unitedutilities.com/corporate/about-us/our-suppliers/',
    tenderPortal: 'UU Supplier Portal',
    intel: 'AMP8 £13.7bn programme. Strong alliance model. Focus on northwest regional suppliers. Capital Alliance well established.',
    relationshipTips: ['Emphasise regional presence', 'Alliance experience valued', 'Attend Warrington events', 'Integrated supply chain approach']
  },
  'national-highways': {
    name: 'National Highways',
    emailFormat: 'firstname.lastname@nationalhighways.co.uk',
    linkedinPattern: 'https://linkedin.com/company/national-highways',
    keyRoles: ['Regional Director', 'Commercial Director', 'SRO', 'Programme Director'],
    knownContacts: [
      { name: 'Nick Harris', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/nick-harris' },
      { name: 'Nicola Bell', title: 'Executive Director, Major Projects', linkedin: 'https://linkedin.com/in/nicola-bell' },
      { name: 'Martin Fellows', title: 'Executive Director, Operations', linkedin: null },
      { name: 'Elliot Shaw', title: 'Executive Director, Strategy & Planning', linkedin: null },
      { name: 'Susan Sheridan', title: 'General Counsel', linkedin: null },
      { name: 'Duncan Smith', title: 'Regional Director, South West', linkedin: null }
    ],
    procurementPortal: 'https://nationalhighways.co.uk/suppliers/',
    tenderPortal: 'Find a Tender / NEPO Portal',
    intel: 'RIS3 2025-2030 £24bn investment. Regional delivery model. Strong focus on PSCM process. Lower Thames Crossing major opportunity.',
    relationshipTips: ['Understand PSCM procurement', 'Regional relationship building', 'Attend RIS3 industry days', 'Framework positions critical']
  },
  'heathrow': {
    name: 'Heathrow Airport',
    emailFormat: 'firstname.lastname@heathrow.com',
    linkedinPattern: 'https://linkedin.com/company/heathrow-airport',
    keyRoles: ['Expansion Programme Director', 'Capital Projects Director', 'Commercial Director', 'Head of Procurement'],
    knownContacts: [
      { name: 'Thomas Woldbye', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/thomas-woldbye' },
      { name: 'Javier Echave', title: 'Chief Operating Officer', linkedin: null },
      { name: 'Sally Ding', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Emma Gilthorpe', title: 'Chief Operations Officer', linkedin: 'https://linkedin.com/in/emma-gilthorpe' },
      { name: 'Phil Wilbraham', title: 'Expansion Programme Director', linkedin: 'https://linkedin.com/in/phil-wilbraham' }
    ],
    procurementPortal: 'https://www.heathrow.com/company/partners-and-suppliers',
    tenderPortal: 'Heathrow Supplier Portal',
    intel: 'Third runway expansion £14bn programme. DCO process ongoing. Major terminal enhancement underway. Airside experience critical.',
    relationshipTips: ['Airport operational experience essential', 'Security clearance required', 'Emphasise CAA relationship', 'T2 and T5 expansion opportunities']
  },
  'gatwick': {
    name: 'Gatwick Airport',
    emailFormat: 'firstname.lastname@gatwickairport.com',
    linkedinPattern: 'https://linkedin.com/company/gatwick-airport',
    keyRoles: ['Capital Projects Director', 'Commercial Manager', 'Programme Director'],
    knownContacts: [
      { name: 'Stewart Wingate', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/stewart-wingate' },
      { name: 'Tim Norwood', title: 'Chief Planning Officer', linkedin: null },
      { name: 'Jonathan Pollard', title: 'Chief Commercial Officer', linkedin: null },
      { name: 'Julia Simpson', title: 'Chief Financial Officer', linkedin: null }
    ],
    procurementPortal: 'https://www.gatwickairport.com/business-community/suppliers/',
    tenderPortal: 'Gatwick Supplier Portal',
    intel: 'Northern runway DCO approved July 2024. £8.5bn capital programme. Live airport delivery experience valued. VINCI Airports ownership.',
    relationshipTips: ['DCO experience valuable', 'Understand live airport constraints', 'Attend supplier briefings', 'Northern runway programme ramping up']
  },
  'tfl': {
    name: 'Transport for London',
    emailFormat: 'firstname.lastname@tfl.gov.uk',
    linkedinPattern: 'https://linkedin.com/company/transport-for-london',
    keyRoles: ['Director of Major Projects', 'Commercial Director', 'Head of Procurement', 'Programme Director'],
    knownContacts: [
      { name: 'Andy Lord', title: 'Commissioner', linkedin: 'https://linkedin.com/in/andy-lord' },
      { name: 'Rachel McLean', title: 'Chief Finance Officer', linkedin: null },
      { name: 'Glynn Maybank', title: 'Chief Capital Officer', linkedin: null },
      { name: 'Stuart Harvey', title: 'Director of Major Projects', linkedin: 'https://linkedin.com/in/stuart-harvey' },
      { name: 'Shashi Verma', title: 'Chief Technology Officer', linkedin: null },
      { name: 'Lilli Sherwood', title: 'Director of Procurement & Contracts', linkedin: null }
    ],
    procurementPortal: 'https://tfl.gov.uk/corporate/publications-and-reports/doing-business-with-tfl',
    tenderPortal: 'TfL Supplier Portal',
    intel: 'Framework-based procurement. £12.8bn capital programme. Piccadilly line upgrade major project. Underground experience highly valued.',
    relationshipTips: ['Get on TfL frameworks', 'London Underground experience critical', 'Understand TfL commercial process', 'Elizabeth line lessons learned']
  },
  'peel-ports': {
    name: 'Peel Ports Group',
    emailFormat: 'firstname.lastname@peelports.com',
    linkedinPattern: 'https://linkedin.com/company/peel-ports',
    keyRoles: ['Development Director', 'Commercial Director', 'Port Director', 'Head of Projects'],
    knownContacts: [
      { name: 'Claudio Veritiero', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/claudio-veritiero' },
      { name: 'Jason Clark', title: 'Group Financial Officer', linkedin: null },
      { name: 'David Huck', title: 'Port Director, Liverpool', linkedin: null },
      { name: 'Jim O\'Toole', title: 'Chief Executive, Peel L&P', linkedin: null }
    ],
    procurementPortal: 'https://www.peelports.com/',
    tenderPortal: 'Direct engagement',
    intel: 'Liverpool2 expansion £3.5bn programme. Freeport development ongoing. Strong relationship-based procurement. Manchester Ship Canal investment.',
    relationshipTips: ['Relationship-driven client', 'Freeport knowledge valuable', 'Liverpool regional presence important', 'Green ports initiative focus']
  },
  'scottish-water': {
    name: 'Scottish Water',
    emailFormat: 'firstname.lastname@scottishwater.co.uk',
    linkedinPattern: 'https://linkedin.com/company/scottish-water',
    keyRoles: ['Capital Investment Director', 'Programme Manager', 'Commercial Manager', 'Alliance Director'],
    knownContacts: [
      { name: 'Alex Plant', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/alex-plant' },
      { name: 'Peter Farrer', title: 'Chief Operating Officer', linkedin: null },
      { name: 'Alan Dingwall', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Brian Lironi', title: 'Director of Corporate Affairs', linkedin: null },
      { name: 'Belinda Oldfield', title: 'Non-Executive Director', linkedin: null }
    ],
    procurementPortal: 'https://www.scottishwater.co.uk/business-and-developers/procurement',
    tenderPortal: 'Public Contracts Scotland',
    intel: 'SR27 regulatory period approaching. Alliance delivery model. £6.8bn capital programme. Scottish presence important. Net zero commitments.',
    relationshipTips: ['Understand WICS regulation', 'Scottish supply chain preference', 'Alliance experience valued', 'Sustainability credentials important']
  },
  'severn-trent': {
    name: 'Severn Trent Water',
    emailFormat: 'firstname.lastname@severntrent.co.uk',
    linkedinPattern: 'https://linkedin.com/company/severn-trent',
    keyRoles: ['Capital Delivery Director', 'Commercial Director', 'Programme Director'],
    knownContacts: [
      { name: 'Liv Sherwood', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/liv-garfield' },
      { name: 'James Bowling', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Neil Mayling', title: 'Chief Operating Officer', linkedin: null },
      { name: 'Sarah Sherwin', title: 'Strategy and Regulation Director', linkedin: null }
    ],
    procurementPortal: 'https://www.severntrent.com/about-us/suppliers/',
    tenderPortal: 'Severn Trent Supplier Portal',
    intel: 'AMP8 £12.9bn programme. Midlands focused. Strong environmental focus. Alliance delivery model well-established.',
    relationshipTips: ['Regional presence valued', 'Environmental credentials important', 'Alliance experience essential', 'Tripling capital investment']
  },
  'anglian-water': {
    name: 'Anglian Water',
    emailFormat: 'firstname.lastname@anglianwater.co.uk',
    linkedinPattern: 'https://linkedin.com/company/anglian-water',
    keyRoles: ['Capital Delivery Director', 'Commercial Manager', 'Programme Director'],
    knownContacts: [
      { name: 'Peter Simpson', title: 'Chief Executive Officer', linkedin: 'https://linkedin.com/in/peter-simpson' },
      { name: 'Steve Buck', title: 'Chief Financial Officer', linkedin: null },
      { name: 'Alex Plant', title: 'Managing Director, Water Services', linkedin: null },
      { name: 'Susannah Mayfield', title: 'Director of Communications', linkedin: null }
    ],
    procurementPortal: 'https://www.anglianwater.co.uk/about-us/our-suppliers/',
    tenderPortal: 'Anglian Water Supplier Portal',
    intel: 'AMP8 £9.5bn programme. Driest region - water resources focus. Strategic Pipeline Alliance major project. Strong sustainability agenda.',
    relationshipTips: ['Eastern regional focus', 'Water resources expertise valued', 'Alliance experience important', 'Net zero by 2030 target']
  },
  'manchester-airports-group': {
    name: 'Manchester Airports Group',
    emailFormat: 'firstname.lastname@magairports.com',
    linkedinPattern: 'https://linkedin.com/company/manchester-airports-group',
    keyRoles: ['Capital Projects Director', 'Commercial Director', 'Programme Director'],
    knownContacts: [
      { name: 'Charlie Mayfield', title: 'Chairman', linkedin: null },
      { name: 'Karen Smart', title: 'Managing Director, Manchester Airport', linkedin: 'https://linkedin.com/in/karen-smart' },
      { name: 'Robert Sherwood', title: 'Chief Finance Officer', linkedin: null },
      { name: 'Chris Sherwood', title: 'Chief Strategy Officer', linkedin: null }
    ],
    procurementPortal: 'https://www.magairports.com/',
    tenderPortal: 'MAG Supplier Portal',
    intel: 'Manchester, Stansted, East Midlands airports. £4.5bn capital programme. T2 transformation major project. Northern Powerhouse gateway.',
    relationshipTips: ['Regional northern focus', 'Multi-airport experience valued', 'Understand live airport operations', 'Sustainability priorities']
  },
  'tfgm': {
    name: 'Transport for Greater Manchester',
    emailFormat: 'firstname.lastname@tfgm.com',
    linkedinPattern: 'https://linkedin.com/company/transport-for-greater-manchester',
    keyRoles: ['Metrolink Director', 'Capital Programmes Director', 'Commercial Director'],
    knownContacts: [
      { name: 'Vernon Sherwood', title: 'Chief Executive, TfGM', linkedin: null },
      { name: 'Danny Vaughan', title: 'Head of Metrolink', linkedin: null },
      { name: 'Simon Warburton', title: 'Transport Strategy Director', linkedin: null },
      { name: 'Steve Warrener', title: 'Finance Director', linkedin: null }
    ],
    procurementPortal: 'https://tfgm.com/about/procurement',
    tenderPortal: 'The Chest',
    intel: 'Bee Network rollout ongoing. Bus franchising first outside London. Metrolink expansion £2.7bn. CRSTS2 £1.6bn secured.',
    relationshipTips: ['Bee Network knowledge essential', 'Bus franchising experience valued', 'Understand GM political landscape', 'Metrolink extension opportunities']
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

      <!-- Interactive Events Calendar -->
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
        <div class="interactive-calendar-container" id="interactive-calendar">
          ${renderInteractiveCalendar(upcomingEvents)}
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

// Store current month for calendar navigation
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderInteractiveCalendar(events) {
  const today = new Date();
  currentCalendarMonth = today.getMonth();
  currentCalendarYear = today.getFullYear();

  return buildCalendarHTML(events, currentCalendarMonth, currentCalendarYear);
}

function buildCalendarHTML(events, month, year) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  // Get events for this month (include all events, not just upcoming)
  const monthEvents = INDUSTRY_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === month && eventDate.getFullYear() === year;
  });

  // Map events by day
  const eventsByDay = {};
  monthEvents.forEach(event => {
    const day = new Date(event.date).getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(event);
  });

  // Build calendar grid - always 6 rows for consistent height
  let calendarDays = '';
  let dayCount = 1;
  const totalCells = 42; // 6 rows x 7 days

  for (let i = 0; i < totalCells; i++) {
    if (i < startDay) {
      // Empty cells before month starts
      calendarDays += '<div class="calendar-day empty"></div>';
    } else if (dayCount > daysInMonth) {
      // Empty cells after month ends
      calendarDays += '<div class="calendar-day empty"></div>';
    } else {
      const dayEvents = eventsByDay[dayCount] || [];
      const isToday = dayCount === new Date().getDate() &&
                      month === new Date().getMonth() &&
                      year === new Date().getFullYear();

      calendarDays += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}">
          <span class="day-number">${dayCount}</span>
          <div class="day-events">
            ${dayEvents.map(event => `
              <div class="calendar-event-item"
                   data-event-id="${event.id}"
                   data-type="${event.type.toLowerCase().replace(' ', '-')}"
                   style="border-left: 3px solid ${EVENT_SECTOR_COLORS[event.sector] || '#888'};">
                <span class="event-title">${truncateText(event.name, 18)}</span>
                <div class="calendar-event-popup">
                  <div class="calendar-popup-header" style="background-color: ${EVENT_SECTOR_COLORS[event.sector] || '#888'}">
                    <strong>${event.name}</strong>
                    <span class="popup-type-badge">${event.type}</span>
                  </div>
                  <div class="calendar-popup-body">
                    <div class="popup-info-row"><span class="popup-icon">📅</span> ${formatDate(event.date)}${event.endDate ? ' - ' + formatDate(event.endDate) : ''}</div>
                    <div class="popup-info-row"><span class="popup-icon">📍</span> ${event.location}</div>
                    <div class="popup-info-row"><span class="popup-icon">💰</span> ${event.cost > 0 ? '£' + event.cost : 'Free'}</div>
                    <div class="popup-info-row"><span class="popup-icon">⭐</span> Priority: ${event.priority}/10 ${event.priority >= 9 ? '(Must Attend)' : ''}</div>
                    <p class="popup-description">${event.description}</p>
                    <div class="popup-attendees">
                      <strong>Key Attendees:</strong>
                      <div class="popup-attendee-tags">
                        ${event.attendees.map(a => `<span class="popup-attendee-tag">${a}</span>`).join('')}
                      </div>
                    </div>
                    ${event.url ? `<a href="${event.url}" target="_blank" class="popup-register-btn">Register Now</a>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      dayCount++;
    }
  }

  return `
    <div class="interactive-calendar">
      <div class="calendar-nav">
        <button class="calendar-nav-btn" id="prev-month">
          <span class="nav-arrow">←</span> Previous
        </button>
        <h3 class="calendar-month-title">${monthNames[month]} ${year}</h3>
        <button class="calendar-nav-btn" id="next-month">
          Next <span class="nav-arrow">→</span>
        </button>
      </div>
      <div class="calendar-grid">
        ${dayNames.map(d => `<div class="calendar-header-day">${d}</div>`).join('')}
        ${calendarDays}
      </div>
    </div>
  `;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Keep old function for backward compatibility
function renderEventsCalendar(events) {
  return renderInteractiveCalendar(events);
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

      ${client.knownContacts && client.knownContacts.length > 0 ? `
        <div class="intel-section known-contacts-section">
          <h4 class="intel-label">Known Contacts</h4>
          <div class="known-contacts-grid">
            ${client.knownContacts.map(contact => `
              <div class="contact-card">
                <div class="contact-avatar">${contact.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="contact-info">
                  <div class="contact-name">${contact.name}</div>
                  <div class="contact-title">${contact.title}</div>
                  ${contact.linkedin ? `
                    <a href="${contact.linkedin}" target="_blank" class="contact-linkedin">
                      <span class="linkedin-icon">in</span> View Profile
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

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

      // Filter calendar event items
      const calendarEvents = container.querySelectorAll('.calendar-event-item');
      calendarEvents.forEach(item => {
        if (filter === 'all') {
          item.style.display = 'block';
        } else {
          const itemType = item.dataset.type;
          item.style.display = itemType === filter ? 'block' : 'none';
        }
      });
    });
  });

  // Calendar navigation - Previous month
  const prevBtn = container.querySelector('#prev-month');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCalendarMonth--;
      if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
      }
      updateCalendar(container);
    });
  }

  // Calendar navigation - Next month
  const nextBtn = container.querySelector('#next-month');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCalendarMonth++;
      if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
      }
      updateCalendar(container);
    });
  }

  // Setup popup positioning for calendar events
  setupCalendarPopups(container);
}

function setupCalendarPopups(container) {
  const eventItems = container.querySelectorAll('.calendar-event-item');

  eventItems.forEach(item => {
    const popup = item.querySelector('.calendar-event-popup');
    if (!popup) return;

    item.addEventListener('mouseenter', (e) => {
      const rect = item.getBoundingClientRect();
      const popupWidth = 300;
      const popupHeight = popup.offsetHeight || 350;

      // Position popup below the event, centered or adjusted to fit screen
      let left = rect.left;
      let top = rect.bottom + 8;

      // Adjust if popup goes off right edge
      if (left + popupWidth > window.innerWidth - 20) {
        left = window.innerWidth - popupWidth - 20;
      }

      // Adjust if popup goes off left edge
      if (left < 20) {
        left = 20;
      }

      // If popup goes below viewport, show above the event
      if (top + popupHeight > window.innerHeight - 20) {
        top = rect.top - popupHeight - 8;
      }

      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    });
  });
}

function updateCalendar(container) {
  const calendarContainer = container.querySelector('#interactive-calendar');
  if (calendarContainer) {
    calendarContainer.innerHTML = buildCalendarHTML(INDUSTRY_EVENTS, currentCalendarMonth, currentCalendarYear);

    // Re-apply current filter
    const activeFilter = container.querySelector('.btn-group .btn.btn-active');
    if (activeFilter && activeFilter.dataset.filter !== 'all') {
      const filter = activeFilter.dataset.filter;
      container.querySelectorAll('.calendar-event-item').forEach(item => {
        const itemType = item.dataset.type;
        item.style.display = itemType === filter ? 'block' : 'none';
      });
    }

    // Re-setup popup positioning for new calendar events
    setupCalendarPopups(container);

    // Re-attach navigation listeners
    const prevBtn = container.querySelector('#prev-month');
    const nextBtn = container.querySelector('#next-month');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentCalendarMonth--;
        if (currentCalendarMonth < 0) {
          currentCalendarMonth = 11;
          currentCalendarYear--;
        }
        updateCalendar(container);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentCalendarMonth++;
        if (currentCalendarMonth > 11) {
          currentCalendarMonth = 0;
          currentCalendarYear++;
        }
        updateCalendar(container);
      });
    }
  }
}
