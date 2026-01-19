#!/usr/bin/env python3
"""
Create individual GeoJSON files for each UK region's subdivisions.
Uses TopoJSON from martinjc/UK-GeoJSON repository.
"""

import json
import os

# Mapping of LAD codes to regions (prefix-based for London)
LONDON_CODES_PREFIX = 'E09'

# Region to LAD name mapping
NORTH_WEST_LADS = [
    'bolton', 'bury', 'manchester', 'oldham', 'rochdale', 'salford', 'stockport',
    'tameside', 'trafford', 'wigan',  # Greater Manchester
    'knowsley', 'liverpool', 'st. helens', 'sefton', 'wirral',  # Merseyside
    'halton', 'warrington',
    'cheshire east', 'cheshire west and chester',
    'blackburn with darwen', 'blackpool',
    'burnley', 'chorley', 'fylde', 'hyndburn', 'lancaster', 'pendle',
    'preston', 'ribble valley', 'rossendale', 'south ribble', 'west lancashire', 'wyre',
    'allerdale', 'barrow-in-furness', 'carlisle', 'copeland', 'eden', 'south lakeland',
    'cumberland', 'westmorland and furness'
]

NORTH_EAST_LADS = [
    'hartlepool', 'middlesbrough', 'redcar and cleveland', 'stockton-on-tees',
    'darlington', 'county durham', 'durham',
    'gateshead', 'newcastle upon tyne', 'north tyneside', 'south tyneside', 'sunderland',
    'northumberland'
]

YORKSHIRE_LADS = [
    'kingston upon hull', 'east riding of yorkshire', 'north east lincolnshire',
    'north lincolnshire', 'york',
    'barnsley', 'doncaster', 'rotherham', 'sheffield',
    'bradford', 'calderdale', 'kirklees', 'leeds', 'wakefield',
    'craven', 'hambleton', 'harrogate', 'richmondshire', 'ryedale', 'scarborough', 'selby',
    'north yorkshire'
]

EAST_MIDLANDS_LADS = [
    'derby', 'leicester', 'nottingham', 'rutland',
    'amber valley', 'bolsover', 'chesterfield', 'derbyshire dales', 'erewash',
    'high peak', 'north east derbyshire', 'south derbyshire',
    'blaby', 'charnwood', 'harborough', 'hinckley and bosworth', 'melton',
    'north west leicestershire', 'oadby and wigston',
    'boston', 'east lindsey', 'lincoln', 'north kesteven', 'south holland',
    'south kesteven', 'west lindsey',
    'corby', 'daventry', 'east northamptonshire', 'kettering', 'northampton',
    'south northamptonshire', 'wellingborough',
    'north northamptonshire', 'west northamptonshire',
    'ashfield', 'bassetlaw', 'broxtowe', 'gedling', 'mansfield', 'newark and sherwood',
    'rushcliffe'
]

WEST_MIDLANDS_LADS = [
    'birmingham', 'coventry', 'dudley', 'sandwell', 'solihull', 'walsall', 'wolverhampton',
    'herefordshire', 'shropshire', 'stoke-on-trent', 'telford and wrekin',
    'bromsgrove', 'malvern hills', 'redditch', 'worcester', 'wychavon', 'wyre forest',
    'cannock chase', 'east staffordshire', 'lichfield', 'newcastle-under-lyme',
    'south staffordshire', 'stafford', 'staffordshire moorlands', 'tamworth',
    'north warwickshire', 'nuneaton and bedworth', 'rugby', 'stratford-on-avon', 'warwick'
]

EASTERN_LADS = [
    'bedford', 'central bedfordshire', 'luton',
    'peterborough', 'cambridge', 'east cambridgeshire', 'fenland', 'huntingdonshire',
    'south cambridgeshire',
    'basildon', 'braintree', 'brentwood', 'castle point', 'chelmsford', 'colchester',
    'epping forest', 'harlow', 'maldon', 'rochford', 'southend-on-sea', 'tendring',
    'thurrock', 'uttlesford',
    'broxbourne', 'dacorum', 'east hertfordshire', 'hertsmere', 'north hertfordshire',
    'st albans', 'stevenage', 'three rivers', 'watford', 'welwyn hatfield',
    'breckland', 'broadland', 'great yarmouth', "king's lynn and west norfolk",
    'north norfolk', 'norwich', 'south norfolk',
    'babergh', 'ipswich', 'mid suffolk', 'east suffolk', 'west suffolk'
]

SOUTH_EAST_LADS = [
    'bracknell forest', 'west berkshire', 'reading', 'slough', 'windsor and maidenhead',
    'wokingham', 'milton keynes', 'brighton and hove', 'portsmouth', 'southampton',
    'isle of wight', 'medway',
    'aylesbury vale', 'chiltern', 'south bucks', 'wycombe', 'buckinghamshire',
    'eastbourne', 'hastings', 'lewes', 'rother', 'wealden',
    'basingstoke and deane', 'east hampshire', 'eastleigh', 'fareham', 'gosport',
    'hart', 'havant', 'new forest', 'rushmoor', 'test valley', 'winchester',
    'ashford', 'canterbury', 'dartford', 'dover', 'gravesham', 'maidstone',
    'sevenoaks', 'folkestone and hythe', 'shepway', 'swale', 'thanet', 'tonbridge and malling',
    'tunbridge wells',
    'cherwell', 'oxford', 'south oxfordshire', 'vale of white horse', 'west oxfordshire',
    'elmbridge', 'epsom and ewell', 'guildford', 'mole valley', 'reigate and banstead',
    'runnymede', 'spelthorne', 'surrey heath', 'tandridge', 'waverley', 'woking',
    'adur', 'arun', 'chichester', 'crawley', 'horsham', 'mid sussex', 'worthing'
]

SOUTH_WEST_LADS = [
    'bath and north east somerset', 'bristol', 'north somerset',
    'south gloucestershire', 'plymouth', 'torbay', 'bournemouth', 'poole',
    'swindon', 'cornwall', 'isles of scilly', 'wiltshire',
    'bournemouth, christchurch and poole', 'dorset',
    'christchurch', 'east dorset', 'north dorset', 'purbeck', 'west dorset',
    'weymouth and portland',
    'cheltenham', 'cotswold', 'forest of dean', 'gloucester', 'stroud', 'tewkesbury',
    'mendip', 'sedgemoor', 'south somerset', 'somerset west and taunton',
    'east devon', 'exeter', 'mid devon', 'north devon', 'south hams', 'teignbridge',
    'torridge', 'west devon'
]

REGION_LAD_MAPPING = {
    'north-east': NORTH_EAST_LADS,
    'north-west': NORTH_WEST_LADS,
    'yorkshire-humber': YORKSHIRE_LADS,
    'east-midlands': EAST_MIDLANDS_LADS,
    'midlands': WEST_MIDLANDS_LADS,
    'eastern': EASTERN_LADS,
    'south-east': SOUTH_EAST_LADS,
    'south-west': SOUTH_WEST_LADS,
}


def decode_topojson(topo_data):
    """Properly decode TopoJSON to GeoJSON with delta decoding."""
    if topo_data.get('type') != 'Topology':
        return topo_data

    obj_key = list(topo_data['objects'].keys())[0]
    geometries = topo_data['objects'][obj_key]['geometries']
    arcs = topo_data['arcs']
    transform = topo_data.get('transform', {})

    scale = transform.get('scale', [1, 1])
    translate = transform.get('translate', [0, 0])

    # First, decode all arcs from delta encoding to absolute coordinates
    decoded_arcs = []
    for arc in arcs:
        decoded_arc = []
        x, y = 0, 0
        for point in arc:
            x += point[0]
            y += point[1]
            # Apply transform
            lon = x * scale[0] + translate[0]
            lat = y * scale[1] + translate[1]
            decoded_arc.append([lon, lat])
        decoded_arcs.append(decoded_arc)

    features = []
    for geom in geometries:
        coords = decode_geometry(geom, decoded_arcs)
        if coords:
            feature = {
                'type': 'Feature',
                'properties': geom.get('properties', {}),
                'geometry': {
                    'type': geom['type'],
                    'coordinates': coords
                }
            }
            features.append(feature)

    return {
        'type': 'FeatureCollection',
        'features': features
    }


def decode_geometry(geom, decoded_arcs):
    """Decode geometry arcs to coordinates."""
    geom_type = geom['type']

    if geom_type == 'Polygon':
        rings = []
        for arc_indices in geom.get('arcs', []):
            ring = decode_ring(arc_indices, decoded_arcs)
            if ring:
                rings.append(ring)
        return rings if rings else None

    elif geom_type == 'MultiPolygon':
        polygons = []
        for polygon_arcs in geom.get('arcs', []):
            rings = []
            for arc_indices in polygon_arcs:
                ring = decode_ring(arc_indices, decoded_arcs)
                if ring:
                    rings.append(ring)
            if rings:
                polygons.append(rings)
        return polygons if polygons else None

    return None


def decode_ring(arc_indices, decoded_arcs):
    """Decode a ring from arc indices."""
    coords = []
    for idx in arc_indices:
        if idx < 0:
            # Negative index: reverse the arc
            arc = list(reversed(decoded_arcs[~idx]))
        else:
            arc = decoded_arcs[idx]

        # Add arc points, skipping first point if we already have coords
        # (to avoid duplicates at arc junctions)
        start = 1 if coords else 0
        coords.extend(arc[start:])

    return coords if len(coords) >= 3 else None


def simplify_coordinates(coords, tolerance=0.001):
    """Simple coordinate simplification."""
    if len(coords) <= 4:
        return coords

    simplified = [coords[0]]
    for i in range(1, len(coords) - 1):
        prev = simplified[-1]
        curr = coords[i]
        dist = ((curr[0] - prev[0])**2 + (curr[1] - prev[1])**2)**0.5
        if dist >= tolerance:
            simplified.append(curr)
    simplified.append(coords[-1])
    return simplified


def simplify_geometry(geometry, tolerance=0.001):
    """Simplify geometry coordinates."""
    coords = geometry['coordinates']
    geom_type = geometry['type']

    if geom_type == 'Polygon':
        geometry['coordinates'] = [simplify_coordinates(ring, tolerance) for ring in coords]
    elif geom_type == 'MultiPolygon':
        geometry['coordinates'] = [
            [simplify_coordinates(ring, tolerance) for ring in polygon]
            for polygon in coords
        ]
    return geometry


def is_in_region(feature, region_id):
    """Check if a feature belongs to a region."""
    props = feature.get('properties', {})
    code = props.get('LAD13CD', props.get('LGD14CD', ''))
    name = props.get('LAD13NM', props.get('LGD14NM', props.get('LAD21NM', ''))).lower()

    if region_id == 'london':
        return code.startswith(LONDON_CODES_PREFIX)

    if region_id in REGION_LAD_MAPPING:
        lad_names = REGION_LAD_MAPPING[region_id]
        for lad in lad_names:
            if lad in name or name in lad:
                return True

    return False


def process_england(topo_file, output_dir):
    """Process England LAD file and split by region."""
    print("Loading England TopoJSON...")
    with open(topo_file, 'r') as f:
        topo_data = json.load(f)

    print("Decoding TopoJSON...")
    geojson = decode_topojson(topo_data)

    english_regions = [
        'london', 'north-east', 'north-west', 'yorkshire-humber',
        'east-midlands', 'midlands', 'eastern', 'south-east', 'south-west'
    ]

    for region_id in english_regions:
        print(f"Processing {region_id}...")

        filtered = [f for f in geojson['features'] if is_in_region(f, region_id)]

        # Simplify and clean up
        for feature in filtered:
            feature['geometry'] = simplify_geometry(feature['geometry'], 0.0005)
            props = feature['properties']
            props['id'] = props.get('LAD13CD', props.get('LAD13NM', 'unknown'))
            props['name'] = props.get('LAD13NM', 'Unknown')

        output = {
            'type': 'FeatureCollection',
            'features': filtered
        }

        output_file = os.path.join(output_dir, f'{region_id}.geojson')
        with open(output_file, 'w') as f:
            json.dump(output, f)

        print(f"  Created {region_id}.geojson with {len(filtered)} features")


def process_devolved(topo_file, region_id, output_dir):
    """Process Scotland, Wales, or Northern Ireland."""
    print(f"Processing {region_id}...")

    with open(topo_file, 'r') as f:
        topo_data = json.load(f)

    geojson = decode_topojson(topo_data)

    for feature in geojson['features']:
        feature['geometry'] = simplify_geometry(feature['geometry'], 0.001)
        props = feature['properties']
        code = props.get('LAD13CD', props.get('LGD14CD', props.get('LAD21CD', 'unknown')))
        name = props.get('LAD13NM', props.get('LGD14NM', props.get('LAD21NM', 'Unknown')))
        props['id'] = code
        props['name'] = name

    output_file = os.path.join(output_dir, f'{region_id}.geojson')
    with open(output_file, 'w') as f:
        json.dump(geojson, f)

    print(f"  Created {region_id}.geojson with {len(geojson['features'])} features")


def main():
    input_dir = '/Users/adamgriffith/Documents/infrastructure-dashboard-v3/data/regions-geo'
    output_dir = '/Users/adamgriffith/Documents/infrastructure-dashboard-v3/data/regions'

    os.makedirs(output_dir, exist_ok=True)

    # Process English regions
    england_file = os.path.join(input_dir, 'england_lad.json')
    process_england(england_file, output_dir)

    # Process devolved nations
    process_devolved(os.path.join(input_dir, 'scotland_lad.json'), 'scotland', output_dir)
    process_devolved(os.path.join(input_dir, 'wales_lad.json'), 'wales', output_dir)
    process_devolved(os.path.join(input_dir, 'ni_lgd.json'), 'northern-ireland', output_dir)

    print("\nDone!")


if __name__ == '__main__':
    main()
