const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

app.post('/exchange-token', async (req, res) => {
  const { code, code_verifier } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  if (!code_verifier) return res.status(400).json({ error: 'Missing code verifier.' });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code,
    code_verifier,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  console.log('Exchanging code for tokens with params:', Object.fromEntries(params));

  try {
    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Google token endpoint error:', data);
      return res.status(400).json({ error: data.error_description || 'Token exchange failed' });
    }
    res.json(data);
  } catch (err) {
    console.error('Token exchange server error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Token exchange server running on port ${PORT}`);
}); 