import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icon
const customIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const MapComponent = ({ waypoints }) => {
  // Center map on the first waypoint
  const center = waypoints.length ? waypoints[0].position : [51.505, -0.09];

  return (
    <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {waypoints.map((waypoint, index) => (
        <Marker key={index} position={waypoint.position} icon={customIcon}>
          <Popup>{waypoint.name}</Popup>
        </Marker>
      ))}
      <Polyline positions={waypoints.map(waypoint => waypoint.position)} color="blue" />
    </MapContainer>
  );
};

export default MapComponent;