import './style.css';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Deck} from '@deck.gl/core';
import {BASEMAP, vectorTableSource, VectorTileLayer, h3TableSource, H3TileLayer, colorBins} from '@deck.gl/carto';

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

const spatialFeaturesHexSource = h3TableSource({
  ...cartoConfig,
  tableName: 'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
  aggregationExp: 'SUM(population) as total_population',
  aggregationResLevel: 6,
  spatialDataColumn: 'h3',
  columns: ['h3','population','male','female','urbanity']
});

const spatialFeaturesHexLayer = new H3TileLayer({
  id: 'hexes',
  pickable: true,
  data: spatialFeaturesHexSource,
  getFillColor: [200, 0, 80]
})

const deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    populatedPlacesLayer,
    spatialFeaturesHexLayer
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
