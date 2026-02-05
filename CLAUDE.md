# Infrastructure Dashboard v3

## Project Overview
UK Infrastructure Dashboard - a web-based visualization tool for tracking infrastructure investment across UK regions, sectors, and disciplines.

## Tech Stack
- Vanilla JavaScript (ES6 modules)
- CSS with custom properties
- Python simple HTTP server for local development
- GeoJSON for regional maps

## Running the Project
```bash
python3 server.py
# Opens at http://localhost:3000
```

## Recent Work

### 2026-01-17: Highways Sector Data Deepening
- Replaced generic "National Highways" entry with regional breakdowns:
  - **National Highways (RIS3 2025-2030):**
    - South East (£9bn) - Lower Thames Crossing, M25 enhancements
    - South West (£5.5bn) - A303 Stonehenge tunnel, A358 dualling
    - Midlands (£7bn) - M42 J6 HS2 link, A46 Newark
    - North West (£6bn) - A66 Trans-Pennine, M6 improvements
    - North East (£4.5bn) - A1 improvements, A19, M62
    - Eastern (£3.5bn) - A47, A12, A428
  - **Devolved Trunk Roads:**
    - Transport Scotland Roads (£4bn) - A9 dualling, A96
    - Welsh Government Roads (£1.75bn) - A55, network resilience
    - DfI NI Roads (£1.5bn) - A5 Western Corridor, A6
  - **City Region CRSTS Highways:**
    - Greater Manchester (£2bn) - Bee Network roads
    - West Midlands (£1.75bn) - Sprint BRT, HS2 roads
    - West Yorkshire (£1.4bn) - Mass Transit corridors
    - Liverpool City Region (£1bn) - Freeport access
    - South Yorkshire (£900m) - Tram-train highways
    - North East (£800m) - Metro integration
    - TfL Highways (£2.5bn) - Healthy Streets, cycleways

**Highways Sector Total: ~£53bn 10-year**

### 2026-01-17: Maritime Sector Data Deepening
- Added comprehensive port and coastal data:
  - **Major Ports:**
    - Peel Ports Group (£3.5bn) - Liverpool2, Manchester Ship Canal, Clydeport
    - DP World (£4bn) - London Gateway, Southampton
    - Port of Felixstowe (£1.8bn) - UK's busiest container port
    - Associated British Ports (£3bn) - 21 ports including Humber
    - Forth Ports (£2.5bn) - Tilbury, Leith offshore wind
    - Bristol Port (£700m) - Automotive and energy
  - **Freeport/Offshore:**
    - Teesworks (£2.8bn) - UK's largest Freeport, offshore wind manufacturing
    - Able Marine Energy Park (£1.2bn) - Purpose-built offshore wind hub
  - **Coastal:**
    - Environment Agency Coastal & Flood (£5.2bn) - Thames Barrier, flood defences

**Maritime Sector Total: ~£25bn 10-year**

### 2026-01-16: Aviation Sector Data Deepening
- Added comprehensive airport data:
  - **Major Airports:**
    - Heathrow (£14bn) - Third runway, terminal expansion
    - Gatwick (£8.5bn) - Northern runway DCO approved
    - Manchester Airport Group (£4.5bn) - Manchester, Stansted, East Midlands
  - **Regional Airports:**
    - Birmingham (£1.5bn) - HS2 connectivity
    - Edinburgh (£1bn) - terminal expansion
    - Luton (£2.5bn) - Terminal 2 DCO approved
    - Glasgow (£600m)
    - Bristol (£800m)
    - London City (£500m)
    - Newcastle (£350m)
    - Leeds Bradford (£300m)
    - Belfast (£400m)
    - Cardiff (£200m)
  - **Airspace:**
    - NATS (£2bn) - Airspace modernisation

**Aviation Sector Total: ~£37bn 10-year**

### 2026-01-16: Rail Sector Data Deepening
- Broke Network Rail into 5 regional routes with CP7 budgets:
  - Eastern (£9bn) - serves Eastern, East Midlands, Yorkshire, North East
  - North West & Central (£11bn) - serves Midlands, North West
  - Scotland (£5.5bn) - serves Scotland
  - Southern (£10bn) - serves London, South East
  - Wales & Western (£8.5bn) - serves Wales, South West, London
- Added/enhanced metro systems:
  - TfL (£12.8bn) - Piccadilly Line, DLR, Bakerloo extension
  - TfGM (£2.7bn) - Metrolink expansion
  - West Midlands Metro (£1.9bn) - HS2 connectivity
  - Nexus Tyne & Wear Metro (£1.6bn) - new fleet
  - Merseyrail (£1.3bn) - Liverpool City Region
  - West Yorkshire Mass Transit (£2.5bn) - new system
  - South Yorkshire Supertram (£450m)
  - Nottingham Express Transit (£300m)
  - Edinburgh Trams (£400m)
- Added regional rail:
  - Transport for Wales Rail (£3.2bn) - Core Valley Lines, South Wales Metro
  - Transport Scotland Rail (£4.2bn) - decarbonisation, EGIP
  - Translink NI Railways (£1.4bn) - new fleet, Belfast Grand Central
- HS2 (£45bn) already included with subdivision mapping

**Rail Sector Total: ~£110bn 10-year**

### 2026-01-16: Water Sector Data Deepening
- Updated all water companies with comprehensive AMP8 data
- Added: Yorkshire Water, Anglian Water, Wessex Water
- Enhanced existing entries with:
  - `subSector`: "water" field
  - `amp8Total`: Total AMP8 allocation
  - `programmes`: Breakdown (Base Expenditure, Enhancement)
  - `keyProjects`: Major schemes
  - `source`: Data source reference
- Regional mapping allows viewing by region (e.g., North West shows United Utilities £13.7bn)

**Water Companies AMP8 Totals (2025-2030):**
| Company | AMP8 Total | Regions |
|---------|-----------|---------|
| Thames Water | £19.8bn | London, South East, South West |
| United Utilities | £13.7bn | North West |
| Severn Trent | £12.9bn | Midlands, East Midlands, Wales |
| Anglian Water | £9.5bn | Eastern, East Midlands |
| Yorkshire Water | £7.8bn | Yorkshire & Humber |
| Southern Water | £7.4bn | South East |
| Scottish Water | £6.8bn | Scotland |
| Welsh Water | £5.1bn | Wales, Midlands |
| Northumbrian Water | £4.5bn | North East, Eastern |
| South West Water | £3.2bn | South West |
| Wessex Water | £2.8bn | South West |

### 2026-01-16: Regional Map Sizing
- Made regional subdivision maps (London, North West, South West, etc.) larger to fill their containers
- Changes made:
  - `css/views.css`: Increased `.region-map-svg` min-height to 500px, max-height to 700px
  - `css/views.css`: Increased `.region-detail-map-container` min-height to 600px
  - `css/views.css`: Reduced sidebar panel width from 350px to 280px for more map space
  - `js/components/region-map.js`: Increased baseSize from 550 to 700 for higher resolution rendering

### 2026-01-19: Pipeline & Timeline View (NEW)
- Created full pipeline tracking system for opportunities
- **New Pipeline View** (`js/views/pipeline.js`):
  - Pipeline KPIs: Total value, In Procurement, High Priority, Upcoming Deadlines
  - Upcoming Deadlines Alert: Shows bids due in next 30 days with urgency indicators
  - Pipeline Funnel: Visual breakdown by status (Planning → Pre-Procurement → Procurement → Delivery → Complete)
  - Contract Timeline: Grouped by quarter showing contract starts
  - Procurement Stage Breakdown: Cards by stage (Pipeline, Market Engagement, PQQ, ITT, Dialogue, Evaluation, Awarded)
  - Detailed Table: Filterable opportunity list
- **Updated opportunities.json** with 20 realistic opportunities including:
  - status (planning/pre-procurement/procurement/delivery/complete)
  - procurementStage (Pipeline/Market Engagement/PQQ/ITT/Dialogue/Evaluation/Awarded)
  - bidDeadline, contractStart, contractEnd, contractDuration
  - procurementRoute, framework, valueRange, keyContacts, aiInsights
- **Added pipeline badges** to Overall, Regions, Sectors views
- **Added procurement counts** to Budget view client list

### 2026-01-18: Data Sources View
- Created `/sources` view with methodology, sources by sector, key sources grid
- Added inline source citations to tooltips and client lists
- Shows where data comes from (government publications, company reports, etc.)

### 2026-01-19: Comprehensive City Region Transport Update
Major update to all city region combined authority transport data with full programme breakdowns:

**Greater Manchester - Bee Network (£6.5bn 10-year)**
- Bus Franchising: £1.2bn operations + £600m fleet/depots (first outside London since 1986)
- Metrolink: £800m renewals, £1.4bn extensions (Stockport, Airport Western Link)
- Active Travel: £650m for 1,800 miles of cycling/walking routes
- Added CRSTS2 allocation: £1.6bn (2027-2032)

**Liverpool City Region (£4.2bn 10-year)**
- Bus Franchising: £800m + £350m fleet (approved 2024, rollout 2027)
- Merseyrail: £500m new Class 777 trains (in service), £450m network enhancements
- Freeport Connectivity: £250m for Liverpool2, Wirral Waters, Parkside
- Added CRSTS2 allocation: £880m

**West Yorkshire (£5.8bn 10-year)**
- Mass Transit: £2.5bn for new light rail (UK's largest unfunded scheme)
- Bus Franchising: £700m (assessment complete 2024)
- Transforming Cities: £500m corridor improvements
- Added CRSTS2 allocation: £1.2bn

**South Yorkshire (£2.2bn 10-year)**
- Supertram Renewal: £500m new fleet and infrastructure
- Sheffield City Gateway: £250m station and access improvements
- UK's first tram-train system, now publicly owned

**North East (£3.2bn 10-year)**
- Metro New Fleet: £600m for 46 Stadler trains with battery capability
- Metro Extensions: £600m (Washington, Cobalt, Metrocentre studies)
- Leamside Line: £80m reopening study
- Added CRSTS2 allocation: £900m

**Lancashire County Council (NEW - £1.2bn 10-year)**
- Preston Western Distributor: £200m (under construction)
- South Lancaster Growth: £150m infrastructure
- Largest shire county not in a combined authority

### 2026-01-19: Client Data Enrichment (COMPLETED)
- Enriched minimal client entries with full data structures:
  - **HS2 Ltd**: Added programmes (Phase 1 £32bn, Phase 2a £8bn, stations), keyProjects, subSector, source
  - **SP Energy Networks** (Scottish Power): Added full regional coverage (Scotland, NW, Wales, Midlands), subdivisions, programmes (ScotWind £4bn, RIIO-ED2 £3.5bn), keyProjects
  - **Hinkley Point C**: Added subdivisions, programmes (Nuclear Island £12bn, M&E £6bn, etc.), keyProjects (Unit 1/2 reactors, grid connection)
  - **West Midlands CA**: Added subdivisions, programmes (Metro £800m, Sprint BRT £350m), keyProjects
  - **North East CA**: Added subdivisions, programmes (Metro Futures £800m, extensions £400m), keyProjects

### 2026-01-19: Live Projects Excel Upload Feature
- Rebuilt Live Projects view with Excel upload capability
- **Features:**
  - Excel (.xlsx, .xls) and CSV file upload via drag-drop or click
  - SheetJS library for Excel parsing
  - Projects displayed on UK map with region counts (same map component)
  - localStorage persistence - data stays until new file uploaded
  - KPI cards: Total Projects, Regions Active, Top Region, Data Status
  - Project list with scrolling, region rankings
  - Export to CSV, download template functionality
  - Clear data button to reset
- **Expected columns:** Name, Client, Sector, Region
- **Region normalization:** Handles various region name formats (e.g., "North West", "north-west", "Northwest")

### 2026-02-05: Regional Opportunities Scanner (London & South East)
Major new feature for comprehensive project scanning across regions:

**New Sectors Added** (`data/sectors.json`):
- Real Estate (pink) - Commercial, Residential, Mixed-Use, Retail
- Defence (grey) - MOD Estate, Naval, Air Bases, Facilities
- Data Centres (indigo) - Hyperscale, Colocation, Edge
- Infrastructure (brown) - Flood Defence, Waste, Public Realm, Education, Healthcare

**Regional Scanner Component** (`js/components/regional-scanner.js`):
- 70+ researched projects for London & South East (£3M+ value, 2026-2035)
- Data stored in `data/regional-opportunities/london-south-east.json`
- **Scanner Tabs**:
  - "All Projects" - Filterable table with all opportunities
  - "By Area" - Borough/district cards grid view
- **Filters**: Sector, Readiness, Min Value, Status
- **Readiness indicators**: Ready to Buy (green), Has Money Not Ready (amber), No Money (grey)
- **Source type badges**: Scanned (purple), Pipeline (blue), Client (green)
- Combined data sources: scanner opportunities + legacy opportunities + clients

**Area Cards** (By Area tab):
- Shows each borough with: Total value, Project count, Ready count, Sector count
- Top 3 sectors with color indicators
- Top 5 projects with readiness dots
- "+X more projects" toggle to expand full list
- Each project shows sector badge

**Opportunity Detail Modal**:
- Click any opportunity to open detail modal (not external link)
- Shows everything needed for bid/no-bid decision:
  - Title, sector, location
  - Key metrics: Value, Est. Staff (consultancy perspective), Timeline, Readiness
  - Status badges (procurement stage, project type)
  - Overview/description
  - Funding status (highlighted)
  - Key drivers (tags)
  - Relevant services (CCM, PM, EA, etc.)
  - Quick Assessment checklist (Client Ready, In Procurement, Public Tender, Multi-Service)
  - "View Source" button links to external info
- Staff estimates based on value: <£50M (2-5), £50-200M (5-15), £200-500M (10-25), £500M-1B (20-50), >£1B (50+)
- Close with X, click outside, or Escape key

**Heatmap Improvements** (`js/components/region-map.js`):
- Fixed color scale to use bright warm colors (tan → gold → orange)
- Simplified tooltips: Budget, Opportunities/Clients count, Sectors count
- Combined borough data from clients + scanner opportunities for accurate coloring

**Map Integration**:
- Clicking borough on map switches to "By Area" tab and highlights the card
- Cards auto-expand when selected from map

## Next Session - Continue With:
1. **Expand Regional Scanner** to other regions (North West, Midlands, etc.)
2. **Intelligence Features**: AI-powered bid insights, competitor analysis, win probability
3. **Analysis Tools**: Filtering, sorting, export capabilities
4. **Visualisations**: Gantt chart view, calendar view for deadlines

## Key Files
- `js/views/pipeline.js` - Pipeline & Timeline view
- `js/views/sources.js` - Data Sources view
- `js/views/regions.js` - Regions view with UK map and regional detail pages
- `js/components/regional-scanner.js` - Regional opportunities scanner with tabs, filters, modal (NEW)
- `js/components/region-map.js` - Regional subdivision map component (boroughs, districts, etc.)
- `js/components/uk-map.js` - Main UK map component
- `css/views.css` - View-specific styles including scanner and modal styles
- `css/components.css` - Reusable component styles
- `data/opportunities.json` - Opportunities with full pipeline data
- `data/regional-opportunities/london-south-east.json` - Scanner data for London & SE (NEW)
- `data/sectors.json` - Sector definitions including new sectors (NEW)
