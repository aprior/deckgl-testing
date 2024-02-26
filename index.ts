import './style.css';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Deck} from '@deck.gl/core';
import {BASEMAP, vectorTableSource, VectorTileLayer, h3TableSource, H3TileLayer, colorBins, vectorTilesetSource, boundaryQuerySource} from '@deck.gl/carto';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const accessToken = import.meta.env.VITE_API_ACCESS_TOKEN;
const connectionName = 'carto_dw';
const cartoConfig = {apiBaseUrl, accessToken, connectionName};

const INITIAL_VIEW_STATE = {
  latitude: 39.8097343,
  longitude: -98.5556199,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

// Hex table - US Spatial features

const spatialFeaturesHexSource = h3TableSource({
  ...cartoConfig,
  tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
  aggregationExp: 'SUM(population) as total_population',
  aggregationResLevel: 4,
  spatialDataColumn: 'h3',
  columns: ['h3','population','male','female','urbanity']
});

const spatialFeaturesHexLayer = new H3TileLayer({
  id: 'hexes',
  pickable: true,
  data: spatialFeaturesHexSource,
  opacity: 0.5,
  // getFillColor: [200, 200, 200], 
  getFillColor: colorBins({
    attr: "SUM(population)",
    domain: [0, 100, 1000, 10000, 100000],
    colors: "PinkYl",
    // nullColor: [0, 0, 0]
  }),
  stroked: true,
  getLineColor: [0, 0 , 0, 0.7],
})

// Vector table source - Populated places

const populatedPlacesSource = vectorTableSource({
  ...cartoConfig,
  tableName: 'carto-demo-data.demo_tables.populated_places'
});

const populatedPlacesLayer = new VectorTileLayer({
  id: 'places',
  pickable: true,
  data: populatedPlacesSource,
  pointRadiusMinPixels: 3,
  getFillColor: [200, 0, 80]
});

const osmBuildingsSource = vectorTilesetSource({
  ...cartoConfig,
  tableName: 'carto-demo-data.demo_tilesets.osm_buildings'
});

const osmBuildingsLayer = new VectorTileLayer({
  id: 'buildings',
  pickable: true,
  data: osmBuildingsSource,
  pointRadiusMinPixels: 3,
  getFillColor: [25, 25, 25]
});

// const boundarySource = boundaryQuerySource({
//   ...cartoConfig,
//   tilesetTableName: 'carto-boundaries.us.tileset_usa_state_v1'
//   // propertiesSqlQuery: `SELECT geoid, value FROM your-project.your_dataset.your_table`,
//   // matchingColumn: 'geoid',
//   // queryParameters: {}
// });

// const boundaryLayer = new VectorTileLayer({
//   id: 'state-boundaries',
//   pickable: true,
//   data: boundarySource,
//   getLineColor: [0, 0, 0]
// })


const deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    spatialFeaturesHexLayer,
    osmBuildingsLayer,
    populatedPlacesLayer
  ],
  // getTooltip: ({ object }) => 
  //   object && {
  //     html: `
  //       <strong>Name</strong>: ${object.properties.name}<br/>
  //       <strong>Latitude</strong>: ${object.geometry.coordinates[0].toFixed(
  //         6
  //       )}<br/>
  //       <strong>Latitude</strong>: ${object.geometry.coordinates[1].toFixed(
  //         6
  //       )}
  //     `
  //   }
});

// Add basemap
const map = new maplibregl.Map({
  container: 'map',
  style: BASEMAP.POSITRON,
  interactive: false
});
deck.setProps({
  onViewStateChange: ({viewState}) => {
    const {longitude, latitude, ...rest} = viewState;
    map.jumpTo({center: [longitude, latitude], ...rest});
  }
});
