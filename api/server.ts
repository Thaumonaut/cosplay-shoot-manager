import { createApp } from '../server/app';
import serverless from 'serverless-http';

let handler: any = null;

export default async function handlerWrapper(req: any, res: any) {
  if (!handler) {
    const app = await createApp();
    handler = serverless(app as any);
  }

  return handler(req, res);
}
