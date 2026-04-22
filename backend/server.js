const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// ── Tickets ──────────────────────────────────────────────────

app.get('/api/tickets', (req, res) => {
  res.json(db.read().tickets);
});

app.put('/api/tickets/:num', (req, res) => {
  const num = parseInt(req.params.num);
  if (isNaN(num) || num < 1 || num > 100)
    return res.status(400).json({ error: 'Número inválido (1-100)' });

  const { name, phone = '', note = '', paid = false } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: 'El nombre es requerido' });

  const data = db.read();
  data.tickets[num] = {
    name:  name.trim(),
    phone: phone.trim(),
    note:  note.trim(),
    paid:  !!paid,
    date:  new Date().toLocaleDateString('es-AR')
  };
  db.write(data);
  res.json({ ok: true });
});

app.patch('/api/tickets/:num/pay', (req, res) => {
  const num  = parseInt(req.params.num);
  const data = db.read();
  if (!data.tickets[num]) return res.status(404).json({ error: 'Ticket no encontrado' });
  data.tickets[num].paid = !data.tickets[num].paid;
  db.write(data);
  res.json({ paid: data.tickets[num].paid });
});

app.delete('/api/tickets/:num', (req, res) => {
  const num  = parseInt(req.params.num);
  const data = db.read();
  if (!data.tickets[num]) return res.status(404).json({ error: 'Ticket no encontrado' });
  delete data.tickets[num];
  db.write(data);
  res.json({ ok: true });
});

// ── Sorteo ───────────────────────────────────────────────────

app.get('/api/sorteo', (req, res) => {
  res.json(db.read().sorteo);
});

app.post('/api/sorteo', (req, res) => {
  const { num, buyer_name = '', buyer_phone = '' } = req.body;
  if (!num) return res.status(400).json({ error: 'num es requerido' });
  const drawn_at = new Date().toLocaleString('es-AR');
  const data = db.read();
  data.sorteo.push({ num, buyer_name, buyer_phone, drawn_at });
  db.write(data);
  res.json({ drawn_at });
});

app.delete('/api/sorteo', (req, res) => {
  const data = db.read();
  data.sorteo = [];
  db.write(data);
  res.json({ ok: true });
});

// ── Reset total ───────────────────────────────────────────────
app.delete('/api/reset', (req, res) => {
  db.write({ tickets: {}, sorteo: [] });
  res.json({ ok: true });
});

// ── Fallback ──────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
