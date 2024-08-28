import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './App.css';

// Custom icon
const customIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const RoutingControl = ({ waypoints1, waypoints2, waypoints3 }) => {
  const map = useMap();

  useEffect(() => {
    if (map !== null) {
      if (waypoints1 && waypoints1.length > 1) {
        createRoute(waypoints1, 1);
      }
      if (waypoints2 && waypoints2.length > 1) {
        createRoute(waypoints2, 2);
      }
      if (waypoints3 && waypoints3.length > 1) {
        createRoute(waypoints3, 3);
      }
    }
  }, [waypoints1, waypoints2, waypoints3, map]);

  const createRoute = (waypoints, routeIndex) => {
    let routeColor = getRouteColor(routeIndex)
    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp.position[0], wp.position[1])),
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ opacity: 0 }, { color: routeColor, weight: 2 }, { opacity: 0 }],
      },
      createMarker: function(i, waypoint, n) {
        return L.marker(waypoint.latLng, {
          icon: customIcon,
        }).bindPopup(waypoints[i] !== undefined ? "Stop number: "+i+" "+waypoints[i].name : "");
      },
    }).addTo(map);
  };

  const getRouteColor = (routeIndex) => {
    switch (routeIndex) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'red';
      default:
        return 'black';
    }
  };
  return null;
};

const MapComponent = ({ waypoints1, waypoints2, waypoints3 }) => {
  // Center map on the first waypoint
  const center = waypoints1.length ? waypoints1[0].position : [51.505, -0.09];

  return (
    <MapContainer center={center} zoom={7} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RoutingControl waypoints1={waypoints1} waypoints2={waypoints2} waypoints3={waypoints3} />
    </MapContainer>
  );
};

export default MapComponent;