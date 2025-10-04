import { getUserIdFromRequest, parseCookies } from './auth';
import jwt from 'jsonwebtoken';

describe('parseCookies', () => {
  it('parses cookies from header string', () => {
    const cookies = parseCookies('sb-access-token=abc123; other=xyz');
    expect(cookies['sb-access-token']).toBe('abc123');
    expect(cookies['other']).toBe('xyz');
  });

  it('returns empty object for undefined header', () => {
    expect(parseCookies(undefined)).toEqual({});
  });
});

describe('getUserIdFromRequest', () => {
  it('returns null if no token is present', async () => {
    const req = { headers: {} };
    expect(await getUserIdFromRequest(req)).toBeNull();
  });

  it('returns user id from valid JWT in cookie', async () => {
    const token = jwt.sign({ sub: 'user123' }, 'dummy', { algorithm: 'HS256' });
    const req = { headers: { cookie: `sb-access-token=${token}` } };
    expect(await getUserIdFromRequest(req)).toBe('user123');
  });

  it('returns user id from valid JWT in Authorization header', async () => {
    const token = jwt.sign({ sub: 'user456' }, 'dummy', { algorithm: 'HS256' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(await getUserIdFromRequest(req)).toBe('user456');
  });

  it('returns null for invalid JWT', async () => {
    const req = { headers: { cookie: 'sb-access-token=notajwt' } };
    expect(await getUserIdFromRequest(req)).toBeNull();
  });
});
