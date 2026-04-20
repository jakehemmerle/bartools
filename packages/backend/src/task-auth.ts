import { OAuth2Client } from 'google-auth-library';

const oauthClient = new OAuth2Client();

export function bearerTokenFromHeader(header: string | undefined | null) {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function verifyCloudTaskRequest(args: {
  authorization: string | undefined | null;
  audience: string;
  expectedEmail: string | undefined;
}) {
  const token = bearerTokenFromHeader(args.authorization);
  if (!token || !args.expectedEmail) {
    return false;
  }

  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: args.audience,
    });
    const payload = ticket.getPayload();
    return payload?.email === args.expectedEmail;
  } catch {
    return false;
  }
}
