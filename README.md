
# AI_Vacation

AI_Vacation is a web application that generates a 3-day trip plan using AI. Users can enter a desired location and mode of transport (bike or car), and the app provides a complete trip plan including routes, waypoints, a map, and an AI-generated image representing the location. The project consists of a React-based frontend and a Node.js backend using Express and MongoDB.

### [Link to actual site](https://ai-vacation.vercel.app)

## Features
- **Location-based trip generation**: Enter a location and the mode of transport (bike/car) to generate a 3-day trip plan.
- **AI-generated images**: Automatically generate a representative image of the location using the StableHorde API.
- **Route mapping**: View waypoints and routes for the trip on an interactive map using Leaflet.
- **Trip data**: Get day-by-day details for the trip, including stops and treks, generated with the Groq API.
- **Database integration**: Store trip data and images in MongoDB for future retrieval.

## Purpose
This project helps travelers plan a 3-day trip to a destination of their choice, providing:
1. A detailed itinerary for each day of the trip.
2. Interactive maps to view travel routes and stop points.
3. AI-generated images to give a visual representation of the selected destination.
4. Flexible trip options based on transportation mode (bike or car).

## Screenshots
<p align="center">
   <img src="./Screenshots/Dashboard1.png" alt="Dashboard 1" width="200"/> 
   <img src="./Screenshots/Dashboard2.png" alt="Dashboard 2" width="200"/> 
</p>

## Tech Stack
### Frontend (Client)
- **React**: For building the user interface.
- **Leaflet**: For interactive map rendering.
  
### Backend (Server)
- **Node.js & Express**: For handling server-side logic.
- **MongoDB**: For storing trip data and images.

## APIs Used
- **StableHorde API**: Generates images representing the location.
- **Groq API**: Provides a 3-day trip itinerary.
- **Leaflet**: Displays maps with waypoints and routes.
  
## Installation
### Prerequisites
- Node.js
- MongoDB
- A StableHorde API key and Groq API key.

### Steps
1. **Clone the repository**:
   `
   git clone https://github.com/Itay-Biton/AI_Vacation.git
   cd AI_Vacation
   `

2. **Install dependencies**:
   - Navigate to the `client` folder and run:
     `npm install`
   - Navigate to the `server` folder and run:
     `npm install`

3. **Set up environment variable**:
   - Add ` export GROQ_API_KEY=your_groq_api_key`
   - For faster image generation add `STABLEHORDE_API_KEY=your_stablehorde_api_key`
     or keep using the free key: `0000000000`

5. **Run the server**:
   Navigate to the `server` folder and start the server:
   `npm start`

6. **Run the client**:
   Navigate to the `client` folder and start the frontend:
   `npm start`

## Usage
1. Open the app in your browser.
2. Enter the desired location and mode of transport (bike/car).
3. The app will generate:
   - An image representing the location.
   - A 3-day trip itinerary with stops and routes.
   - A map displaying the waypoints and routes.

## Contact

If you have any questions or feedback, don't hesitate to get in touch via [email](mailto:itaybit10@gmail.com).


## License and Copyright

© 2024 Itay Biton. All rights reserved.

This project is owned by Itay Biton. Any unauthorized reproduction, modification, distribution, or use of this project, in whole or in part, is strictly prohibited without explicit permission from the author.

For academic purposes or personal review, please ensure proper credit is given to Itay Biton, and include a link to the original repository.

This project is intended for portfolio demonstration purposes only and must not be duplicated or repurposed without permission. If you're interested in collaborating or using parts of this project for educational reasons, please contact me directly.


## Note to Recruiters

Please note that this project is part of my professional portfolio and should not be copied or reused. If you’re interested in my work or would like to discuss potential job opportunities, feel free to reach out via the provided email. I am open to exploring new projects and opportunities.
