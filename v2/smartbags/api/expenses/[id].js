const { readExpenses, writeExpenses, isAdmin, setCors, parseBody } = require('../_util');

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    try {
      const expenses = await readExpenses();
      const expense = expenses.find(x => x.id === id);
      if (!expense) return res.status(404).json({ error: 'Expense not found' });

      if (body.amount !== undefined) {
        const amount = Number(body.amount);
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
        expense.amount = amount;
      }
      if (body.date !== undefined) expense.date = String(body.date);
      if (body.comment !== undefined) expense.comment = String(body.comment);

      await writeExpenses(expenses);
      return res.status(200).json(expense);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not update the expense' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const expenses = await readExpenses();
      const idx = expenses.findIndex(x => x.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Expense not found' });
      expenses.splice(idx, 1);
      await writeExpenses(expenses);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Could not delete the expense' });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
};
