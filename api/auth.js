// OAuth step 1: Redirect user to GitHub for authorization
export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: 'OAuth not configured' });
  }

  const redirectUri = `${process.env.URL || 'https://csiors-site.vercel.app'}/api/callback`;
  const scope = 'repo,user';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  res.redirect(301, authUrl);
}
