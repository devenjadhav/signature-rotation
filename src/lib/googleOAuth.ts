// Google OAuth 2.0 PKCE utility for SPA

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const SCOPE = 'https://www.googleapis.com/auth/gmail.settings.basic email profile openid';

function base64URLEncode(str: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(hash);
}

export async function startGoogleOAuth() {
  const codeVerifier = base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
  const codeChallenge = await sha256(codeVerifier);
  sessionStorage.setItem('google_oauth_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export async function handleGoogleOAuthCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) throw new Error('No code in callback URL');
  const codeVerifier = sessionStorage.getItem('google_oauth_code_verifier');
  if (!codeVerifier) throw new Error('No code verifier found');

  // Exchange code and code_verifier for tokens via local backend
  const resp = await fetch('http://localhost:4000/exchange-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Failed to get tokens');
  // Store tokens as needed (for demo, just access_token)
  sessionStorage.setItem('google_access_token', data.access_token);
  return data;
}

export function getGoogleAccessToken() {
  return sessionStorage.getItem('google_access_token');
}

export function clearGoogleAccessToken() {
  sessionStorage.removeItem('google_access_token');
} 