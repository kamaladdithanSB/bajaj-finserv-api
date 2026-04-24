# Bajaj Finserv — Backend API Challenge

A production-ready REST API developed as part of the **Bajaj Finserv HackerLeague** hiring challenge. Built with Node.js and Express, the service exposes a well-structured `/bfhl` endpoint that processes graph edge data and returns a computed, structured response. The project is fully deployed on the cloud with a companion frontend tester for live interaction.

---

## Table of Contents

- [Overview](#overview)
- [Live Deployment](#live-deployment)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

This project was built to satisfy the requirements of the BFHL coding round. The core objective was to design and deploy a RESTful API that:

- Accepts a JSON payload containing an array of graph edge strings
- Processes and analyzes the input (identifying valid edges, invalid entries, cycles, and duplicates)
- Returns a clean, structured JSON response
- Handles errors gracefully with appropriate HTTP status codes
- Is accessible publicly via a deployed cloud URL

The solution demonstrates backend API design, Node.js proficiency, RESTful conventions, CORS handling, and cloud deployment — all within a minimal, maintainable codebase.

---

## Live Deployment

| Resource | URL |
|---|---|
| API Base URL | `https://bajaj-finserv-api-1-mo1p.onrender.com` |
| POST Endpoint | `https://bajaj-finserv-api-1-mo1p.onrender.com/bfhl` |
| Frontend Tester | `https://bespoke-blancmange-eeb585.netlify.app/` |

The service is live and accepts requests at any time. The frontend tester allows reviewers to interact with the API directly in the browser without needing Postman or curl.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express v5 |
| Cross-Origin Handling | CORS |
| Frontend Tester | HTML, CSS, Vanilla JavaScript |
| Hosting | Render (Cloud PaaS) |
| Version Control | Git / GitHub |

---

## Project Structure

```
bajaj-finserv-api/
├── bajaj-finserv-api/          # Core API logic and route handlers
├── index.html                  # Standalone browser-based API tester
├── package.json                # Project manifest and dependency definitions
├── package-lock.json           # Locked dependency tree
└── .gitignore                  # Excluded files from version control
```

The project intentionally keeps the structure flat and readable. The API logic is separated from the frontend tester to maintain clear boundaries between server and client concerns.

---

## API Reference

### POST /bfhl

The primary endpoint. Accepts a JSON body containing a `data` array of strings representing directed graph edges and arbitrary values. Returns a structured analysis of the input.

**Request**

```http
POST /bfhl
Content-Type: application/json
```

```json
{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->X", "G->H", "G->H", "hello"]
}
```

**Successful Response — 200 OK**

```json
{
  "is_success": true,
  "user_id": "kamaladditian_sb",
  "valid_edges": ["A->B", "A->C", "B->D", "X->Y", "Y->X", "G->H"],
  "invalid_entries": ["hello"],
  "duplicate_edges": ["G->H"],
  "cycles_detected": [["X", "Y"]]
}
```

**Error Response — 400 Bad Request**

```json
{
  "is_success": false,
  "error": "Invalid or missing data field. Expected a non-empty array."
}
```

**Notes**
- The `data` field must be a non-empty array.
- Entries that do not match the `Node->Node` pattern are classified as invalid.
- Duplicate edges are detected and reported separately.
- Bidirectional pairs (e.g., `X->Y` and `Y->X`) are flagged as cycles.

---

### GET /bfhl

A health check endpoint to verify the server is running and reachable.

**Response — 200 OK**

```json
{
  "operation_code": 1
}
```

---

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm v6 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/kamaladdithanSB/bajaj-finserv-api.git

# Move into the project directory
cd bajaj-finserv-api

# Install dependencies
npm install
```

### Running the Server Locally

```bash
node index.js
```

The API will be available at `http://localhost:3000`.

To verify it is running, visit `http://localhost:3000/bfhl` in your browser or send a GET request — you should receive `{ "operation_code": 1 }`.

---

## Testing

**Using the browser tester**

Open `index.html` in any browser. Enter your JSON input in the text area and click "Run API". The response will render formatted in the output panel below.

**Using curl**

```bash
curl -X POST https://bajaj-finserv-api-1-mo1p.onrender.com/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "A->C", "B->D", "X->Y", "Y->X", "G->H", "G->H", "hello"]}'
```

**Using Postman**

- Method: `POST`
- URL: `https://bajaj-finserv-api-1-mo1p.onrender.com/bfhl`
- Body: `raw` → `JSON`
- Paste the sample payload and send

---

## Deployment

The application is deployed as a Web Service on **Render**, with automatic restarts and zero-downtime availability.

To deploy your own instance:

1. Fork this repository to your GitHub account
2. Log in to [Render](https://render.com) and create a new **Web Service**
3. Connect your forked repository
4. Configure the service with the following settings:

| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `node index.js` |
| Environment | `Node` |
| Plan | Free |

5. Click **Deploy**. Render will build and host the service automatically.

---

## Author

**Kamaladditian SB**  
Full Stack Developer — Node.js, Express, JavaScript  
GitHub: [github.com/kamaladdithanSB](https://github.com/kamaladdithanSB)

---

## License

This project is licensed under the ISC License.
