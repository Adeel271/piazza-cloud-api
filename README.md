# Piazza Cloud API

A RESTful cloud Software as a Service for a topic-based discussion system. The implementation uses Node.js, Express, MongoDB, Mongoose and bearer JSON Web Tokens (JWTs). Users can register, authenticate, publish posts, browse by topic, like, dislike and comment. Expired posts stay visible but reject further interactions.

## Coursework coverage

- JWT-protected API resources
- User registration, login and profile
- Topics: Politics, Health, Sport and Tech
- Posts with title, message, owner, timestamp, expiry and calculated status
- Likes, dislikes and comments with user and timestamp information
- Owner cannot like or dislike their own post
- Duplicate likes/dislikes are rejected; changing reaction removes the earlier reaction
- Expired-post history by topic
- Most-active live post by likes plus dislikes
- Automated implementation of the 20 required test cases
- Docker and Docker Compose
- Kubernetes Deployment with five replicas and a LoadBalancer Service

## Requirements

- Node.js 18 or newer
- npm
- Either MongoDB Community Server, MongoDB Atlas, or Docker Desktop

## Run locally on Windows

1. Extract the project.
2. Double-click `RUN_WINDOWS.bat` once. It creates `.env` if missing.
3. Open `.env` and configure it. For local MongoDB:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/piazza
JWT_SECRET=replace_this_with_a_long_random_private_value
JWT_EXPIRES_IN=2h
```

4. Double-click `RUN_WINDOWS.bat` again.
5. Open `http://localhost:3000/health`.

PowerShell alternative:

```powershell
npm install
copy .env.example .env
npm start
```

## Run with Docker Compose

```powershell
docker compose up --build
```

The API is available at `http://localhost:3000` and MongoDB data is stored in a named Docker volume.

## Run the 20 coursework test cases

Keep the API running. Open another terminal in the project folder:

```powershell
npm run test:coursework
```

A successful run ends with:

```text
Result: 20 passed, 0 failed.
```

The test uses unique email addresses on every run. The Health post lasts 3.5 seconds so expiry behaviour can be demonstrated without waiting several minutes.

## Postman

Import both files from `postman/`:

- `Piazza_API.postman_collection.json`
- `Piazza.postman_environment.json`

Select the `Piazza Local` environment. The Login request automatically stores the returned JWT in `token`; Create Tech Post stores the returned identifier in `postId`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/profile` | View authenticated profile |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts` | Browse all posts |
| GET | `/api/posts/:postId` | Browse one post |
| GET | `/api/posts/topic/:topic` | Browse posts by topic |
| POST | `/api/posts/:postId/like` | Like a live post |
| POST | `/api/posts/:postId/dislike` | Dislike a live post |
| POST | `/api/posts/:postId/comments` | Comment on a live post |
| GET | `/api/posts/topic/:topic/expired` | Browse expired topic history |
| GET | `/api/posts/topic/:topic/most-active` | Find highest-interest live post |

All post endpoints require `Authorization: Bearer <token>`.

## Docker image

Build and run manually:

```powershell
docker build -t YOUR_DOCKERHUB_USERNAME/piazza-cloud-api:1.0 .
docker run --env-file .env -p 3000:3000 YOUR_DOCKERHUB_USERNAME/piazza-cloud-api:1.0
```

Push after logging in:

```powershell
docker push YOUR_DOCKERHUB_USERNAME/piazza-cloud-api:1.0
```

## Kubernetes

1. Replace `YOUR_DOCKERHUB_USERNAME` in `kubernetes/deployment.yaml`.
2. Copy `kubernetes/secret.example.yaml` to `kubernetes/secret.yaml`.
3. Base64-encode your real MongoDB URI and JWT secret and insert them into `secret.yaml`.
4. Do not commit `secret.yaml`.
5. Apply the resources:

```powershell
kubectl apply -f kubernetes/secret.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl get pods
kubectl get services
```

The Deployment requests five replicas and the Service type is `LoadBalancer`.

## Structure

```text
src/config          database connection
src/controllers     request handling and application rules
src/middleware      JWT, validation and errors
src/models          MongoDB schemas
src/routes          REST endpoint definitions
tests               20-case demonstration runner
postman             importable test collection/environment
kubernetes          deployment, service and secret template
docs                technical report draft
evidence            locations for genuine screenshots
```

## Security notes

- Passwords are hashed with bcrypt.
- JWT secrets and database credentials belong only in `.env` or Kubernetes Secret resources.
- `.env` and `kubernetes/secret.yaml` are ignored by Git.
- Helmet security headers and request validation are enabled.

## Submission

Report & Code submitted with evidence
