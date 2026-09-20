const { readOrders, writeOrders, isAdmin, setCors, parseBody } = require('../_util');

function genId() {
  return 'SB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const orders = await readOrders();
      return res.status(200).json(orders);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not load orders' });
    }
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const required = ['productName', 'name', 'phone', 'address', 'province', 'deliveryType', 'total'];
    for (const key of required) {
      if (body[key] === undefined || body[key] === null || body[key] === '') {
        return res.status(400).json({ error: `Missing field: ${key}` });
      }
    }

    const order = {
      id: genId(),
      createdAt: new Date().toISOString(),
      status: 'waiting',
      productName: String(body.productName),
      productPrice: Number(body.productPrice) || 0,
      color: body.color ? String(body.color) : null,
      name: String(body.name),
      phone: String(body.phone),
      address: String(body.address),
      province: String(body.province),
      deliveryType: body.deliveryType === 'domicile' ? 'domicile' : 'desk',
      total: Number(body.total) || 0
    };

    try {
      const orders = await readOrders();
      orders.unshift(order);
      await writeOrders(orders);
      return res.status(201).json(order);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not save the order' });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
};
