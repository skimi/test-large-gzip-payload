# test-large-gzip-payload

A simple Node.js project to test handling of extremely large, highly compressible JSON payloads over HTTP, with gzip compression. Includes a minimal server and a browser-based client for experimentation.

## Features

- Generates and serves huge JSON payloads (hundreds of MB, configurable)
- Streams the response and compresses it with gzip
- Simple API endpoint: `/api/huge` (POST)
- Frontend UI for manual testing (fetch/XHR)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

```bash
yarn install
# or
npm install
```

### Running the Project

This project uses `concurrently` to run both the backend server and a static file server for the frontend.

```bash
yarn start
# or
npm start
```

- The backend server runs on [http://localhost:3000](http://localhost:3000)
- The frontend (index.html) is served at [http://localhost:8080](http://localhost:8080)

## Usage

1. Open [http://localhost:8080](http://localhost:8080) in your browser.
2. Enter the desired payload size in MB (default: 700).
3. Click either "Fetch Huge Payload (fetch)" or "Fetch Huge Payload (XHR)" to request the payload from the backend.
4. The result will show the decompressed string size and a preview of the data.

## API

### `POST /api/huge`
- **Request body:** `{ "sizeMB": <number> }` (optional, default: 700)
- **Response:** Gzipped JSON object, where each key is a chunk of 50MB (e.g., `{ "chunk0": "AAAA...", "chunk1": "AAAA...", ... }`)
- **Headers:**
  - `Content-Type: application/json`
  - `Content-Encoding: gzip`
  - `Access-Control-Allow-Origin: *`

## Bug

## Chrome Version 138.0.7204.93 (Official Build) (arm64)

- Above a certain payload ~600Mb on my machine
- Chrome returns an empty string instead of deflating

(if the payload is large enough the browser crashes)

## Safari Version 18.5 (20621.2.5.11.8)

Works fine

## Firefox 140.0.2 (aarch64)

Unsure, data is there but incomplete after 1024Mb