import React, {useEffect, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';


const Z_ACCOUNT_ID = process.env.REACT_APP_ZOOM_ACCOUNT_ID;
const Z_CLIENT_ID = process.env.REACT_APP_ZOOM_CLIENT_ID;
const Z_CLIENT_SECRET = process.env.REACT_APP_ZOOM_CLIENT_SECRET;
const Z_AUTH_URL = process.env.REACT_APP_ZOOM_AUTH_URL;
const Z_BASE_URL = process.env.REACT_APP_ZOOM_API_BASE_URL;

/*
const Z_ACCOUNT_ID = 'jndL9khkRrOWgCa9ODk2CA';
const Z_CLIENT_ID = 'wXjzQC4NTPSOYiJqoo1D0A';
const Z_CLIENT_SECRET = 'a2kney7NBX5ihiPOEzkQEr5sX1TUvARv';
const Z_AUTH_URL = '/oauth/token';
const Z_BASE_URL = '/v2';
*/
const webinarPrice = 12.99;

// accessing zoom
export async function getZoomAccessToken() {
  //console.log('In getZoomAccessToken');
  try {
    const response = await axios.post(
      Z_AUTH_URL,
      null,
      {
        params: {
          grant_type: 'account_credentials',
          account_id: Z_ACCOUNT_ID,
        },
        auth: {
          username: Z_CLIENT_ID,
          password: Z_CLIENT_SECRET,
        },
      }
    );
    //console.log('Response: ', response.data.access_token);
    return response.data.access_token;
    // Error handling
  } catch (error) {
    let errorMessage = 'Failed to fetch access token';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data || error.message;
      } else {
        errorMessage = error.message;
      }
    }

    console.error('Error fetching access token:', errorMessage);
    throw new Error(errorMessage);
  }
};

// fetching webinars
export async function getWebinars(accessToken) {
  try {
    const response = await axios.get(`${Z_BASE_URL}/users/me/webinars`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const webinars = response.data.webinars;
    console.log('Webinars:', webinars);
    return response.data.webinars;
  } catch (error) {
    let errorMessage = 'Failed to fetch webinars';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = error.response.data?.messager || error.response.data || error.message;
      } else {
        errorMessage = error.message;
      }
    }

    console.error('Error fetching webinars:', errorMessage);
    throw new Error(errorMessage);
  }
}

function App() {
  const [webinars, setWebinars] = useState([]);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    async function fetchWebinars() {
      try {
        console.log("Fetching access token...");
        const token = await getZoomAccessToken();
        setAuthStatus(token ? 'Authenticated' : 'Authentication failed');
        if (token) {
          console.log("Fetching webinars...");
          const fetchedWebinars = await getWebinars(token);
          setWebinars(fetchedWebinars);
        }
      } catch (errro) {
        setAuthStatus('Authentication failed');
      }
    }

    fetchWebinars();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitted");
  }

  return (
    <div className="App">
      <header>
        <p>
          Register
        </p>
      </header>
      <main>
        <div>
        <p>Auth Status: {authStatus}</p>
          <h1>Upcoming Webinars</h1>
          {webinars.map((webinar) => (
            <li key={webinar.id}>
              <h3>{webinar.topic}</h3>
              <p>Start Time: {webinar.start_time}</p>
              <p>Price: {webinarPrice}</p>
            </li>
          ))}
        </div>
        <form>
          {/* Zoom Form Details */}
          <label>
            First Name:
            <input 
            type="text"
            name="firstName"
            placeholder="*First Name"
            required
            />
          </label>
          <label>
            Last Name:
            <input 
            type="text"
            name="lastName"
            placeholder="*Last Name"
            required
            />
          </label>
          <label>
            Email:
            <input 
            type="text"
            name="Email"
            placeholder="*Email"
            required
            />
          </label>
          {/* AuthNet Form Details */}
          <label>
            Card Number:
            <input 
            type="text"
            name="cardNumber"
            placeholder="*Card Number"
            //required
            />
          </label>
          <label>
            Exp Date:
            <input 
            type="text"
            name="expDate"
            placeholder="*expDate"
            //required
            />
          </label>
          <label>
            Card Code:
            <input 
            type="text"
            name="cardCode"
            placeholder="*Card Code"
            //required
            />
          </label>
          <button
            type="submit"
            >
            Register & Pay
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
