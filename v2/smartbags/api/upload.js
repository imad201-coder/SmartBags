const { put } = require('@vercel/blob');
const { isAdmin, setCors, parseBody } = require('./_util');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const body = parseBody(req);
  const dataUrl = body.dataUrl;
  const filename = body.filename || 'upload.jpg';

  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'Missing or invalid image data' });
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Could not parse image data' });
  }

  try {
    const contentType = match[1];
    const buffer = Buffer.from(match[2], 'base64');

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not upload the image' });
  }
};
