export default function Debtors({ rifaData, onTogglePay }) {
  const debtors = Object.entries(rifaData)
    .filter(([, b]) => !b.paid)
    .sort(([a], [b]) => Number(a) - Number(b));

  if (!debtors.length) return null;

  return (
    <div className="debtors-wrapper">
      <div className="debtors-header">
        <span className="debtors-title">Deudores</span>
        <span className="debtors-count">{debtors.length} sin pagar</span>
      </div>
      <div className="debtors-list">
        {debtors.map(([num, b]) => (
          <div key={num} className="debtor-item">
            <div className="debtor-num">{num}</div>
            <div className="debtor-details">
              <div className="debtor-name">{b.name}</div>
              <div className="debtor-contact">
                {[b.phone, b.note].filter(Boolean).join(' · ') || b.date}
              </div>
            </div>
            <button className="btn-cobrado" onClick={() => onTogglePay(num)}>Cobrado</button>
          </div>
        ))}
      </div>
    </div>
  );
}
