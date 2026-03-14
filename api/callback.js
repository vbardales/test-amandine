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
      res.setHeader('Content-Type', 'text/html');
      res.status(401).send(`<!DOCTYPE html>
<html><body>
  <p>Erreur d'authentification : ${data.error_description || data.error}</p>
</body></html>`);
      return;
    }

    const token = data.access_token;
    const provider = 'github';

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head><title>Connexion réussie</title></head>
<body>
  <p>Connexion réussie !</p>
  <script>
    (function() {
      function sendMessage() {
        var token = ${JSON.stringify(token)};
        var provider = ${JSON.stringify(provider)};
        var content = JSON.stringify({ token: token, provider: provider });
        var msg = "authorization:" + provider + ":success:" + content;
        var origin = window.location.origin;

        if (window.opener) {
          window.opener.postMessage(msg, origin);
          setTimeout(function() { window.close(); }, 500);
        } else {
          document.body.innerHTML = "<p>Authentification réussie. Tu peux fermer cette fenêtre et retourner sur l'admin.</p>";
        }
      }

      if (document.readyState === "complete") {
        sendMessage();
      } else {
        window.addEventListener("load", sendMessage);
      }
    })();
  </script>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
