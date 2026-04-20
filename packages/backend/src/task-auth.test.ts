import { describe, expect, mock, test } from 'bun:test';

let payloadEmail: string | undefined = 'tasks@bartools.test';
let receivedVerifyArgs: unknown = null;
let shouldThrow = false;

mock.module('google-auth-library', () => ({
  OAuth2Client: class {
    async verifyIdToken(args: unknown) {
      receivedVerifyArgs = args;
      if (shouldThrow) {
        throw new Error('bad token');
      }
      return {
        getPayload: () => ({ email: payloadEmail }),
      };
    }
  },
}));

const { bearerTokenFromHeader, verifyCloudTaskRequest } = await import('./task-auth');

describe('Cloud Tasks OIDC auth', () => {
  test('extracts bearer tokens', () => {
    expect(bearerTokenFromHeader('Bearer abc.def')).toBe('abc.def');
    expect(bearerTokenFromHeader('bearer abc.def')).toBe('abc.def');
    expect(bearerTokenFromHeader('Basic abc.def')).toBeNull();
    expect(bearerTokenFromHeader(undefined)).toBeNull();
  });

  test('accepts a valid token for the expected service account email', async () => {
    payloadEmail = 'tasks@bartools.test';
    shouldThrow = false;

    const ok = await verifyCloudTaskRequest({
      authorization: 'Bearer token',
      audience: 'https://example.test',
      expectedEmail: 'tasks@bartools.test',
    });

    expect(ok).toBe(true);
    expect(receivedVerifyArgs).toEqual({
      idToken: 'token',
      audience: 'https://example.test',
    });
  });

  test('rejects invalid, missing, or wrong-email tokens', async () => {
    payloadEmail = 'other@bartools.test';
    shouldThrow = false;
    expect(
      await verifyCloudTaskRequest({
        authorization: 'Bearer token',
        audience: 'https://example.test',
        expectedEmail: 'tasks@bartools.test',
      })
    ).toBe(false);

    shouldThrow = true;
    expect(
      await verifyCloudTaskRequest({
        authorization: 'Bearer token',
        audience: 'https://example.test',
        expectedEmail: 'tasks@bartools.test',
      })
    ).toBe(false);

    shouldThrow = false;
    expect(
      await verifyCloudTaskRequest({
        authorization: undefined,
        audience: 'https://example.test',
        expectedEmail: 'tasks@bartools.test',
      })
    ).toBe(false);
  });
});
