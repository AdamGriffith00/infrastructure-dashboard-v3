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
 * Get color based on value intensity using logarithmic scale
 * This makes smaller differences more visible
 */
function getIntensityColor(value, maxValue, colorScheme = 'yellow', minValue = 0) {
    // No data - return dark gray
    if (!value || value === 0) return '#3A3A3A';

    // Use logarithmic scale to better show differences
    const logMin = minValue > 0 ? Math.log(minValue) : Math.log(1);
    const logMax = Math.log(Math.max(maxValue, 1));
    const logValue = Math.log(Math.max(value, 1));

    // Calculate intensity on log scale
    let intensity = (logValue - logMin) / (logMax - logMin || 1);
    // Clamp between 0 and 1, but ensure minimum 0.25 so lowest values are still visible
    intensity = Math.max(0.25, Math.min(intensity, 1));

    // Color schemes - all start from visible colors (not black)
    const schemes = {
        // Yellow/gold heatmap - tan (low) to bright orange (high)
        yellow: [
            '#6B5B3D',  // 0 - lowest (visible tan/brown)
            '#7A6840',  // 1
            '#8A7545',  // 2
            '#9A824A',  // 3
            '#AA8F50',  // 4
            '#BA9C55',  // 5
            '#C9A550',  // 6
            '#D8A845',  // 7
            '#E7A535',  // 8
            '#F59E20',  // 9
            '#FF9500',  // 10
            '#FF8500',  // 11
            '#FF7500',  // 12
            '#FF6500',  // 13 - highest (bright orange)
        ],
        copper: ['#5B4030', '#6B4525', '#7B5020', '#9B5B25', '#BB6530', '#DA4F27'],
        green: ['#3D5025', '#4D6020', '#5D7020', '#6D8025', '#7D9028', '#4CAF50'],
        blue: ['#2A4560', '#3A5570', '#4A6580', '#5A7590', '#6A85A0', '#5A9BD4']
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
