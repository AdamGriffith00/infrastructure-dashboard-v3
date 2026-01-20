/**
 * Regional Insights and Intelligence
 * Market data, tips, and strategic considerations for each UK region
 */

export const REGIONAL_INSIGHTS = {
  'london': {
    marketOverview: 'The UK\'s largest infrastructure market with £100bn+ pipeline. Highly competitive but offers scale opportunities.',
    keyDrivers: [
      'Elizabeth Line completion driving further Crossrail 2 momentum',
      'Thames Tideway Tunnel nearing completion',
      'Major housing delivery programmes across boroughs',
      'Net zero retrofit programmes for public buildings'
    ],
    majorProjects: [
      { name: 'Crossrail 2', value: '£30bn+', status: 'Planning' },
      { name: 'Old Oak Common', value: '£26bn', status: 'Development' },
      { name: 'Silvertown Tunnel', value: '£2bn', status: 'Construction' },
      { name: 'Bank Station Upgrade', value: '£700m', status: 'Construction' }
    ],
    keyClients: ['TfL', 'GLA', 'Network Rail', 'Thames Water', 'London Boroughs'],
    competitorLandscape: 'Dominated by Tier 1 consultants (Arup, Mott MacDonald, Arcadis). Strong local SME presence in boroughs.',
    frameworkTip: 'TfL Professional Services Framework is essential. Borough frameworks offer less competition.',
    pricingInsight: 'Premium rates achievable but expect pressure on major programmes. Day rates 10-15% above regional average.',
    growthSectors: ['Rail', 'Housing', 'Education', 'Healthcare'],
    risks: [
      'High competition from established players',
      'Cost of office space and staff retention',
      'Political uncertainty around major projects'
    ],
    quickWins: [
      'Target borough-level frameworks - less competition than TfL',
      'Partner with Tier 1s on major programmes',
      'Focus on housing and education sectors for quicker wins'
    ]
  },

  'north-west': {
    marketOverview: 'Second largest regional economy with major investment in transport, housing, and devolution-driven programmes.',
    keyDrivers: [
      'Greater Manchester devolution and Bee Network',
      'Liverpool City Region investment programme',
      'Northern Powerhouse Rail planning',
      'Major housing growth in Manchester and Liverpool'
    ],
    majorProjects: [
      { name: 'HS2 Phase 2b (if reinstated)', value: '£20bn+', status: 'Uncertain' },
      { name: 'Manchester Airport Transformation', value: '£1.3bn', status: 'Delivery' },
      { name: 'Liverpool Waters', value: '£5bn', status: 'Phased delivery' },
      { name: 'Bee Network (Metrolink expansion)', value: '£3bn+', status: 'Delivery' }
    ],
    keyClients: ['Transport for Greater Manchester', 'GMCA', 'Liverpool City Region CA', 'United Utilities', 'Peel Group'],
    competitorLandscape: 'Mix of national firms and strong regional players (Curtins, WSP Manchester). Relationships matter.',
    frameworkTip: 'GMCA and Liverpool City Region frameworks are gateway to significant pipeline.',
    pricingInsight: 'Competitive pricing expected. 10-15% below London rates typical.',
    growthSectors: ['Rail', 'Highways', 'Housing', 'Water'],
    risks: [
      'HS2 Phase 2 uncertainty affecting confidence',
      'Fragmented client base across two city regions',
      'Strong local competition'
    ],
    quickWins: [
      'GMCA is well-organised - single point of contact for multiple opportunities',
      'United Utilities has consistent capital programme',
      'Housing associations have significant programmes'
    ]
  },

  'scotland': {
    marketOverview: 'Distinct market with separate procurement frameworks. Strong public sector focus with Transport Scotland and Scottish Water.',
    keyDrivers: [
      'Scottish Government infrastructure investment plan',
      'Net zero leadership driving green investment',
      'A9 dualling programme',
      'Scottish Water capital investment'
    ],
    majorProjects: [
      { name: 'A9 Dualling', value: '£3bn', status: 'Phased delivery' },
      { name: 'Edinburgh Tram Extension', value: '£200m', status: 'Delivery' },
      { name: 'Scottish Water Investment', value: '£5bn (6-year)', status: 'Ongoing' },
      { name: 'Clyde Metro', value: '£2bn+', status: 'Planning' }
    ],
    keyClients: ['Transport Scotland', 'Scottish Water', 'Scottish Government', 'City of Edinburgh', 'Glasgow City Region'],
    competitorLandscape: 'Scottish firms have advantage (SWECO, Jacobs Scotland). Local presence important for public sector.',
    frameworkTip: 'Scottish Procurement frameworks often require Scottish office presence or partnership.',
    pricingInsight: 'Competitive with English regions. Public sector frameworks have rate ceilings.',
    growthSectors: ['Water', 'Highways', 'Rail', 'Energy'],
    risks: [
      'Requirement for Scottish presence/registration',
      'Smaller overall market size',
      'Political landscape affects investment priorities'
    ],
    quickWins: [
      'Partner with established Scottish firm if no presence',
      'Scottish Water has consistent, well-managed programme',
      'Transport Scotland accessible but competitive'
    ]
  },

  'midlands': {
    marketOverview: 'Major growth region driven by HS2, West Midlands devolution, and manufacturing/logistics investment.',
    keyDrivers: [
      'HS2 Phase 1 construction and stations',
      'West Midlands Combined Authority programmes',
      'East Midlands Freeport',
      'Automotive and battery manufacturing investment'
    ],
    majorProjects: [
      { name: 'HS2 Phase 1', value: '£45bn', status: 'Construction' },
      { name: 'Birmingham Curzon Street', value: '£1.5bn', status: 'Construction' },
      { name: 'Coventry City Centre', value: '£2bn', status: 'Delivery' },
      { name: 'UK Battery Industrialisation Centre', value: '£500m', status: 'Operational' }
    ],
    keyClients: ['HS2 Ltd', 'WMCA', 'Birmingham City Council', 'East Midlands Councils', 'Severn Trent'],
    competitorLandscape: 'HS2 dominated by joint ventures. Strong opportunity in Tier 2 and local authority work.',
    frameworkTip: 'HS2 supply chain registration essential. WMCA frameworks growing in importance.',
    pricingInsight: 'HS2 has driven rate inflation. Non-HS2 work more competitive.',
    growthSectors: ['Rail', 'Highways', 'Industrial', 'Housing'],
    risks: [
      'HS2 dependency - what happens post-construction?',
      'Competition for HS2-experienced staff',
      'Diverse geography makes coverage challenging'
    ],
    quickWins: [
      'HS2 Tier 2/3 supply chain has ongoing needs',
      'Local authorities less competitive than HS2',
      'Severn Trent has stable capital programme'
    ]
  },

  'south-east': {
    marketOverview: 'Wealthy region with major transport, housing, and port infrastructure. Gatwick and Channel Tunnel Rail Link area.',
    keyDrivers: [
      'Gatwick Airport expansion (DCO approved)',
      'Lower Thames Crossing',
      'Housing growth in Thames Estuary',
      'Port expansion at Dover and Southampton'
    ],
    majorProjects: [
      { name: 'Lower Thames Crossing', value: '£9bn', status: 'DCO submitted' },
      { name: 'Gatwick Northern Runway', value: '£2bn', status: 'DCO approved' },
      { name: 'Southampton Port Expansion', value: '£1bn', status: 'Planning' },
      { name: 'Ebbsfleet Garden City', value: '£3bn', status: 'Phased' }
    ],
    keyClients: ['National Highways', 'Gatwick Airport', 'Port Authorities', 'Kent/Surrey/Hampshire Councils', 'Southern Water'],
    competitorLandscape: 'Good mix - less dominated by single clients than other regions.',
    frameworkTip: 'National Highways Regional Delivery Partnership is key. Airport frameworks valuable.',
    pricingInsight: 'Near-London rates in Kent/Surrey. More competitive further from London.',
    growthSectors: ['Aviation', 'Highways', 'Ports', 'Housing'],
    risks: [
      'Lower Thames Crossing delays/uncertainty',
      'Competition from London-based firms',
      'Geographic spread requires multiple bases'
    ],
    quickWins: [
      'Gatwick expansion creates significant supply chain need',
      'County councils have substantial highways programmes',
      'Southern Water investment programme growing'
    ]
  },

  'south-west': {
    marketOverview: 'Growing region with nuclear, defence, and transport investment. Bristol is economic hub.',
    keyDrivers: [
      'Hinkley Point C and Sizewell C nuclear',
      'Defence investment at naval bases',
      'Bristol/Bath housing growth',
      'A303/A358 improvements'
    ],
    majorProjects: [
      { name: 'Hinkley Point C', value: '£33bn', status: 'Construction' },
      { name: 'A303 Stonehenge Tunnel', value: '£2bn', status: 'Approved' },
      { name: 'Bristol Temple Quarter', value: '£1.6bn', status: 'Planning' },
      { name: 'Plymouth Growth Zone', value: '£500m', status: 'Delivery' }
    ],
    keyClients: ['EDF Energy', 'National Highways', 'MOD/Defence Infrastructure', 'Bristol City', 'Wessex Water'],
    competitorLandscape: 'Nuclear dominated by specialists. Good opportunity in transport and local authority.',
    frameworkTip: 'Nuclear supply chain requires specific accreditations. Defence frameworks lucrative but demanding.',
    pricingInsight: 'Nuclear premium rates. Other sectors more competitive.',
    growthSectors: ['Nuclear', 'Defence', 'Highways', 'Housing'],
    risks: [
      'Nuclear skills shortage affects all sectors',
      'Remote geography increases delivery costs',
      'Limited framework opportunities outside nuclear'
    ],
    quickWins: [
      'Bristol has active regeneration programme',
      'A303/A358 programme creates sustained workload',
      'Wessex Water accessible for water sector entry'
    ]
  },

  'yorkshire-humber': {
    marketOverview: 'Diverse region with strong energy, water, and transport sectors. Leeds and Sheffield urban regeneration.',
    keyDrivers: [
      'Northern Powerhouse Rail',
      'Yorkshire Water major investment',
      'Offshore wind supply chain',
      'Leeds and Sheffield city centre regeneration'
    ],
    majorProjects: [
      { name: 'Trans-Pennine Route Upgrade', value: '£9bn', status: 'Delivery' },
      { name: 'Yorkshire Water AMP8', value: '£4bn', status: 'Planning' },
      { name: 'Leeds City Centre Package', value: '£1bn', status: 'Phased' },
      { name: 'Humber Freeport', value: '£1bn+', status: 'Development' }
    ],
    keyClients: ['Network Rail', 'Yorkshire Water', 'West Yorkshire CA', 'Sheffield City Region', 'Associated British Ports'],
    competitorLandscape: 'Strong regional players (Arup Leeds, WSP). Water sector dominated by incumbents.',
    frameworkTip: 'Yorkshire Water frameworks essential for water work. Combined Authority growing.',
    pricingInsight: 'Competitive pricing. Water sector frameworks have established rates.',
    growthSectors: ['Rail', 'Water', 'Energy', 'Regeneration'],
    risks: [
      'Rail investment subject to political decisions',
      'Competition from established regional players',
      'Economic challenges in some areas'
    ],
    quickWins: [
      'Yorkshire Water has strong programme management',
      'West Yorkshire CA well-organised for engagement',
      'Energy sector growing rapidly around Humber'
    ]
  },

  'eastern': {
    marketOverview: 'Fast-growing region with Cambridge tech, ports, and major energy investment including Sizewell C.',
    keyDrivers: [
      'Sizewell C nuclear construction',
      'Cambridge biotech and housing growth',
      'Freeport East (Felixstowe/Harwich)',
      'East West Rail connection'
    ],
    majorProjects: [
      { name: 'Sizewell C', value: '£20bn', status: 'Approved' },
      { name: 'East West Rail', value: '£5bn', status: 'Phased delivery' },
      { name: 'Cambridge South Station', value: '£200m', status: 'Construction' },
      { name: 'Norwich Western Link', value: '£250m', status: 'Planning' }
    ],
    keyClients: ['EDF Energy', 'East West Rail Co', 'Anglian Water', 'Cambridge City/County', 'Port of Felixstowe'],
    competitorLandscape: 'Nuclear specialists for Sizewell. Cambridge competitive due to tech sector.',
    frameworkTip: 'Sizewell C supply chain now actively procuring. Anglian Water frameworks accessible.',
    pricingInsight: 'Cambridge commands premium rates. Nuclear premium. Rest of region competitive.',
    growthSectors: ['Nuclear', 'Rail', 'Water', 'Tech/Life Sciences'],
    risks: [
      'Sizewell C timing uncertainty',
      'Cambridge housing crisis affects recruitment',
      'Large geographic area with dispersed opportunities'
    ],
    quickWins: [
      'Sizewell C early supply chain positions available now',
      'Anglian Water has consistent programme',
      'Cambridge colleges have ongoing estates programmes'
    ]
  },

  'north-east': {
    marketOverview: 'Smaller market but growing with offshore wind, Nissan investment, and transport improvements.',
    keyDrivers: [
      'Offshore wind manufacturing',
      'Nissan/automotive electrification',
      'Newcastle airport expansion',
      'Northumberland Line reopening'
    ],
    majorProjects: [
      { name: 'Teesside Freeport', value: '£2bn', status: 'Development' },
      { name: 'Northumberland Line', value: '£166m', status: 'Construction' },
      { name: 'Newcastle Central Station', value: '£100m', status: 'Planning' },
      { name: 'Port of Tyne Investment', value: '£500m', status: 'Phased' }
    ],
    keyClients: ['North of Tyne CA', 'Tees Valley CA', 'Northumbrian Water', 'Port of Tyne', 'Newcastle City'],
    competitorLandscape: 'Less competitive than other regions. Relationship-driven market.',
    frameworkTip: 'Combined Authority frameworks opening up. Northumbrian Water accessible.',
    pricingInsight: 'Most competitive region. Lower rates but lower overheads possible.',
    growthSectors: ['Energy', 'Industrial', 'Rail', 'Ports'],
    risks: [
      'Smaller overall market size',
      'Economic challenges in some areas',
      'Distance from other offices'
    ],
    quickWins: [
      'Less competitive - relationships matter more than scale',
      'Combined Authorities actively seeking suppliers',
      'Energy sector growing with offshore wind'
    ]
  },

  'wales': {
    marketOverview: 'Distinct market with Welsh Government focus. Transport, housing, and energy investment growing.',
    keyDrivers: [
      'South Wales Metro',
      'A55/A40 improvements',
      'Welsh housing programmes',
      'Renewable energy growth'
    ],
    majorProjects: [
      { name: 'South Wales Metro', value: '£1bn', status: 'Delivery' },
      { name: 'A55 Improvements', value: '£500m', status: 'Phased' },
      { name: 'Wylfa Newydd (future)', value: '£15bn', status: 'Paused' },
      { name: 'Cardiff Bay Regeneration', value: '£500m', status: 'Ongoing' }
    ],
    keyClients: ['Transport for Wales', 'Welsh Government', 'Dwr Cymru', 'Cardiff Council', 'Newport Council'],
    competitorLandscape: 'Welsh firms have advantage. Preference for local supply chain in public sector.',
    frameworkTip: 'Welsh language can be requirement. Partnership with Welsh firm often needed.',
    pricingInsight: 'Competitive with English regions. Public sector focused.',
    growthSectors: ['Rail', 'Highways', 'Housing', 'Energy'],
    risks: [
      'Preference for Welsh firms/Welsh language',
      'Smaller market overall',
      'Wylfa nuclear project paused'
    ],
    quickWins: [
      'Partner with Welsh firm for credibility',
      'Transport for Wales actively expanding supply chain',
      'Dwr Cymru has strong investment programme'
    ]
  },

  'northern-ireland': {
    marketOverview: 'Separate jurisdiction with distinct procurement. Growing infrastructure investment.',
    keyDrivers: [
      'Belfast Region City Deal',
      'A5 Western Transport Corridor',
      'Water infrastructure investment',
      'Cross-border connectivity'
    ],
    majorProjects: [
      { name: 'Belfast Region City Deal', value: '£1bn', status: 'Development' },
      { name: 'A5 Dual Carriageway', value: '£1.2bn', status: 'Planning' },
      { name: 'NI Water Investment', value: '£2bn', status: 'Ongoing' },
      { name: 'Belfast Transport Hub', value: '£200m', status: 'Construction' }
    ],
    keyClients: ['DfI NI', 'NI Water', 'Belfast City Council', 'Translink', 'Belfast Harbour'],
    competitorLandscape: 'Strong local firms. Relationship-driven. Different regulatory framework.',
    frameworkTip: 'NI-specific frameworks essential. Consider partnership or acquisition of local firm.',
    pricingInsight: 'Competitive with UK regions. Some framework rate caps.',
    growthSectors: ['Water', 'Highways', 'Regeneration', 'Rail'],
    risks: [
      'Separate legal/regulatory framework',
      'Political uncertainty',
      'Small market with established players'
    ],
    quickWins: [
      'Belfast City Deal creating new opportunities',
      'NI Water actively seeking to expand supply chain',
      'Less competitive than GB for new entrants with right approach'
    ]
  },

  'east-midlands': {
    marketOverview: 'Growing region with East Midlands Freeport, HS2 services, and significant housing growth.',
    keyDrivers: [
      'East Midlands Freeport',
      'HS2 East Midlands Hub station',
      'Nottingham and Leicester growth',
      'East Midlands Airport expansion'
    ],
    majorProjects: [
      { name: 'HS2 East Midlands Hub', value: '£2bn', status: 'Planning' },
      { name: 'East Midlands Freeport', value: '£1.5bn', status: 'Development' },
      { name: 'Nottingham Southern Relief Road', value: '£150m', status: 'Construction' },
      { name: 'Leicester Waterside', value: '£500m', status: 'Phased' }
    ],
    keyClients: ['HS2 Ltd', 'East Midlands Councils', 'EMDevCo', 'Severn Trent', 'East Midlands Airport'],
    competitorLandscape: 'Less dominated than West Midlands. Good opportunity for growth.',
    frameworkTip: 'Combined Authority frameworks emerging. HS2 supply chain relevant.',
    pricingInsight: 'Competitive pricing. Growing market creating opportunities.',
    growthSectors: ['Rail', 'Logistics', 'Housing', 'Industrial'],
    risks: [
      'HS2 Eastern Leg uncertainty',
      'Fragmented client base',
      'Competition from Midlands-based firms'
    ],
    quickWins: [
      'East Midlands Freeport actively procuring',
      'Local authorities have housing programmes',
      'Severn Trent covers region'
    ]
  }
};

/**
 * Get insights for a specific region
 */
export function getRegionalInsights(regionId) {
  return REGIONAL_INSIGHTS[regionId] || null;
}

/**
 * Get all insights for comparison
 */
export function getAllRegionalInsights() {
  return REGIONAL_INSIGHTS;
}

/**
 * Get contextual tips based on assessment answers
 */
export function getContextualTips(regionId, sectionId, answers) {
  const insights = REGIONAL_INSIGHTS[regionId];
  if (!insights) return [];

  const tips = [];

  // Presence-based tips
  if (sectionId === 'presence') {
    if (answers.office_presence <= 1) {
      tips.push({
        type: 'action',
        text: insights.frameworkTip
      });
    }
  }

  // Relationship-based tips
  if (sectionId === 'relationships') {
    if (answers.framework_positions <= 1) {
      tips.push({
        type: 'insight',
        text: `Key clients in this region: ${insights.keyClients.join(', ')}`
      });
    }
  }

  // Pipeline-based tips
  if (sectionId === 'pipeline') {
    tips.push({
      type: 'insight',
      text: `Growth sectors: ${insights.growthSectors.join(', ')}`
    });
  }

  // Competition-based tips
  if (sectionId === 'competition') {
    tips.push({
      type: 'warning',
      text: insights.competitorLandscape
    });
    tips.push({
      type: 'insight',
      text: insights.pricingInsight
    });
  }

  return tips;
}
