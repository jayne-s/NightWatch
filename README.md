# NightWatch
 
NightWatch is a streaming-catalog application built as a small set of containerized services: a **media** service for titles, a **viewers** service for user profiles, and a web **frontend** that brings them together. Everything runs locally with a single Docker Compose command.

## Architecture

| Component | Path | Port | Description |
|-----------|------|------|-------------|
| Frontend  | `frontend/` | 5173 | Web UI served by the Vite dev server |
| Media API | `services/media/` | 8001 | Manages the media catalog |
| Viewers API | `services/viewers/` | 8002 | Manages viewer data |
 
Both backend services persist data to SQLite databases stored on a shared Docker volume (`shared_data`, mounted at `/data`).

## Prerequisites
 
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

## Getting Started
 
1. **Clone the repository**
```bash
   git clone https://github.com/jayne-s/NightWatch.git
   cd NightWatch
```
 
2. **Build and start all services**
```bash
   docker compose up --build
```
 
3. **Open the app**
   | Service | URL |
   |---------|-----|
   | Frontend | http://localhost:5173 |
   | Media API | http://localhost:8001 |
   | Viewers API | http://localhost:8002 |

4. **Stop the services**
```bash
   docker compose down
```
