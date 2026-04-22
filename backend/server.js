const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── Tickets ──────────────────────────────────────────────────

// GET /api/tickets  → { "1": {name,phone,note,paid,date}, ... }
app.get('/api/tickets', (req, res) => {
  const rows = db.prepare('SELECT * FROM tickets').all();
  const data = {};
  for (const row of rows) {
    data[row.num] = {
      name:  row.name,
      phone: row.phone,
      note:  row.note,
      paid:  row.paid === 1,
      date:  row.date,
    };
  }
  res.json(data);
});

// PUT /api/tickets/:num  → crear o actualizar un ticket
app.put('/api/tickets/:num', (req, res) => {
  const num = parseInt(req.params.num);
  if (isNaN(num) || num < 1 || num > 100) {
    return res.status(400).json({ error: 'Número inválido (1-100)' });
  }
  const { name, phone = '', note = '', paid = false } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  const date = new Date().toLocaleDateString('es-AR');
  db.prepare(`
    INSERT INTO tickets (num, name, phone, note, paid, date)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(num) DO UPDATE SET
      name  = excluded.name,
      phone = excluded.phone,
      note  = excluded.note,
      paid  = excluded.paid,
      date  = excluded.date
  `).run(num, name.trim(), phone.trim(), note.trim(), paid ? 1 : 0, date);

  res.json({ ok: true });
});

// PATCH /api/tickets/:num/pay  → alternar estado de pago
app.patch('/api/tickets/:num/pay', (req, res) => {
  const num = parseInt(req.params.num);
  const row = db.prepare('SELECT paid FROM tickets WHERE num = ?').get(num);
  if (!row) return res.status(404).json({ error: 'Ticket no encontrado' });

  const newPaid = row.paid === 0 ? 1 : 0;
  db.prepare('UPDATE tickets SET paid = ? WHERE num = ?').run(newPaid, num);
  res.json({ paid: newPaid === 1 });
});

// DELETE /api/tickets/:num  → liberar número
app.delete('/api/tickets/:num', (req, res) => {
  const num = parseInt(req.params.num);
  const info = db.prepare('DELETE FROM tickets WHERE num = ?').run(num);
  if (info.changes === 0) return res.status(404).json({ error: 'Ticket no encontrado' });
  res.json({ ok: true });
});

// ── Sorteo ───────────────────────────────────────────────────

// GET /api/sorteo  → [{num, buyer_name, buyer_phone, drawn_at}, ...]
app.get('/api/sorteo', (req, res) => {
  const rows = db.prepare('SELECT * FROM sorteo_history ORDER BY id DESC').all();
  res.json(rows);
});

// POST /api/sorteo  → registrar un ganador
app.post('/api/sorteo', (req, res) => {
  const { num, buyer_name = '', buyer_phone = '' } = req.body;
  if (!num) return res.status(400).json({ error: 'num es requerido' });
  const drawn_at = new Date().toLocaleString('es-AR');
  const info = db.prepare(
    'INSERT INTO sorteo_history (num, buyer_name, buyer_phone, drawn_at) VALUES (?, ?, ?, ?)'
  ).run(num, buyer_name, buyer_phone, drawn_at);
  res.json({ id: info.lastInsertRowid, drawn_at });
});

// DELETE /api/sorteo  → reiniciar historial
app.delete('/api/sorteo', (req, res) => {
  db.prepare('DELETE FROM sorteo_history').run();
  res.json({ ok: true });
});

// ── Fallback: servir index.html ───────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
