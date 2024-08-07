# zpgdemo
Setting up your Zoom Payment Gateway:

---

## Step 1: Zoom Account Set Up

- Create an account with Zoom's App Marketplace: https://marketplace.zoom.us
- Create a Server to Server OAuth app
- on your app's 'App Credentials' page, either take note of (or use this page
  for reference later) your accountID, Client ID and Client Secret.
- Set up the app's scopes:

If you're setting up for meetings

- meeting:read:meeting:admin
  - Allows you to attain information on meetings.
- meeting:read:list_meetings:admin
  - Allows you to attain a list of all meetings.
- meeting:write:registrant:admin
  - Allows you to register customers to meetings.

If you're setting up webinars:

- webinar:read:webinar:admin
  - Allows you to attain information on webinars.
- webinar:read:list_webinars:admin
  - Allows you to attain a list of all webinars.
- webinar:write:registrant:admin
  - Allows you to register customers to webinars.

---

## Step 2: Authorize.Net Account Set Up

    NOTE: The same process will be nearly identical for your sandbox account as your merchant account set up.

- Create your account or login
- Once inside your account, navigate to your 'Account' tab
- Under 'Security Setting' subsection, select the link to your: 'API Credentials
  & Keys'
- Either take note of (or use this page for reference later) your:
  - API Login ID
  - Transaction Key

---

DON"T FORGET
To set up the proxy server before running your local host for demos
- node server.js
Then
- npm start
