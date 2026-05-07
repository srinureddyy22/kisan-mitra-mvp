# Kisan Mitra AI

Kisan Mitra AI is a farmer-facing crop solution MVP that helps farmers describe their crop problem and get:

- a simple local crop-solution summary
- a 48-hour farmer checklist
- irrigation guidance
- live weather from Open-Meteo
- camera photo capture for crop images
- browser voice-to-text for farmer questions
- local-only guidance without sending questions to an external AI service
- saved local case records
- downloadable field reports

## What The App Does

- collects farmer details like location, crop, crop stage, irrigation source, urgency, and budget focus
- turns field conditions into a practical crop solution board
- lets farmers attach a crop photo from the camera or gallery as a local field reference
- supports microphone-based question entry in supported browsers
- supports common crop problems such as yellowing, wilting, spots, holes, curling, and slow growth
- runs fully in local guidance mode
- saves recent farmer cases in local storage so field teams can reopen them later
- uses a case structure that can be connected to AI later without rebuilding the workflow

## Quick Start

1. Create a `.env` file from `.env.example`
2. Run:

```bash
npm start
```

3. Open `http://localhost:4173`

## Environment

- `PORT`: optional, defaults to `4173`

The app provides local crop-solution logic, irrigation planning, camera preview support, voice input, and live weather lookup without any external AI key.

## Deploy To Render

This project includes [render.yaml](C:/Users/srinu/OneDrive/Documents/New project/render.yaml).

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Render will pick up:
   - `buildCommand: npm install`
   - `startCommand: npm start`
   - `healthCheckPath: /healthz`
4. Deploy and open the generated URL.
