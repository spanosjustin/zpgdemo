import logo from './logo.svg';
import './App.css';

const Z_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const Z_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const Z_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

function App() {
  return (
    <div className="App">
      <header>
        <p>
          Register
        </p>
      </header>
      <main>
        <p> Hey</p>
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
      </main>
    </div>
  );
}

export default App;
