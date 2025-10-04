import { createApp } from '../api_build/server/app.js';

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;

  // Express apps are callable as functions (req, res, next). Call and return.
  return app(req, res);
}
