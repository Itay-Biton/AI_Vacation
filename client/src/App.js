import React, { useState } from 'react';
import './App.css';
import MapComponent from './MapComponent';

function App() {
    const [country, setCountry] = useState('');
    const [travelType, setTravelType] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [waypoints, setWaypoints] = useState([]);
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
            console.log(routeData.Route.waypoints)
            setWaypoints(routeData.Route.waypoints); 

            // Start image generation with SSE
            /*
            const eventSource = new EventSource(`http://localhost:4000/generate-image?country=${encodeURIComponent(country)}`);

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
            */

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
                        <option value="">Select</option>
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

            {waypoints.length > 0 && (
                <div className="map-container">
                    <h2>Travel Route:</h2>
                    <MapComponent waypoints={waypoints} />
                </div>
            )}
        </div>
    );
}

export default App;