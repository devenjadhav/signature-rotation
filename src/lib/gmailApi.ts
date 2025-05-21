import { getGoogleAccessToken } from './googleOAuth';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

export async function getLatestSentMessageId() {
  const accessToken = getGoogleAccessToken();
  if (!accessToken) throw new Error('No Google access token');

  const resp = await fetch(`${GMAIL_API_BASE}/users/me/messages?q=in:sent&maxResults=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) throw new Error('Failed to fetch sent messages');
  const data = await resp.json();
  if (!data.messages || data.messages.length === 0) return null;
  return data.messages[0].id;
}

export async function updateGmailSignature(signatureHtml: string, sendAsEmail?: string) {
  const accessToken = getGoogleAccessToken();
  if (!accessToken) throw new Error('No Google access token');

  // Get the user's email if not provided
  let email = sendAsEmail;
  if (!email) {
    console.log('Using access token:', accessToken);
    const profileResp = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileText = await profileResp.text();
    console.log('Gmail profile fetch status:', profileResp.status, 'body:', profileText);
    if (!profileResp.ok) throw new Error('Failed to fetch Gmail profile');
    const profile = JSON.parse(profileText);
    email = profile.emailAddress;
  }

  // Update the signature
  const resp = await fetch(`${GMAIL_API_BASE}/users/me/settings/sendAs/${encodeURIComponent(email!)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ signature: signatureHtml }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error?.message || 'Failed to update Gmail signature');
  }
  return await resp.json();
} 