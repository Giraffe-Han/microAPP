# Backend Server for Low Altitude Service Platform

This is a simple Node.js backend server to handle application submissions and provide an admin interface API.

## Setup

1.  Navigate to this directory: `cd server`
2.  Install dependencies: `npm install`

## Running

Start the server with:

```bash
node index.js
```

The server runs on `http://localhost:3000`.

## API Endpoints

*   `POST /api/submit`: Submit a new application.
*   `GET /api/list`: Get list of applications. Supports `startDate` and `endDate` query parameters.
*   `GET /api/export`: Export applications to Excel. Supports `startDate` and `endDate` query parameters.

## Data Storage

Data is stored in `data.json` in this directory.
