const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const Groq = require("groq-sdk");
const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://ItayBiton:itay1234@atlascluster.dgff8bz.mongodb.net/AI_Vacation`)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");
});

const app = express();
// make sure to do: export GROQ_API_KEY=<api-key>
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {});

/*
 * 
 * Routing for the server
 * 
 */

app.get('/', (req, res) => {
  res.send('Express server is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is healthy'
    });
});

app.get('/generate-image', async (req, res) => {
    const { country, tripId } = req.query;

    try {
        const imageId = await generateImage(country);
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendUpdate = async () => {
            // Check image generation status
            waitTime = await checkImageStatus(imageId)
            if (waitTime > 0) {
                res.write(`data: ${JSON.stringify({ waitTime })}\n\n`);
                setTimeout(sendUpdate, 2000); 
            } else {
                let imageUrl = null;
                while (!imageUrl) {
                    imageUrl = await getImageStatus(imageId);
                    if (!imageUrl) {
                        console.log('Waiting for image to be transferred...');
                        await new Promise((resolve) => setTimeout(resolve, 5000));
                    }
                }
                updateTripWithImage(tripId, imageUrl)
                res.write(`data: ${JSON.stringify({ imageUrl })}\n\n`);
                res.end();
            }
        };

        sendUpdate();
    } catch (error) {
        console.error('Error in /generate-image route:', error.message);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

app.post('/generate-route', async (req, res) => {
    const { country, travelType } = req.body;
  
    try {
        let id = 0
        const routeData = await getRoute(country, travelType);
        const Trip = mongoose.model('Trip', mongooseTripSchema, 'Trips');
        await new Trip(routeData).save()
            .then(trip => {
                console.log("Trip to "+ trip.Country + " saved to Trips collection.")
                id = trip._id
            })
            .catch(err => console.error(err));
        const responseData = {
            tripId: id,
            ...routeData
        };
        res.json(responseData);
    } catch (error) {
        console.error('Error generating route:', error.message);
        res.status(500).json({ error: 'Failed to generate route' });
    }
  });


/*
 * 
 *  Image generation part using stablehorde api
 * 
 */

async function generateImage(country) {
    const prompt = `A realistic image representing ${country}`;
    const apiUrl = 'https://stablehorde.net/api/v2/generate/async';
    const apiKey = '0000000000';

    try {
        const response = await axios.post(
        apiUrl,
        {
            prompt: prompt,
            params: {
            cfg_scale: 7.5,
            denoising_strength: 0.75,
            seed: Math.floor(Math.random() * 1000000).toString(),
            height: 512,
            width: 512,
            seed_variation: 1,
            steps: 10,
            }
        },
        {
            headers: {
            'accept': 'application/json',
            'apikey': apiKey,
            'Client-Agent': 'unknown:0:unknown', 
            'Content-Type': 'application/json',
            },
        }
        );

        if (!response.data.id) {
            throw new Error('Invalid response from StableHorde API');
        }

        // Returning the job ID to check the status
        return response.data.id;
    } catch (error) {
        console.error('Error generating image:', error.message);
        throw error;
    }
}

async function getImageStatus(imageId) {
    const statusUrl = `https://stablehorde.net/api/v2/generate/status/${imageId}`;

    try {
        const response = await axios.get(statusUrl);
        if (response.data.done && response.data.generations[0].img) {
            return response.data.generations[0].img;
        }
        return null;
    } catch (error) {
        console.error('Error checking image status:', error);
        throw error;
    }
}

async function checkImageStatus(imageId) {
    const statusUrl = `https://stablehorde.net/api/v2/generate/check/${imageId}`;

    try {
        const response = await axios.get(statusUrl);
        if (response.data.done) 
            return 0
        else if (response.data.waiting > 0 && response.data.wait_time === 0)
            return 1
        return response.data.wait_time
    } catch (error) {
        console.error('Error checking image status:', error);
        throw error;
    }
}

/*
 * 
 *  AI route generation part using the groq cloud api
 * 
 */


async function getRoute(country, travelType) {
    const jsonSchema = JSON.stringify(routeSchema, null, 4);
    const chatCompletion = await groq.chat.completions.create({
        messages: [
        {
            role: "system",
            content: `You are a route database that outputs routes in JSON.\n'The JSON object must use the schema: ${jsonSchema}`,
        },
        {
            role: "user",
            content: `Generate a detailed, three-day consecutive travel route through ${country} using a ${travelType}. The route should adhere to the following constraints:
1) For bikes: maximum of 80 km per day.
2) For cars: between 80 km and 300 km per day.
3) Each day's route must begin where the previous day's route ended.
Each day's route must include:
- The total distance in kilometers.
- Detailed waypoints, including name, position, and whether a trekking path is available.
- Descriptive information for each waypoint, including 2-3 sentences about points of interest.
- Information on any available trekking paths.
Maximize the number of waypoints while respecting the travel constraints. Ensure each day's route is cohesive and logical, with a recap summarizing the day's travel experience. Provide as much detail as possible to make the route engaging and informative.`
            },
        ],
        model: "llama3-8b-8192", 
        temperature: 0.5, 
        stream: false,
        response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}

/*
 * 
 * Mongo helper functions 
 * 
 */

const updateTripWithImage = async (tripId, imageUrl) => {
    try {
        const Trip = mongoose.model('Trip', mongooseTripSchema, 'Trips');
        await Trip.findByIdAndUpdate(
            tripId, 
            { imageUrl: imageUrl },
            { new: true } 
        );
        console.log("Updated trip with image");
    } catch (err) {
        console.error("Error updating trip with image:", err);
    }
};

/*
 * 
 *  Data schemas:
 * 
 */

const routeSchema = {
    Country: { type: "string" },
    travelType: { type: "string" },
    TotalDistance: { type: "number" },
    Day1: {
        waypoints: {
            name: { type: "string" },
            hasTrek: { type: "boolean" },
            trekDetails: { type: "string" },
            information: { type: "string" },
            position: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
            }
        },
        dailyDistance: { type:"number"},
        dayRecap: { type:"string" }
    },
    Day2: {
        waypoints: {
            name: { type: "string" },
            hasTrek: { type: "boolean" },
            trekDetails: { type: "string" },
            information: { type: "string" },
            position: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
            }
        },
        dailyDistance: { type:"number" },
        dayRecap: { type:"string" }
    },
    Day3: {
        waypoints: {
            name: { type: "string" },
            hasTrek: { type: "boolean" },
            trekDetails: { type: "string" },
            information: { type: "string" },
            position: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
            }
        },
        dailyDistance: { type:"number" },
        dayRecap: { type:"string" }
    }
}

// Sub-schema for Waypoints
const waypointSchema = new mongoose.Schema({
    name: { type: String },
    hasTrek: { type: Boolean },
    trekDetails: { type: String },
    information: { type: String },
    position: {
        type: [Number],
        validate: [arrayLimit, 'Position array should have exactly 2 numbers']
    }
});

// Custom validation function for the position array
function arrayLimit(val) {
    return val.length === 2;
}

// Sub-schema for a Day
const daySchema = new mongoose.Schema({
    waypoints: [waypointSchema],
    dailyDistance: { type: Number },
    dayRecap: { type: String }
});

// Main Schema for the Route
const mongooseTripSchema = new mongoose.Schema({
    Country: { type: String },
    travelType: { type: String },
    TotalDistance: { type: Number },
    imageUrl: { type: String },
    Day1: daySchema,
    Day2: daySchema,
    Day3: daySchema
});
