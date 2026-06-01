const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const connectDb = require('./src/config/db');
const { initSockets } = require('./src/sockets');
const { logCorsConfig } = require('./src/utils/corsConfig');

const PORT = process.env.PORT || 5000;

const start = async () => {
  logCorsConfig();
  await connectDb();
  const server = http.createServer(app);
  initSockets(server);

  server.listen(PORT, () => {
    console.log(`AgriConnect API running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
