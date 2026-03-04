const { kv } = require('../lib/kv');
const { withAuth } = require('./_utils/auth');

module.exports = withAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return res.status(500).json({
      error: 'DEPLOY_HOOK_URL no configurado',
    });
  }

  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    const data = await response.json();

    // Update settings with deploy timestamp
    const settings = (await kv.get('settings')) || {};
    settings.lastDeployAt = new Date().toISOString();
    settings.lastDeployStatus = 'triggered';
    await kv.set('settings', settings);

    return res.status(200).json({
      triggered: true,
      deployId: data.job?.id || null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al desplegar' });
  }
});
