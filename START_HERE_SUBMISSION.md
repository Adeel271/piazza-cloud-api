# START HERE — Piazza Submission Project

This package contains the completed Piazza source code, JWT authentication, MongoDB models, required REST endpoints, a twenty-case automated test runner, Postman files, Docker files, Kubernetes manifests with five replicas and a LoadBalancer, report files, and evidence folders.

## Fastest local run

1. Install and open Docker Desktop.
2. Extract this ZIP and open the extracted folder in Visual Studio Code.
3. Click **Terminal → New Terminal**.
4. Run:

```powershell
docker compose up --build -d
```

5. Open `http://localhost:3000/health`.
6. In the terminal run:

```powershell
npm install
npm run test:coursework
```

7. Stop the project when finished:

```powershell
docker compose down
```

## Before final university submission

You must personally add:

- your name and student ID in the technical report;
- your GitHub repository URL;
- your Docker Hub username in `kubernetes/deployment.yaml`;
- your own MongoDB Atlas and JWT secrets for cloud deployment;
- genuine screenshots from your Postman, Google Cloud VM, Docker, GKE, five pods and LoadBalancer runs.

Do not submit `.env`, passwords, tokens or cloud credentials.
