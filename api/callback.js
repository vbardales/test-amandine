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
      res.status(401).send('Erreur d\'authentification : ' + data.error_description);
      return;
    }

    const token = data.access_token;
    const provider = 'github';

    // Decap CMS attend un postMessage avec ce format exact
    const content = JSON.stringify({ token, provider });

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head><title>Connexion réussie</title></head>
<body>
  <p>Connexion réussie, fermeture en cours...</p>
  <script>
    (function() {
      var content = ${JSON.stringify(content)};
      var msg = "authorization:github:success:" + content;
      if (window.opener) {
        window.opener.postMessage(msg, window.location.origin);
      }
      window.close();
    })();
  </script>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
