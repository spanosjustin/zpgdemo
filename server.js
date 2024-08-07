const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Endpoint to get Zoom access token
app.post('/api/auth', async (req, res) => {
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        account_id: process.env.REACT_APP_ZOOM_ACCOUNT_ID,
      },
      auth: {
        username: process.env.REACT_APP_ZOOM_CLIENT_ID,
        password: process.env.REACT_APP_ZOOM_CLIENT_SECRET,
      },
    });
    console.log('Access Token Response:', response.data); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching access token:', error.response ? error.response.data : error.message); // Debug log
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { message: error.message });
  }
});

// Endpoint to get webinars
app.get('/api/webinars', async (req, res) => {
  const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is missing or invalid' });
  }

  try {
    console.log('Using Access Token:', accessToken); // Debug log
    const response = await axios.get('https://api.zoom.us/v2/users/me/webinars', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Fetched Webinars:', response.data); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching webinars:', error.response ? error.response.data : error.message); // Debug log
    res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
