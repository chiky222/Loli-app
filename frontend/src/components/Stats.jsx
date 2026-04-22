export default function Stats({ rifaData, onReset }) {
  const entries = Object.values(rifaData);
  const sold   = entries.length;
  const paid   = entries.filter(b => b.paid).length;

  return (
    <div className="stats">
      <div className="stat-pill">
        <span className="stat-dot" style={{ background: 'var(--teal)' }} />
        <span>{100 - sold}</span> libres
      </div>
      <div className="stat-pill">
        <span className="stat-dot" style={{ background: 'var(--pink)' }} />
        <span>{sold}</span> vendidos
      </div>
      <div className="stat-pill">
        <span className="stat-dot" style={{ background: 'var(--teal)' }} />
        <span>{paid}</span> pagos
      </div>
      <div className="stat-pill">
        <span className="stat-dot" style={{ background: 'var(--unpaid)' }} />
        <span>{sold - paid}</span> deben
      </div>
      <button className="btn-reset-app" onClick={onReset}>Reiniciar rifa</button>
    </div>
  );
}
