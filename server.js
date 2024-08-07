const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Configure CORS to allow requests from client application
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'POST',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Endpoint to register for a Zoom webinar
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, webinarId } = req.body;

  console.log('Received registration request with data:', { firstName, lastName, email, webinarId });

  try {
    // Get Zoom access token
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: process.env.REACT_APP_ZOOM_ACCOUNT_ID,
      },
      auth: {
        username: process.env.REACT_APP_ZOOM_CLIENT_ID,
        password: process.env.REACT_APP_ZOOM_CLIENT_SECRET,
      },
      timeout: 10000 // Increase timeout to 10 seconds
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('Zoom Access Token:', accessToken);

    // Register user for the webinar
    const registrationResponse = await axios.post(
      `https://api.zoom.us/v2/webinars/${webinarId}/registrants`, // Corrected the URL
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        timeout: 10000 // Increase timeout to 10 seconds
      }
    );

    console.log('Zoom Registration Response:', registrationResponse.data);
    res.json(registrationResponse.data);
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('Error during registration:', error.response.data); // Detailed error message
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      res.status(500).json({ message: 'No response received from Zoom API' });
    } else {
      // Something else happened in making the request
      console.error('Error during registration:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
