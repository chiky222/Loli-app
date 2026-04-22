import { useState, useEffect, useRef } from 'react';

export default function TicketModal({ num, ticket, onClose, onSave, onRelease, onTogglePay, confirm }) {
  const [editing, setEditing]   = useState(!ticket);
  const [name,    setName]      = useState('');
  const [phone,   setPhone]     = useState('');
  const [note,    setNote]      = useState('');
  const [paid,    setPaid]      = useState(true);
  const nameRef = useRef();

  useEffect(() => {
    if (ticket) {
      setName(ticket.name || '');
      setPhone(ticket.phone || '');
      setNote(ticket.note || '');
      setPaid(ticket.paid);
      setEditing(false);
    } else {
      setName(''); setPhone(''); setNote(''); setPaid(true);
      setEditing(true);
    }
  }, [num, ticket]);

  useEffect(() => {
    if (editing) setTimeout(() => nameRef.current?.focus(), 300);
  }, [editing]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSave() {
    if (!name.trim()) { alert('Ingresa el nombre del comprador'); return; }
    onSave(num, { name: name.trim(), phone: phone.trim(), note: note.trim(), paid });
    onClose();
  }

  async function handleToggle() {
    const newPaid = await onTogglePay(num);
    setPaid(newPaid);
  }

  const label = num < 10 ? `0${num}` : `${num}`;
  const badgeCls = ticket ? (ticket.paid ? 'badge-paid' : 'badge-unpaid') : 'badge-free';
  const badgeText = ticket ? (ticket.paid ? 'Pago' : 'Debe') : 'Disponible';

  return (
    <div className="modal-backdrop open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-num">#{label}</div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Numero seleccionado</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexDirection: 'column' }}>
            <span className={`modal-badge ${badgeCls}`}>{editing && ticket ? 'Editando' : badgeText}</span>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {editing ? (
          <>
            <div className="form-group">
              <label>Nombre y Apellido *</label>
              <input ref={nameRef} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Maria Garcia" maxLength={60} />
            </div>
            <div className="form-group">
              <label>Telefono</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 11 2345-6789" maxLength={30} />
            </div>
            <div className="form-group">
              <label>Nota (opcional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: vecina, amiga de mama..." maxLength={80} />
            </div>
            <div className="form-group">
              <label>Estado de pago</label>
              <div className="pay-toggle">
                <button className={`pay-opt${paid ? ' sel-paid' : ''}`}   onClick={() => setPaid(true)}>Pago</button>
                <button className={`pay-opt${!paid ? ' sel-unpaid' : ''}`} onClick={() => setPaid(false)}>Debe</button>
              </div>
            </div>
            <button className="btn-save" onClick={handleSave}>Confirmar venta</button>
          </>
        ) : (
          <>
            <div className="buyer-info">
              <div className="buyer-row"><span className="buyer-label">Nombre</span><span className="buyer-value">{ticket?.name || '-'}</span></div>
              <div className="buyer-row"><span className="buyer-label">Telefono</span><span className="buyer-value">{ticket?.phone || '-'}</span></div>
              <div className="buyer-row"><span className="buyer-label">Nota</span><span className="buyer-value">{ticket?.note || '-'}</span></div>
              <div className="buyer-row">
                <span className="buyer-label">Pago</span>
                <span className="buyer-value" style={{ color: ticket?.paid ? 'var(--teal)' : 'var(--unpaid)' }}>
                  {ticket?.paid ? 'Pago' : 'Pendiente'}
                </span>
              </div>
            </div>
            <button className={`btn-pay-toggle ${ticket?.paid ? 'mark-unpaid' : 'mark-paid'}`} onClick={handleToggle}>
              {ticket?.paid ? 'Marcar como pendiente' : 'Marcar como pago'}
            </button>
            <button className="btn-save" style={{ marginTop: 8 }} onClick={() => setEditing(true)}>Editar datos</button>
            <button className="btn-release" onClick={async () => { const ok = await confirm(`Liberar el número #${num}`, 'El número quedará disponible para otra persona.', '🔓'); if (ok) { onRelease(num); onClose(); } }}>
              Liberar numero
            </button>
          </>
        )}
      </div>
    </div>
  );
}
