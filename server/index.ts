import 'dotenv/config';
import { createApp } from './app';
import http from 'http';
import { log } from './vite';

(async () => {
  // start a local server for development / local runs
  const port = parseInt(process.env.PORT || '5000', 10);
  const server = http.createServer();

  // Create the app with the server instance for proper Vite HMR setup
  const app = await createApp(server);
  
  // Attach the app to the server
  server.on('request', app);

  server.listen({ port, host: '0.0.0.0' }, () => {
    log(`serving on port ${port}`);
  });
})();
