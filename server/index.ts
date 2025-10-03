import { createApp } from './app';
import http from 'http';
import { log } from './vite';

(async () => {
  const app = await createApp();

  // start a local server for development / local runs
  const port = parseInt(process.env.PORT || '5000', 10);
  const server = http.createServer(app as any);

  server.listen({ port, host: '0.0.0.0' }, () => {
    log(`serving on port ${port}`);
  });
})();
