const { readOrders, writeOrders, isAdmin, setCors, parseBody } = require('../_util');

const VALID_STATUSES = ['waiting', 'confirmed', 'delivered', 'cancelled'];

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const body = parseBody(req);
  const status = body.status;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const orders = await readOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    await writeOrders(orders);
    return res.status(200).json(order);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not update the order' });
  }
};
