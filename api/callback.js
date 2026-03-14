export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    res.status(400).json({
      error: 'Paramètres manquants',
      hasCode: !!code,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });
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
      res.send(`<!DOCTYPE html><html><body>
        <h2>Erreur GitHub</h2>
        <p>${data.error}: ${data.error_description || ''}</p>
      </body></html>`);
      return;
    }

    const token = data.access_token;

    if (!token) {
      res.setHeader('Content-Type', 'text/html');
      res.send(`<!DOCTYPE html><html><body>
        <h2>Pas de token reçu</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body></html>`);
      return;
    }

    // Page de debug temporaire - ne ferme PAS la popup
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head><title>Debug OAuth</title></head>
<body>
  <h2>Debug OAuth</h2>
  <ul>
    <li>Token reçu : OUI (${token.substring(0, 6)}...)</li>
    <li>window.opener : <span id="opener">?</span></li>
    <li>Message envoyé : <span id="sent">non</span></li>
  </ul>
  <pre id="log"></pre>
  <script>
    var log = document.getElementById("log");
    var token = ${JSON.stringify(token)};

    log.textContent += "Token: " + token.substring(0, 6) + "...\\n";
    document.getElementById("opener").textContent = window.opener ? "OUI" : "NON";

    if (window.opener) {
      var content = JSON.stringify({ token: token, provider: "github" });
      var msg = "authorization:github:success:" + content;
      log.textContent += "Message: " + msg.substring(0, 60) + "...\\n";

      try {
        window.opener.postMessage(msg, "*");
        document.getElementById("sent").textContent = "OUI";
        log.textContent += "postMessage envoyé !\\n";
      } catch(e) {
        log.textContent += "ERREUR postMessage: " + e.message + "\\n";
      }
    } else {
      log.textContent += "Pas de window.opener !\\n";
    }
  </script>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
