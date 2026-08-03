# START HERE — Piazza Submission Project

This package contains source code, JWT authentication, MongoDB models, required REST endpoints, a twenty-case automated test runner, Postman files, Docker files, Kubernetes manifests with five replicas and a LoadBalancer, report files, and evidence folders. These are the instructions made east of what to do in this coursework as completed and provided a full source code is already done from user's end.

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

