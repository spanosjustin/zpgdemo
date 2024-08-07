import React, {useEffect, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import axios from 'axios';

// Zoom API info
const Z_ACCOUNT_ID = process.env.REACT_APP_ZOOM_ACCOUNT_ID;
const Z_CLIENT_ID = process.env.REACT_APP_ZOOM_CLIENT_ID;
const Z_CLIENT_SECRET = process.env.REACT_APP_ZOOM_CLIENT_SECRET;
const Z_AUTH_URL = process.env.REACT_APP_ZOOM_AUTH_URL;
const Z_BASE_URL = process.env.REACT_APP_ZOOM_API_BASE_URL;

// Authorize.Net API info
const AUTH_LOGIN_ID = process.env.REACT_APP_AUTHORIZE_NET_LOGIN_ID;
const AUTH_KEY = process.env.REACT_APP_AUTHORIZE_NET_KEY;
//const AUTH_CLIENT_KEY = process.env.REACT_APP_AUTHORIZE_NET_CLIENT_KEY;
const AUTH_BASE_URL = process.env.REACT_APP_AUTHORIZE_NET_BASE_URL;

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
    const now = new Date();
    const filteredWebinars = webinars.filter(webinar => new Date(webinar.start_time) >= now);
    //console.log('Webinars:', webinars);
    return filteredWebinars;
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
};

// capturing and charging card function
export const captureAndCharge = async (
  amount, 
  cardNumber,
  expDate,
  cardCode
) => {
  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
          name: AUTH_LOGIN_ID,
          transactionKey: AUTH_KEY,
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: amount,
          payment: {
              creditCard: {
                  cardNumber: cardNumber,
                  expirationDate: expDate,
                  cardCode: cardCode,
          },
        },
      },
    },
  };
  console.log('Authorize.Net Payload:', payload);

  try {
    const response = await axios.post(AUTH_BASE_URL, payload);
    console.log('Authorize.net Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error capturing and charging catf:', error);
    throw error;
  } 
};

function App() {
  const [webinars, setWebinars] = useState([]);
  const [authStatus, setAuthStatus] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchWebinars() {
      try {
        console.log("Fetching access token...");
        const token = await getZoomAccessToken();
        setAccessToken(token);
        setAuthStatus(token ? 'Authenticated' : 'Authentication failed');
        if (token) {
          console.log("Fetching webinars...");
          const fetchedWebinars = await getWebinars(token);
          setWebinars(fetchedWebinars);
        }
      } catch (error) {
        setAuthStatus('Authentication failed');
      }
    }

    fetchWebinars();
  }, []);

  const handleWebinarClick = (webinar) => {
    setSelectedWebinar(webinar);
    //console.log(selectedWebinar);
  }

  // subtmit
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedWebinar) {
      console.log("No webinar selected");
      return;
    }
    
    try {
      const captureResponse = await captureAndCharge(webinarPrice, event.target.cardNumber.value, event.target.expDate.value, event.target.cardCode.value);

      // registration
      if (captureResponse 
            && captureResponse.transactionResponse 
              && captureResponse.transactionResponse.responseCode === '1') {

        const response = await axios.post('http://localhost:3005/api/register', {
          firstName: event.target.firstName.value,
          lastName: event.target.lastName.value,
          email: event.target.email.value,
          webinarId: selectedWebinar.id,
        });

        console.log('Registration response:', response.data);
        setErrorMessage('');
      } else {
        const errorMsg = "There was an error capturing and charging card.";
        setErrorMessage(errorMsg);
        console.log(errorMsg);
      }

    } catch (error) {
      const errorMsg = 'An unknown error occurred';
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(`Registration failed: ${JSON.stringify(error.response.data)}`);
      } else if (error instanceof Error) {
        setErrorMessage(`Registration failed: ${error.message}`);
      }
      console.log('Action Error:', errorMessage);
    }
  };
  
  /*
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedWebinar) {
      console.log("No webinar selected");
      return;
    }
    
    try {
      console.log("webinar price", webinarPrice, 
                  "Card Num", event.target.cardNumber.value, 
                  "Exp Date", event.target.expDate.value,
                  "Code", event.target.cardCode.value,
                  );
      // capture and charge
      const captureResponse = await captureAndCharge(webinarPrice, event.target.cardNumber.value, event.target.expDate.value, event.target.cardCode.value);

      // registration
      if (captureResponse 
            && captureResponse.transactionResponse 
              && captureResponse.transactionResponse.responseCode === '1') {

        console.log("First name", event.target.firstName.value, "Last name", event.target.lastName.value, "email", event.target.email.value);
        
        const response = await axios.post(`${process.env.REACT_APP_ZOOM_API_BASE_URL}/webinars/${selectedWebinar.id}/registrants`, {
          first_name: event.target.firstName.value,
          last_name: event.target.lastName.value,
          email: event.target.email.value,
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log(response.data);

        setErrorMessage('');
      } else {
        const errorMsg = "There was an error capturing and charging card.";
        setErrorMessage(errorMsg);
        console.log(errorMsg);
      }

    } catch (error) {
      const errorMsg = 'An unknown error occurred';
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage("Registration failed,", JSON.stringify(error.response.data));
      } else if (error instanceof Error) {
        setErrorMessage("Registration failed,", error.message);
      }
      console.log('Action Error:', errorMessage);
    }
  };
  */

  return (
    <div className="App">
      <header>
      </header>
      <main>
      <h1>Zoom Payment Gateway</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {/*<p>Auth Status: {authStatus}</p>*/}
      <div className="main-container">
        <div className="webinar-list-container">
          <h1>Upcoming Webinars</h1>
          <ul className="webinar-list">
          {webinars.map((webinar) => (
            <li 
              key={webinar.id} 
              className={`webinar-item ${webinar.topic && webinar.start_time && webinarPrice === webinar.id ? 'selected' : ''}`}
              onClick={() => handleWebinarClick(webinar)}
              >
              <h3>{webinar.topic}</h3>
              <p>Start Time: {webinar.start_time}</p>
              <p>Price: {webinarPrice}</p>
            </li>
          ))}
          </ul>
        </div>
        <div className="form-container">
        <form onSubmit={handleSubmit}>
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
            name="email"
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
            required
            />
          </label>
          <label>
            Exp Date:
            <input 
            type="text"
            name="expDate"
            placeholder="*expDate"
            required
            />
          </label>
          <label>
            Card Code:
            <input 
            type="text"
            name="cardCode"
            placeholder="*Card Code"
            required
            />
          </label>
          <button
            type="submit"
            >
            Register & Pay
          </button>
        </form>
        </div>
        </div>
      </main>
    </div>
  );
}

export default App;
