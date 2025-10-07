import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';
import { log } from './logger';
import http from 'http';

export async function createApp(server?: http.Server): Promise<express.Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    // @ts-ignore
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      // @ts-ignore
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (path.startsWith('/api')) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          try {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          } catch (e) {}
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + '…';
        }

        log(logLine);
      }
    });

    next();
  });

  // register routes and return the app
  await registerRoutes(app as any);

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    // keep throwing so dev tooling can see it
    throw err;
  });

  // serve static or setup vite depending on env
  if (app.get('env') === 'development') {
    // Only setup Vite if we have the actual server instance
    if (server) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setupVite(app, server);
    } else {
      console.warn('Development mode: Server instance not provided for Vite setup');
    }
  } else {
    serveStatic(app);
  }

  return app;
}

export type { express };
