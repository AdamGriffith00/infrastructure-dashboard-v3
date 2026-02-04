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
    // No data - return dark gray (only for truly empty areas)
    if (!value || value === 0) return '#4A4A4A';

    // Calculate intensity as percentage between min and max
    const range = maxValue - minValue;
    let intensity = range > 0 ? (value - minValue) / range : 0.5;
    // Ensure all values are visible - minimum 20% intensity
    intensity = Math.max(0.2, Math.min(intensity, 1));

    // Bright color schemes - clearly visible on dark background
    const schemes = {
        // Yellow/gold heatmap - light gold (low) to bright orange (high)
        yellow: [
            '#8B7355',  // 0 - lowest (clearly visible tan)
            '#9C8050',  // 1
            '#AD8D4B',  // 2
            '#BE9A46',  // 3
            '#CFA741',  // 4
            '#E0B43C',  // 5 - middle (bright gold)
            '#EBB030',  // 6
            '#F5A825',  // 7
            '#FF9F1A',  // 8
            '#FF900F',  // 9
            '#FF8000',  // 10 - high (bright orange)
        ],
        copper: ['#8B6040', '#9B6535', '#AB702A', '#CB7B20', '#EB8515', '#FF9000'],
        green: ['#5A7B45', '#6A8B3A', '#7A9B30', '#8AAB25', '#9ABB1A', '#AAD010'],
        blue: ['#4A6585', '#5A7595', '#6A85A5', '#7A95B5', '#8AA5C5', '#9AB5D5']
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
        data = {},  // Object mapping subdivision IDs/names to values
        regionClients = [],  // Clients serving this region
        totalBudget = 0,  // Total budget for this region
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
    const dataLookup = {};
    Object.entries(data).forEach(([key, value]) => {
        dataLookup[key.toLowerCase()] = value;
    });

    // Calculate max value for color scaling
    const values = Object.values(data).filter(v => typeof v === 'number' && v > 0);
    const maxValue = values.length > 0 ? Math.max(...values) : 1;

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

    // Helper function to calculate budget for a subdivision
    function getSubdivisionBudget(subdivisionName) {
        let total = 0;
        regionClients.forEach(client => {
            // If client has no subdivisions defined, they serve whole region
            if (!client.subdivisions || !client.subdivisions[regionId]) {
                total += client.budget10Year || 0;
            } else {
                // Check if this subdivision is in the client's list
                const clientSubdivisions = client.subdivisions[regionId] || [];
                if (clientSubdivisions.some(s => s.toLowerCase() === subdivisionName.toLowerCase())) {
                    total += client.budget10Year || 0;
                }
            }
        });
        return total;
    }

    // Calculate budget for each subdivision to find the min/max for color scaling
    const subdivisionBudgets = {};
    geoJson.features.forEach(feature => {
        const props = feature.properties;
        const name = props.name || props.LAD13NM || props.LGD14NM || 'Unknown';
        subdivisionBudgets[name] = getSubdivisionBudget(name);
    });
    const budgetValues = Object.values(subdivisionBudgets).filter(v => v > 0);
    const maxSubdivisionBudget = budgetValues.length > 0 ? Math.max(...budgetValues) : 1;
    const minSubdivisionBudget = budgetValues.length > 0 ? Math.min(...budgetValues) : 0;

    // Build SVG paths for each subdivision
    const subdivisionPaths = geoJson.features.map(feature => {
        const props = feature.properties;
        const name = props.name || props.LAD13NM || props.LGD14NM || 'Unknown';
        const id = props.id || props.LAD13CD || name;

        // Get the calculated budget for this subdivision
        const subdivisionBudget = subdivisionBudgets[name] || 0;

        // Try to find specific data, otherwise use calculated budget
        const matchedValue = dataLookup[name.toLowerCase()] ||
                            dataLookup[id.toLowerCase()] ||
                            subdivisionBudget;

        // Use min/max subdivision budget for color scaling
        const effectiveMaxValue = regionClients.length > 0 ? maxSubdivisionBudget : maxValue;
        const effectiveMinValue = regionClients.length > 0 ? minSubdivisionBudget : 0;
        const color = getIntensityColor(matchedValue, effectiveMaxValue || 1, colorScheme, effectiveMinValue);
        const pathD = geometryToPath(feature.geometry, bounds, renderWidth, renderHeight);

        return {
            id: id,
            name: name,
            value: matchedValue,
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
                            data-value="${s.value}"
                        />
                    `).join('')}
                </g>
            </svg>
            ${showLegend ? `
                <div class="map-legend">
                    <div class="legend-bar"></div>
                    <div class="legend-labels">
                        <span>${valueFormatter(minSubdivisionBudget || 0)}</span>
                        <span>${valueFormatter(maxSubdivisionBudget || maxValue)}</span>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="map-tooltip" id="region-map-tooltip-${Date.now()}">
            <div class="tooltip-name"></div>
            <div class="tooltip-value"></div>
            <div class="tooltip-clients"></div>
        </div>
    `;

    // Helper function to get clients for a specific subdivision
    function getClientsForSubdivision(subdivisionName) {
        return regionClients.filter(client => {
            // If client has no subdivisions defined, they serve whole region (e.g., water companies)
            if (!client.subdivisions || !client.subdivisions[regionId]) {
                return true;
            }
            // Check if this subdivision is in the client's list
            const clientSubdivisions = client.subdivisions[regionId] || [];
            return clientSubdivisions.some(s =>
                s.toLowerCase() === subdivisionName.toLowerCase()
            );
        });
    }

    // Helper function to build clients HTML with sources
    function buildClientsHtml(clients) {
        if (clients.length === 0) return '';
        return clients.map(c => {
            const source = c.source ? `<div class="tooltip-source">${c.source}</div>` : '';
            return `<div class="tooltip-client">
                <span class="tooltip-client-name">${c.name}</span>
                <span class="tooltip-client-value">${valueFormatter(c.budget10Year || 0)}</span>
                ${source}
            </div>`;
        }).join('');
    }

    // Add interactivity
    const svg = container.querySelector('.region-map-svg');
    const tooltip = container.querySelector('.map-tooltip');

    svg.querySelectorAll('.map-subdivision').forEach(path => {
        // Hover effects
        path.addEventListener('mouseenter', (e) => {
            const name = path.dataset.name;
            const value = parseFloat(path.dataset.value);

            tooltip.querySelector('.tooltip-name').textContent = name;

            // Get clients that serve this specific subdivision
            const subdivisionClients = getClientsForSubdivision(name);

            if (subdivisionClients.length > 0) {
                const subdivisionTotal = subdivisionClients.reduce((sum, c) => sum + (c.budget10Year || 0), 0);
                tooltip.querySelector('.tooltip-value').textContent = `Total: ${valueFormatter(subdivisionTotal)}`;
                tooltip.querySelector('.tooltip-clients').innerHTML = buildClientsHtml(subdivisionClients);
            } else {
                tooltip.querySelector('.tooltip-value').textContent = value > 0 ? valueFormatter(value) : 'No data';
                tooltip.querySelector('.tooltip-clients').innerHTML = '';
            }

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
