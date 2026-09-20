const { readData, writeData, isAdmin, setCors, parseBody } = require('./_util');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const data = await readData();
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not load store data' });
    }
  }

  if (req.method === 'POST') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const body = parseBody(req);
    if (!body.site || !body.products || !body.provinces) {
      return res.status(400).json({ error: 'Invalid store data' });
    }
    try {
      await writeData(body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not save store data' });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
};
