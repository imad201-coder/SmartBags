const { readExpenses, writeExpenses, isAdmin, setCors, parseBody } = require('../_util');

function genId() {
  return 'EXP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const expenses = await readExpenses();
      return res.status(200).json(expenses);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not load expenses' });
    }
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const amount = Number(body.amount);
    const date = body.date;
    const comment = body.comment;
    if (!amount || amount <= 0 || !date || !comment) {
      return res.status(400).json({ error: 'Amount, date and reason are all required' });
    }

    const expense = {
      id: genId(),
      createdAt: new Date().toISOString(),
      amount,
      date: String(date),
      comment: String(comment)
    };

    try {
      const expenses = await readExpenses();
      expenses.unshift(expense);
      await writeExpenses(expenses);
      return res.status(201).json(expense);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not save the expense' });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
};
