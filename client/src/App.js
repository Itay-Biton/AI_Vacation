import React, { useState } from 'react';
import './App.css';
import MapComponent from './MapComponent';

function App() {
    const [country, setCountry] = useState('');
    const [travelType, setTravelType] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [waypoints1, setWaypoints1] = useState([]);
    const [waypoints2, setWaypoints2] = useState([]);
    const [waypoints3, setWaypoints3] = useState([]);
    const [tripDetails, setTripDetails] = useState(null); 
    const [waitTime, setWaitTime] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setWaitTime(null); // Reset wait time

        try {
            // Fetch route data
            const response = await fetch('http://localhost:4000/generate-route', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ country, travelType }),
            });

            const routeData = await response.json();

            setTripDetails(routeData); 
            setWaypoints1(routeData.Day1.waypoints); 
            setWaypoints2(routeData.Day2.waypoints); 
            setWaypoints3(routeData.Day3.waypoints); 

            // Start image generation with SSE
            const eventSource = new EventSource(`http://localhost:4000/generate-image?country=${encodeURIComponent(country)}&tripId=${encodeURIComponent(routeData.tripId)}`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.waitTime) {
                    setWaitTime(data.waitTime);
                } else if (data.imageUrl) {
                    setImageUrl(data.imageUrl);
                    setLoading(false);
                    eventSource.close(); 
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                setLoading(false);
                eventSource.close();
            };
            
        } catch (error) {
            console.error('Error fetching route data:', error);
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <h1>Create a Travel Route</h1>
            <form onSubmit={handleSubmit} className="form-container">
                <label className="form-label">
                    Country:
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="form-input"
                    />
                </label>
                <label className="form-label">
                    Travel Type:
                    <select
                        value={travelType}
                        onChange={(e) => setTravelType(e.target.value)}
                        className="form-input"
                    >
                        <option value="" disabled>Select</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                    </select>
                </label>
                <button type="submit" className="submit-button">Create Route</button>
            </form>

            {loading && (
                <div className="loading-container">
                    <p className="loading-text">Loading image...</p>
                    {waitTime && <p className="wait-time">Estimated wait time: {waitTime} seconds</p>}
                </div>
            )}

            {imageUrl && (
                <div className="image-container">
                    <h2>Generated Image:</h2>
                    <img src={imageUrl} alt="Generated landscape" className="generated-image" />
                </div>
            )}

            {tripDetails && (
                <div className="trip-details">
                    <h2>3-Day Trip in {tripDetails.Country}</h2>
                    <p><strong>Travel Type:</strong> {tripDetails.travelType}</p>
                    <p><strong>Total Distance:</strong> {tripDetails.TotalDistance} km</p>

                    <div className="day-recap">
                        <h3>Day 1</h3>
                        <p><strong>Daily Distance:</strong> {tripDetails.Day1.dailyDistance} km</p>
                        <p>{tripDetails.Day1.dayRecap}</p>
                        <ul>
                            {tripDetails.Day1.waypoints.map((waypoint, index) => (
                                <li key={index}>
                                    <strong>{waypoint.name}:</strong> 
                                    <p>{waypoint.information}</p>
                                    {waypoint.hasTrek && (
                                        <p><em>Trek available:</em> {waypoint.trekDetails}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="day-recap">
                        <h3>Day 2</h3>
                        <p><strong>Daily Distance:</strong> {tripDetails.Day2.dailyDistance} km</p>
                        <p>{tripDetails.Day2.dayRecap}</p>
                        <ul>
                            {tripDetails.Day2.waypoints.map((waypoint, index) => (
                                <li key={index}>
                                    <strong>{waypoint.name}:</strong> 
                                    <p>{waypoint.information}</p>
                                    {waypoint.hasTrek && (
                                        <p><em>Trek available:</em> {waypoint.trekDetails}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="day-recap">
                        <h3>Day 3</h3>
                        <p><strong>Daily Distance:</strong> {tripDetails.Day3.dailyDistance} km</p>
                        <p>{tripDetails.Day3.dayRecap}</p>
                        <ul>
                            {tripDetails.Day3.waypoints.map((waypoint, index) => (
                                <li key={index}>
                                    <strong>{waypoint.name}:</strong>
                                    <p>{waypoint.information}</p>
                                    {waypoint.hasTrek && (
                                        <p><em>Trek available:</em> {waypoint.trekDetails}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {tripDetails !== null && waypoints1.length > 0 && waypoints2.length > 0 && waypoints3.length > 0 && (
                <div className="map-container">
                    <h2>Travel Route:</h2>
                    <div className="map-legend">
                        <span className="color-box" style={{ backgroundColor: 'blue' }}></span> Day One
                        <span className="color-box" style={{ backgroundColor: 'green' }}></span> Day Two
                        <span className="color-box" style={{ backgroundColor: 'red' }}></span> Day Three
                    </div>
                    <MapComponent waypoints1={waypoints1} waypoints2={waypoints2} waypoints3={waypoints3} />
                </div>
            )}
        </div>
    );
}

export default App;