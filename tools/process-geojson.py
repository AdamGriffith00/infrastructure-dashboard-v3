#!/usr/bin/env python3
"""
Process UK TopoJSON files and create simplified GeoJSON for the dashboard.
"""

import json
import os

def decode_arc(arc, scale, translate):
    """Decode a TopoJSON arc to coordinates."""
    coords = []
    x, y = 0, 0
    for point in arc:
        x += point[0]
        y += point[1]
        lon = x * scale[0] + translate[0]
        lat = y * scale[1] + translate[1]
        coords.append([round(lon, 4), round(lat, 4)])
    return coords

def simplify_coords(coords, tolerance=0.01):
    """Simplify coordinates by keeping every nth point."""
    if len(coords) <= 10:
        return coords

    # Keep every nth point based on total count
    step = max(1, len(coords) // 80)  # Keep ~80 points per ring
    simplified = [coords[i] for i in range(0, len(coords), step)]

    # Ensure ring is closed
    if simplified[0] != simplified[-1]:
        simplified.append(simplified[0])

    return simplified

def polygon_area(coords):
    """Calculate approximate area of a polygon using shoelace formula."""
    n = len(coords)
    if n < 3:
        return 0
    area = 0
    for i in range(n):
        j = (i + 1) % n
        area += coords[i][0] * coords[j][1]
        area -= coords[j][0] * coords[i][1]
    return abs(area) / 2

def topojson_to_geojson(topo_data, object_name):
    """Convert TopoJSON to GeoJSON with simplification."""
    arcs = topo_data.get('arcs', [])
    transform = topo_data.get('transform', {})
    scale = transform.get('scale', [1, 1])
    translate = transform.get('translate', [0, 0])

    # Decode all arcs
    decoded_arcs = []
    for arc in arcs:
        decoded_arcs.append(decode_arc(arc, scale, translate))

    features = []
    geometries = topo_data['objects'][object_name]['geometries']

    for geom in geometries:
        props = geom.get('properties', {})
        geom_type = geom.get('type')

        if geom_type == 'Polygon':
            rings = []
            for ring_arcs in geom.get('arcs', []):
                ring = []
                for arc_idx in ring_arcs:
                    if arc_idx >= 0:
                        ring.extend(decoded_arcs[arc_idx])
                    else:
                        ring.extend(decoded_arcs[~arc_idx][::-1])
                rings.append(simplify_coords(ring))

            features.append({
                'type': 'Feature',
                'properties': props,
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': rings
                }
            })

        elif geom_type == 'MultiPolygon':
            polygons = []
            for polygon_arcs in geom.get('arcs', []):
                rings = []
                for ring_arcs in polygon_arcs:
                    ring = []
                    for arc_idx in ring_arcs:
                        if arc_idx >= 0:
                            ring.extend(decoded_arcs[arc_idx])
                        else:
                            ring.extend(decoded_arcs[~arc_idx][::-1])
                    if len(ring) > 3:
                        rings.append(simplify_coords(ring))
                if rings:
                    polygons.append(rings)

            if polygons:
                features.append({
                    'type': 'Feature',
                    'properties': props,
                    'geometry': {
                        'type': 'MultiPolygon',
                        'coordinates': polygons
                    }
                })

    return {
        'type': 'FeatureCollection',
        'features': features
    }

def merge_features_to_single(features, new_id, new_name):
    """Merge multiple features into a single MultiPolygon, keeping largest polygons."""
    all_polygons = []

    for feature in features:
        geom = feature['geometry']
        if geom['type'] == 'Polygon':
            all_polygons.append(geom['coordinates'])
        elif geom['type'] == 'MultiPolygon':
            all_polygons.extend(geom['coordinates'])

    # Calculate area for each polygon and sort by area (largest first)
    polygons_with_area = []
    for poly in all_polygons:
        # Use first ring (exterior) for area calculation
        if poly and len(poly) > 0 and len(poly[0]) > 0:
            area = polygon_area(poly[0])
            polygons_with_area.append((area, poly))

    # Sort by area descending
    polygons_with_area.sort(key=lambda x: -x[0])

    # Keep polygons that are at least 1% of largest, or top 20
    if polygons_with_area:
        max_area = polygons_with_area[0][0]
        threshold = max_area * 0.01
        kept_polys = [p for area, p in polygons_with_area if area >= threshold][:20]
    else:
        kept_polys = []

    return {
        'type': 'Feature',
        'properties': {'id': new_id, 'name': new_name},
        'geometry': {
            'type': 'MultiPolygon',
            'coordinates': kept_polys
        }
    }

def main():
    data_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/data'

    combined_features = []

    # Process England regions
    print("Processing England regions...")
    with open(os.path.join(data_dir, 'england-regions-topo.json'), 'r') as f:
        england_topo = json.load(f)

    england_geojson = topojson_to_geojson(england_topo, 'eer')

    # Map region names to our IDs
    region_mapping = {
        'North East': 'north-east',
        'North West': 'north-west',
        'Yorkshire and The Humber': 'yorkshire-humber',
        'East Midlands': 'east-midlands',
        'West Midlands': 'midlands',
        'Eastern': 'eastern',
        'London': 'london',
        'South East': 'south-east',
        'South West': 'south-west'
    }

    for feature in england_geojson['features']:
        name = feature['properties'].get('EER13NM', '')
        if name in region_mapping:
            feature['properties'] = {
                'id': region_mapping[name],
                'name': name
            }
            combined_features.append(feature)

    # Process Scotland
    print("Processing Scotland...")
    with open(os.path.join(data_dir, 'scotland-topo.json'), 'r') as f:
        scotland_topo = json.load(f)

    scotland_geojson = topojson_to_geojson(scotland_topo, 'lad')
    scotland_merged = merge_features_to_single(scotland_geojson['features'], 'scotland', 'Scotland')
    combined_features.append(scotland_merged)

    # Process Wales
    print("Processing Wales...")
    with open(os.path.join(data_dir, 'wales-topo.json'), 'r') as f:
        wales_topo = json.load(f)

    wales_geojson = topojson_to_geojson(wales_topo, 'lad')
    wales_merged = merge_features_to_single(wales_geojson['features'], 'wales', 'Wales')
    combined_features.append(wales_merged)

    # Process Northern Ireland
    print("Processing Northern Ireland...")
    with open(os.path.join(data_dir, 'ni-topo.json'), 'r') as f:
        ni_topo = json.load(f)

    ni_geojson = topojson_to_geojson(ni_topo, 'lgd')
    ni_merged = merge_features_to_single(ni_geojson['features'], 'northern-ireland', 'Northern Ireland')
    combined_features.append(ni_merged)

    # Create combined GeoJSON
    combined = {
        'type': 'FeatureCollection',
        'features': combined_features
    }

    # Save
    output_path = os.path.join(data_dir, 'uk-regions.geojson')
    with open(output_path, 'w') as f:
        json.dump(combined, f)

    # Report file size
    size = os.path.getsize(output_path)
    print(f"Created {output_path}")
    print(f"File size: {size / 1024:.1f} KB")
    print(f"Features: {len(combined_features)}")

    # Verify bounds
    print("\nRegion bounds:")
    for feat in combined_features:
        coords = feat['geometry']['coordinates']
        min_lon, min_lat = float('inf'), float('inf')
        max_lon, max_lat = float('-inf'), float('-inf')

        def process(c):
            nonlocal min_lon, min_lat, max_lon, max_lat
            if isinstance(c[0], (int, float)):
                min_lon = min(min_lon, c[0])
                max_lon = max(max_lon, c[0])
                min_lat = min(min_lat, c[1])
                max_lat = max(max_lat, c[1])
            else:
                for item in c:
                    process(item)

        process(coords)
        print(f"  {feat['properties']['id']}: lat {min_lat:.2f}-{max_lat:.2f}")

if __name__ == '__main__':
    main()
