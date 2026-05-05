# vt-fake (VTMen)

Full-stack app: **Next.js** frontend and **Spring Boot** backend with **MongoDB**, WebSockets (STOMP/SockJS), and optional DCS/robot integrations.

## Prerequisites

Install these on your machine before running the project:

| Tool | Version (this repo) | Role |
|------|---------------------|------|
| **Node.js** | 20.x LTS or newer recommended | Next.js 16 / React 19 |
| **npm** | Comes with Node | Frontend install and scripts |
| **Java JDK** | **17** (required by `backend/pom.xml`) | Spring Boot backend |
| **Apache Maven** | 3.6+ | Build and run the backend |
| **MongoDB** | 4.4+ or **MongoDB Atlas** | Data store for the backend |

Frontend **npm dependencies** are declared in `package.json` (Next.js, React, Tailwind, STOMP/SockJS clients, UI libraries, etc.) and are installed with `npm install`. Backend **Maven dependencies** (Spring Web, WebSocket, Spring Data MongoDB, devtools, tests) are resolved automatically on the first `mvn` run.

## Configuration

### Backend — MongoDB

The backend expects a MongoDB connection string. In `backend/src/main/resources/application.properties`, `spring.data.mongodb.uri` is empty by default. Set it in either of these ways:

- Edit `application.properties`: `spring.data.mongodb.uri=<your-connection-string>`
- Or set an environment variable (overrides the file): `SPRING_DATA_MONGODB_URI=<your-connection-string>`

Other backend settings (ports, DCS URLs, `notify.backend.url`, etc.) live in the same `application.properties` file.

### Frontend — API and WebSocket (optional for local default)

Create **`.env.local`** in the project root if the backend is not at `http://localhost:8080`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=http://localhost:8080
NEXT_PUBLIC_DCS_MAP_NAME=Trường đại học
```

If you omit these, the app defaults to `http://localhost:8080/api` for REST and you should set `NEXT_PUBLIC_WS_URL` when the Next dev server runs on port **3000** and the WebSocket server is on **8080** (see `document.txt` for a longer handoff guide).

## Run the project

1. **Start MongoDB** (local service or Atlas with network access allowed).

2. **Backend** (from repo root):

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   API and WebSocket typically listen on **http://localhost:8080** (see `server.port` in `application.properties`).

3. **Frontend** (new terminal, repo root):

   ```bash
   npm install
   npm run dev
   ```

4. Open **http://localhost:3000** in the browser.

### Production-style frontend build

```bash
npm run build
npm start
```

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Learn more

- Env and infra checklist: `document.txt`
- [Next.js documentation](https://nextjs.org/docs)
- [Spring Boot documentation](https://docs.spring.io/spring-boot/documentation.html)
