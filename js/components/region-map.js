/**
 * Regional Subdivision Map Component
 * Renders a detailed map of a specific UK region showing its subdivisions
 * (boroughs, districts, council areas, etc.)
 */

import { formatCurrency } from '../utils/formatters.js';

// Cache for regional GeoJSON data
const regionGeoJsonCache = {};

/**
 * Load GeoJSON data for a specific region
 */
async function loadRegionGeoJson(regionId) {
    if (regionGeoJsonCache[regionId]) {
        return regionGeoJsonCache[regionId];
    }

    try {
        const response = await fetch(`data/regions/${regionId}.geojson`);
        if (!response.ok) {
            throw new Error(`Failed to load ${regionId} GeoJSON`);
        }
        const data = await response.json();
        regionGeoJsonCache[regionId] = data;
        return data;
    } catch (error) {
        console.error(`Failed to load region GeoJSON for ${regionId}:`, error);
        return null;
    }
}

/**
 * Convert a single coordinate to SVG point
 */
function coordToSvg(lon, lat, bounds, width, height, padding) {
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const lonRange = maxLon - minLon;
    const latRange = maxLat - minLat;

    const x = padding + ((lon - minLon) / lonRange) * (width - padding * 2);
    // Flip Y axis for SVG
    const y = padding + ((maxLat - lat) / latRange) * (height - padding * 2);
    return [x, y];
}

/**
 * Convert a ring of coordinates to SVG path string
 */
function ringToPath(ring, bounds, width, height, padding) {
    if (!ring || ring.length < 3) return '';

    const points = ring.map(coord => {
        const [x, y] = coordToSvg(coord[0], coord[1], bounds, width, height, padding);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return 'M ' + points.join(' L ') + ' Z';
}

/**
 * Convert GeoJSON geometry to SVG path
 */
function geometryToPath(geometry, bounds, width, height, padding = 5) {
    const paths = [];

    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(ring => {
            const path = ringToPath(ring, bounds, width, height, padding);
            if (path) paths.push(path);
        });
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
                const path = ringToPath(ring, bounds, width, height, padding);
                if (path) paths.push(path);
            });
        });
    }

    return paths.join(' ');
}

/**
 * Calculate bounding box for all GeoJSON features
 */
function calculateBounds(features) {
    let minLon = Infinity, minLat = Infinity;
    let maxLon = -Infinity, maxLat = -Infinity;

    function processCoords(coords) {
        coords.forEach(coord => {
            if (Array.isArray(coord[0])) {
                processCoords(coord);
            } else {
                minLon = Math.min(minLon, coord[0]);
                minLat = Math.min(minLat, coord[1]);
                maxLon = Math.max(maxLon, coord[0]);
                maxLat = Math.max(maxLat, coord[1]);
            }
        });
    }

    features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
            processCoords(feature.geometry.coordinates);
        }
    });

    // Add minimal padding to bounds
    const lonPad = (maxLon - minLon) * 0.01;
    const latPad = (maxLat - minLat) * 0.01;

    return [minLon - lonPad, minLat - latPad, maxLon + lonPad, maxLat + latPad];
}

/**
 * Get color based on value intensity
 * Uses a bright, clearly visible color scale
 */
function getIntensityColor(value, maxValue, colorScheme = 'yellow', minValue = 0) {
    // No data - return a visible muted color (not black!)
    if (!value || value === 0) return '#5A5040';

    // Calculate intensity as percentage between min and max
    const range = maxValue - minValue;
    let intensity = range > 0 ? (value - minValue) / range : 0.5;
    // Ensure all values are visible - minimum 30% intensity for better visibility
    intensity = Math.max(0.3, Math.min(intensity, 1));

    // Bright color schemes - clearly visible on dark background
    // Using a warm gradient from tan/gold to bright orange
    const schemes = {
        yellow: [
            '#A08050',  // 0.3 - warm tan (lowest visible)
            '#B08A45',  //
            '#C0953A',  //
            '#D0A030',  //
            '#E0AA25',  // middle gold
            '#F0B41A',  //
            '#FFB810',  //
            '#FFA500',  // bright orange
            '#FF9000',  //
            '#FF8000',  // 1.0 - dark orange (highest)
        ],
        copper: ['#A07050', '#B07040', '#C07030', '#D08020', '#E08510', '#FF9000'],
        green: ['#607050', '#708545', '#809A3A', '#90AF30', '#A0C425', '#B0D91A'],
        blue: ['#506080', '#607090', '#7080A0', '#8090B0', '#90A0C0', '#A0B0D0']
    };

    const colors = schemes[colorScheme] || schemes.yellow;
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
}

/**
 * Main render function for Regional Subdivision Map
 */
export async function renderRegionSubdivisionMap(container, options = {}) {
    const {
        regionId,
        regionName = 'Region',
        boroughData = {},  // Object mapping subdivision names to { budget, opportunityCount, clientCount, sectors }
        regionClients = [],  // Clients serving this region (legacy support)
        totalBudget = 0,  // Total budget for this region
        data = {},  // Legacy: Object mapping subdivision IDs/names to values
        dataKey = 'value',
        valueFormatter = formatCurrency,
        colorScheme = 'yellow',
        title = '',
        showLegend = true,
        width = 500,
        height = 500,
        onSubdivisionClick = null
    } = options;

    // Show loading state
    container.innerHTML = `
        <div class="map-loading">
            <div class="spinner" style="width: 30px; height: 30px;"></div>
            <p class="text-muted mt-sm">Loading ${regionName} map...</p>
        </div>
    `;

    // Load GeoJSON for this region
    const geoJson = await loadRegionGeoJson(regionId);
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
        container.innerHTML = `
            <div class="map-no-data">
                <p class="text-muted">Map data not available for ${regionName}</p>
            </div>
        `;
        return;
    }

    // Create data lookup - match by name (case-insensitive)
    // Supports both new format { budget, opportunityCount, ... } and legacy format (plain numbers)
    const dataLookup = {};
    Object.entries(boroughData).forEach(([key, value]) => {
        dataLookup[key.toLowerCase()] = value;
    });
    // Also add legacy data format
    Object.entries(data).forEach(([key, value]) => {
        if (!dataLookup[key.toLowerCase()]) {
            dataLookup[key.toLowerCase()] = typeof value === 'number' ? { budget: value } : value;
        }
    });

    // Calculate max budget value for color scaling
    const budgetValues = Object.values(dataLookup)
        .map(v => typeof v === 'number' ? v : (v?.budget || 0))
        .filter(v => v > 0);
    const maxValue = budgetValues.length > 0 ? Math.max(...budgetValues) : 1;
    const minValue = budgetValues.length > 0 ? Math.min(...budgetValues) : 0;

    // Calculate bounds
    const bounds = calculateBounds(geoJson.features);

    // Use large fixed dimensions for rendering - map will scale to fit container
    const baseSize = 1200;
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const aspectRatio = (maxLon - minLon) / (maxLat - minLat);

    let renderWidth, renderHeight;
    if (aspectRatio > 1) {
        // Wider than tall (like London)
        renderWidth = baseSize;
        renderHeight = baseSize / aspectRatio;
    } else {
        // Taller than wide (like Scotland)
        renderHeight = baseSize;
        renderWidth = baseSize * aspectRatio;
    }

    // Build SVG paths for each subdivision using the boroughData
    const subdivisionPaths = geoJson.features.map(feature => {
        const props = feature.properties;
        const name = props.name || props.LAD13NM || props.LGD14NM || 'Unknown';
        const id = props.id || props.LAD13CD || name;

        // Try to find data for this subdivision
        const matchedData = dataLookup[name.toLowerCase()] || dataLookup[id.toLowerCase()];

        // Extract the budget value for coloring
        let budgetValue = 0;
        if (matchedData) {
            budgetValue = typeof matchedData === 'number' ? matchedData : (matchedData.budget || 0);
        }

        // Color based on budget, using calculated min/max
        const color = getIntensityColor(budgetValue, maxValue || 1, colorScheme, minValue);
        const pathD = geometryToPath(feature.geometry, bounds, renderWidth, renderHeight);

        return {
            id: id,
            name: name,
            data: matchedData || { budget: 0, opportunityCount: 0, clientCount: 0, sectors: [] },
            budget: budgetValue,
            color: color,
            path: pathD
        };
    });

    // Render the map
    const mapTitle = title || `${regionName} Subdivisions`;

    container.innerHTML = `
        <div class="region-map-wrapper">
            <div class="map-header">
                <span class="map-title">${mapTitle}</span>
            </div>
            <svg class="region-map-svg" viewBox="0 0 ${renderWidth} ${renderHeight}" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="subdivision-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <g class="map-subdivisions">
                    ${subdivisionPaths.map(s => `
                        <path
                            class="map-subdivision"
                            d="${s.path}"
                            fill="${s.color}"
                            stroke="#2F2F2F"
                            stroke-width="0.5"
                            data-id="${s.id}"
                            data-name="${s.name}"
                            data-budget="${s.budget}"
                            data-opportunity-count="${s.data?.opportunityCount || 0}"
                            data-client-count="${s.data?.clientCount || 0}"
                            data-sector-count="${s.data?.sectors?.length || 0}"
                        />
                    `).join('')}
                </g>
            </svg>
            ${showLegend ? `
                <div class="map-legend">
                    <div class="legend-bar"></div>
                    <div class="legend-labels">
                        <span>${valueFormatter(minValue || 0)}</span>
                        <span>${valueFormatter(maxValue || 0)}</span>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="map-tooltip" id="region-map-tooltip-${Date.now()}">
            <div class="tooltip-name"></div>
            <div class="tooltip-budget"></div>
            <div class="tooltip-counts"></div>
        </div>
    `;

    // Add interactivity
    const svg = container.querySelector('.region-map-svg');
    const tooltip = container.querySelector('.map-tooltip');

    svg.querySelectorAll('.map-subdivision').forEach(path => {
        // Hover effects
        path.addEventListener('mouseenter', (e) => {
            const name = path.dataset.name;
            const budget = parseFloat(path.dataset.budget) || 0;
            const opportunityCount = parseInt(path.dataset.opportunityCount) || 0;
            const clientCount = parseInt(path.dataset.clientCount) || 0;
            const sectorCount = parseInt(path.dataset.sectorCount) || 0;

            // Simplified tooltip: Name, Budget, Opportunities/Clients, Sectors
            tooltip.querySelector('.tooltip-name').textContent = name;
            tooltip.querySelector('.tooltip-budget').textContent = `Budget: ${valueFormatter(budget)}`;

            // Show combined opportunities/clients count
            const totalItems = opportunityCount + clientCount;
            let countsText = '';
            if (totalItems > 0) {
                const parts = [];
                if (opportunityCount > 0) parts.push(`${opportunityCount} opportunities`);
                if (clientCount > 0) parts.push(`${clientCount} clients`);
                countsText = parts.join(', ');
            } else {
                countsText = 'No projects';
            }
            countsText += sectorCount > 0 ? ` | ${sectorCount} sectors` : '';
            tooltip.querySelector('.tooltip-counts').textContent = countsText;

            tooltip.classList.add('visible');

            // Highlight effect
            path.style.filter = 'brightness(1.3)';
            path.style.stroke = '#F7C400';
            path.style.strokeWidth = '1.5';
        });

        path.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = (e.clientY - 10) + 'px';
        });

        path.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            path.style.filter = '';
            path.style.stroke = '#2F2F2F';
            path.style.strokeWidth = '0.5';
        });

        // Click handler
        if (onSubdivisionClick) {
            path.style.cursor = 'pointer';
            path.addEventListener('click', () => {
                const id = path.dataset.id;
                const name = path.dataset.name;
                onSubdivisionClick(id, name);
            });
        }
    });
}

export default { renderRegionSubdivisionMap };
