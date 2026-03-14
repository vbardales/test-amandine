export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    res.status(400).send('Paramètres manquants');
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const data = await response.json();

    if (data.error) {
      res.redirect('/admin/?error=' + encodeURIComponent(data.error_description || data.error));
      return;
    }

    // Redirige vers l'admin avec le token dans le hash (ne passe pas par le serveur)
    res.redirect('/admin/#token=' + data.access_token);
  } catch (err) {
    res.redirect('/admin/?error=' + encodeURIComponent(err.message));
  }
}
