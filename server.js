// server.js is the entry point used by npm start and Docker.
require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./src/config/database');

const port = Number(process.env.PORT || 3000);

// Stop immediately if the signing secret has not been configured.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and edit it.');
  process.exit(1);
}

// Connect to MongoDB first. Only start accepting requests after it succeeds.
connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Piazza API running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Application startup failed:', error.message);
    process.exit(1);
  });
