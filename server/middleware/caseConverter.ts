import { Request, Response, NextFunction } from 'express';

// Helper function to convert camelCase to snake_case
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const snakeCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseObj[snakeKey] = toSnakeCase(value);
  }
  return snakeCaseObj;
}

// Helper function to convert snake_case to camelCase
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = toCamelCase(value);
  }
  return camelCaseObj;
}

// Middleware to automatically convert all response bodies to camelCase
export function responseToCamelCase(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    // Convert the response body to camelCase before sending
    const camelCaseBody = toCamelCase(body);
    return originalJson(camelCaseBody);
  };
  
  next();
}

// Middleware to automatically convert request bodies to snake_case
export function requestToSnakeCase(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = toSnakeCase(req.body);
  }
  next();
}
