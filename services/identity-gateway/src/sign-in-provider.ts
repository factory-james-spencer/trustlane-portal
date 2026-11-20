export const SIGN_IN_TIMEOUT_MS = 5000;

export interface SignInProviderOptions {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenSet {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export class SignInProviderTimeoutError extends Error {
  constructor() {
    super(`sign-in provider timed out after ${SIGN_IN_TIMEOUT_MS} ms`);
    this.name = 'SignInProviderTimeoutError';
  }
}

export async function exchangeAuthorizationCode(code: string, options: SignInProviderOptions): Promise<TokenSet> {
  let response: Response;
  try {
    response = await fetch(new URL('/oauth2/token', options.issuerUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUri,
      }),
      signal: AbortSignal.timeout(SIGN_IN_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') throw new SignInProviderTimeoutError();
    throw error;
  }

  if (!response.ok) {
    throw new Error(`sign-in provider returned HTTP ${response.status}`);
  }
  const body = (await response.json()) as { access_token: string; id_token: string; expires_in: number };
  return { accessToken: body.access_token, idToken: body.id_token, expiresIn: body.expires_in };
}
