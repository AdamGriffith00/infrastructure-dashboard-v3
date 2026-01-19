/**
 * UK Map Component - GeoJSON-based interactive map
 * Uses real UK boundary data from martinjc/UK-GeoJSON
 */

import { formatCurrency } from '../utils/formatters.js';

// Cache for GeoJSON data
let geoJsonCache = null;

/**
 * Load GeoJSON data for UK regions
 */
async function loadGeoJson() {
    if (geoJsonCache) return geoJsonCache;

    try {
        const response = await fetch('data/uk-regions.geojson?v=2');
        geoJsonCache = await response.json();
        return geoJsonCache;
    } catch (error) {
        console.error('Failed to load UK regions GeoJSON:', error);
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
function geometryToPath(geometry, bounds, width, height, padding = 20) {
    const paths = [];

    if (geometry.type === 'Polygon') {
        // Polygon has array of rings: [exterior, ...holes]
        geometry.coordinates.forEach(ring => {
            const path = ringToPath(ring, bounds, width, height, padding);
            if (path) paths.push(path);
        });
    } else if (geometry.type === 'MultiPolygon') {
        // MultiPolygon has array of polygons
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
        processCoords(feature.geometry.coordinates);
    });

    // Add small padding to bounds
    const lonPad = (maxLon - minLon) * 0.02;
    const latPad = (maxLat - minLat) * 0.02;

    return [minLon - lonPad, minLat - latPad, maxLon + lonPad, maxLat + latPad];
}

/**
 * Get color based on value intensity using logarithmic scale
 * This makes smaller differences more visible
 */
function getIntensityColor(value, maxValue, colorScheme = 'yellow', minValue = 0) {
    if (!value || value === 0) return '#3A3A3A';

    // Use logarithmic scale to better show differences
    const logMin = minValue > 0 ? Math.log(minValue) : 0;
    const logMax = Math.log(maxValue);
    const logValue = Math.log(value);

    // Calculate intensity on log scale, with a floor to ensure minimum visibility
    let intensity = (logValue - logMin) / (logMax - logMin);
    intensity = Math.max(0.15, Math.min(intensity, 1)); // Ensure minimum 15% intensity

    const schemes = {
        // Yellow to orange heatmap - olive gray (low) to deep orange (high)
        yellow: [
            '#4A4A35',  // 0 - lowest (olive gray)
            '#5A5530',  // 1
            '#6A6035',  // 2
            '#7A6B3A',  // 3
            '#8A7640',  // 4
            '#9A8145',  // 5
            '#AA8C4A',  // 6
            '#BA9750',  // 7
            '#CA9A45',  // 8
            '#DA9530',  // 9
            '#EA9020',  // 10
            '#F58B15',  // 11
            '#FF850A',  // 12
            '#FF7500',  // 13 - high (bright orange)
            '#FF6000',  // 14 - highest (deep orange)
        ],
        copper: ['#3A3A3A', '#5B3015', '#7B4020', '#9B5025', '#BB6030', '#DA4F27'],
        green: ['#3A3A3A', '#2D4016', '#3D5B1C', '#4D7522', '#5D9028', '#4CAF50'],
        blue: ['#3A3A3A', '#1A3A5C', '#2A4A6C', '#3A5A7C', '#4A6A8C', '#5A9BD4']
    };

    const colors = schemes[colorScheme] || schemes.yellow;
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
}

/**
 * Main render function for UK Map
 */
export async function renderUKMap(container, options = {}) {
    const {
        data = [],
        dataKey = 'budget10Year',
        labelKey = 'name',
        valueFormatter = formatCurrency,
        colorScheme = 'yellow',
        title = 'UK Regional Overview',
        showLegend = true,
        onRegionClick = null,
        selectedRegion = null,
        width = 450,
        height = 600
    } = options;

    // Show loading state
    container.innerHTML = `
        <div class="map-loading">
            <div class="spinner" style="width: 30px; height: 30px;"></div>
        </div>
    `;

    // Load GeoJSON
    const geoJson = await loadGeoJson();
    if (!geoJson) {
        container.innerHTML = '<p class="text-muted">Failed to load map data</p>';
        return;
    }

    // Create data lookup
    const dataLookup = {};
    data.forEach(item => {
        dataLookup[item.id] = item;
    });

    // Calculate min/max values for color scaling
    const values = data.map(d => d[dataKey] || 0).filter(v => v > 0);
    const maxValue = values.length > 0 ? Math.max(...values) : 1;
    const minValue = values.length > 0 ? Math.min(...values) : 0;

    // Calculate bounds
    const bounds = calculateBounds(geoJson.features);

    // Build SVG paths for each region
    const regionPaths = geoJson.features.map(feature => {
        const regionId = feature.properties.id;
        const regionData = dataLookup[regionId];
        const value = regionData ? (regionData[dataKey] || 0) : 0;
        const color = getIntensityColor(value, maxValue, colorScheme, minValue);
        const displayName = regionData?.name || feature.properties.name;
        const isSelected = selectedRegion === regionId;

        const pathD = geometryToPath(feature.geometry, bounds, width, height);

        return {
            id: regionId,
            name: displayName,
            value: value,
            color: color,
            path: pathD,
            isSelected: isSelected
        };
    });

    // Render the map
    container.innerHTML = `
        <div class="uk-map-wrapper">
            <div class="map-header">
                <span class="map-title">${title}</span>
            </div>
            <svg class="uk-map-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <g class="map-regions">
                    ${regionPaths.map(r => `
                        <path
                            class="map-region ${r.isSelected ? 'selected' : ''}"
                            d="${r.path}"
                            fill="${r.color}"
                            stroke="#2F2F2F"
                            stroke-width="1"
                            data-region="${r.id}"
                            data-name="${r.name}"
                            data-value="${r.value}"
                        />
                    `).join('')}
                </g>
            </svg>
            ${showLegend ? `
                <div class="map-legend">
                    <div class="legend-bar"></div>
                    <div class="legend-labels">
                        <span>${valueFormatter(minValue)}</span>
                        <span>${valueFormatter(maxValue)}</span>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="map-tooltip" id="map-tooltip-${Date.now()}">
            <div class="tooltip-name"></div>
            <div class="tooltip-value"></div>
        </div>
    `;

    // Add interactivity
    const svg = container.querySelector('.uk-map-svg');
    const tooltip = container.querySelector('.map-tooltip');

    svg.querySelectorAll('.map-region').forEach(path => {
        // Hover effects
        path.addEventListener('mouseenter', (e) => {
            const name = path.dataset.name;
            const value = parseFloat(path.dataset.value);

            tooltip.querySelector('.tooltip-name').textContent = name;
            tooltip.querySelector('.tooltip-value').textContent = valueFormatter(value);
            tooltip.classList.add('visible');

            // Highlight effect
            path.style.filter = 'brightness(1.3)';
            path.style.stroke = '#F7C400';
            path.style.strokeWidth = '2';
        });

        path.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = (e.clientY - 10) + 'px';
        });

        path.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            if (!path.classList.contains('selected')) {
                path.style.filter = '';
                path.style.stroke = '#2F2F2F';
                path.style.strokeWidth = '1';
            }
        });

        // Click handler
        if (onRegionClick) {
            path.style.cursor = 'pointer';
            path.addEventListener('click', () => {
                const regionId = path.dataset.region;
                const regionName = path.dataset.name;
                onRegionClick(regionId, regionName);
            });
        }
    });
}

/**
 * Render a mini version of the map for cards/summaries
 */
export async function renderMiniMap(container, options = {}) {
    return renderUKMap(container, {
        ...options,
        width: 250,
        height: 320,
        showLegend: false,
        title: ''
    });
}

export default { renderUKMap, renderMiniMap };
