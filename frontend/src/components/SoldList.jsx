import { useState } from 'react';

export default function SoldList({ rifaData, onSelect, onTogglePay }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const entries = Object.entries(rifaData)
    .filter(([num, b]) => {
      if (filter === 'paid'   && !b.paid) return false;
      if (filter === 'unpaid' &&  b.paid) return false;
      if (search) {
        const s = search.toLowerCase();
        return b.name.toLowerCase().includes(s) || num.includes(s) || (b.phone && b.phone.includes(s));
      }
      return true;
    })
    .sort(([a], [b]) => Number(a) - Number(b));

  const filterClass = f => `filter-pill${filter === f ? ` active-${f}` : ''}`;

  return (
    <div className="list-wrapper">
      <div className="list-header">
        <span className="list-title">Vendidos</span>
        <div className="list-controls">
          <button className={filterClass('all')}    onClick={() => setFilter('all')}>Todos</button>
          <button className={filterClass('paid')}   onClick={() => setFilter('paid')}>Pagos</button>
          <button className={filterClass('unpaid')} onClick={() => setFilter('unpaid')}>Deben</button>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="sold-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="ei">{filter === 'unpaid' ? '🎉' : '🎟️'}</div>
            <p>{search ? 'Sin resultados.' : filter === 'unpaid' ? 'Todos pagaron!' : filter === 'paid' ? 'No hay pagos aun.' : 'Todavia no se vendieron numeros.'}</p>
          </div>
        ) : entries.map(([num, b]) => (
          <div key={num} className="sold-item">
            <div className={`sold-num-badge ${b.paid ? 'is-paid' : 'is-unpaid'}`}>{num}</div>
            <div className="sold-details" onClick={() => onSelect(Number(num))}>
              <div className="sold-name">{b.name}</div>
              <div className="sold-contact">{[b.phone, b.note].filter(Boolean).join(' · ') || b.date}</div>
            </div>
            <span className={`pay-badge ${b.paid ? 'paid' : 'unpaid'}`}>{b.paid ? 'Pago' : 'Debe'}</span>
            <button className={`btn-toggle-pay${b.paid ? ' is-paid' : ''}`} onClick={() => onTogglePay(num)}>
              {b.paid ? 'Pago' : 'Debe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
